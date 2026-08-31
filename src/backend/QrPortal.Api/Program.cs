using System.Net;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.FileProviders;
using QrPortal.Api.Infrastructure;
using QrPortal.Infrastructure;
using QrPortal.Infrastructure.Configuration;

if (string.Equals(Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"), Environments.Development, StringComparison.OrdinalIgnoreCase))
{
    DotEnvLoader.LoadNearest(Directory.GetCurrentDirectory());
}

var builder = WebApplication.CreateBuilder(args);
var isE2E = builder.Environment.IsEnvironment("E2E");
var useSecureCookies = !builder.Environment.IsDevelopment() && !isE2E;
StorageConfiguration.ApplyAwsS3Compatibility(builder.Configuration);
var configuredConnectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (!string.IsNullOrWhiteSpace(configuredConnectionString))
{
    builder.Configuration["ConnectionStrings:DefaultConnection"] = PostgresConnectionString.Normalize(configuredConnectionString);
}

builder.Logging.ClearProviders();
builder.Logging.AddJsonConsole(options => options.IncludeScopes = true);
builder.Services.AddProblemDetails(options => options.CustomizeProblemDetails = context =>
{
    var problem = context.ProblemDetails;
    var status = problem.Status ?? context.HttpContext.Response.StatusCode;
    if (!problem.Extensions.ContainsKey("traceId")) problem.Extensions["traceId"] = context.HttpContext.TraceIdentifier;
    if (!problem.Extensions.ContainsKey("code")) problem.Extensions["code"] = status switch
    {
        StatusCodes.Status400BadRequest => "validation_error",
        StatusCodes.Status401Unauthorized => "authentication_required",
        StatusCodes.Status403Forbidden => "forbidden",
        StatusCodes.Status404NotFound => "not_found",
        StatusCodes.Status429TooManyRequests => "rate_limit_exceeded",
        _ when status >= 500 => "internal_error",
        _ => "request_failed"
    };
});
builder.Services.AddExceptionHandler<ApiExceptionHandler>();
builder.Services.AddControllersWithViews(options => options.Filters.Add(new AutoValidateAntiforgeryTokenAttribute()));
builder.Services.Configure<ApiBehaviorOptions>(options => options.InvalidModelStateResponseFactory = context =>
{
    var problem = new ValidationProblemDetails(context.ModelState)
    {
        Status = StatusCodes.Status400BadRequest,
        Title = "Dados inválidos",
        Type = "https://qrportal.com/problems/validation_error"
    };
    problem.Extensions["code"] = "validation_error";
    problem.Extensions["traceId"] = context.HttpContext.TraceIdentifier;
    var result = new BadRequestObjectResult(problem);
    result.ContentTypes.Add("application/problem+json");
    return result;
});
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();
builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-CSRF-TOKEN";
    options.Cookie.Name = useSecureCookies ? "__Host-qrportal_antiforgery" : "qrportal_antiforgery_local";
    options.Cookie.HttpOnly = true;
    options.Cookie.SecurePolicy = useSecureCookies ? CookieSecurePolicy.Always : CookieSecurePolicy.SameAsRequest;
    options.Cookie.SameSite = SameSiteMode.Lax;
});
builder.Services.AddInfrastructure(builder.Configuration);
if (!useSecureCookies)
{
    builder.Services.ConfigureApplicationCookie(options =>
    {
        options.Cookie.Name = "qrportal_session_local";
        options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
    });
}
var dataProtectionKeysPath = builder.Configuration["DataProtection:KeysPath"];
if (!string.IsNullOrWhiteSpace(dataProtectionKeysPath))
{
    builder.Services.AddDataProtection()
        .PersistKeysToFileSystem(new DirectoryInfo(Path.GetFullPath(dataProtectionKeysPath)))
        .SetApplicationName("QRPortal");
}

var frontend = builder.Configuration.GetSection(FrontendOptions.Section).Get<FrontendOptions>() ?? new FrontendOptions();
builder.Services.AddCors(options => options.AddPolicy("frontend", policy => policy
    .WithOrigins(frontend.Origin)
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials()));
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = (context, _) =>
    {
        var logger = context.HttpContext.RequestServices.GetRequiredService<ILoggerFactory>().CreateLogger("QrPortal.RateLimiting");
        logger.LogWarning(
            "Rate limit rejected {RequestMethod} {RequestRoute}. TraceId: {TraceId}",
            context.HttpContext.Request.Method,
            (context.HttpContext.GetEndpoint() as Microsoft.AspNetCore.Routing.RouteEndpoint)?.RoutePattern.RawText ?? "unmatched",
            context.HttpContext.TraceIdentifier);
        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
            context.HttpContext.Response.Headers.RetryAfter = Math.Ceiling(retryAfter.TotalSeconds).ToString(System.Globalization.CultureInfo.InvariantCulture);
        return ValueTask.CompletedTask;
    };
    options.AddPolicy("auth", context => RateLimitPartition.GetFixedWindowLimiter(
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 10, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
    options.AddPolicy("upload", context => RateLimitPartition.GetTokenBucketLimiter(
        context.User.Identity?.Name ?? context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new TokenBucketRateLimiterOptions { TokenLimit = 10, TokensPerPeriod = 5, ReplenishmentPeriod = TimeSpan.FromMinutes(1), AutoReplenishment = true, QueueLimit = 0 }));
    options.AddPolicy("public-menu", context => RateLimitPartition.GetFixedWindowLimiter(
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 120, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
});
builder.Services.AddHealthChecks()
    .AddCheck<DatabaseHealthCheck>("postgres", tags: ["ready"])
    .AddCheck<ExternalServicesConfigurationHealthCheck>("external-configuration", tags: ["ready"]);
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.ForwardLimit = 1;
    foreach (var configuredProxy in builder.Configuration.GetSection("ReverseProxy:KnownProxies").Get<string[]>() ?? [])
    {
        if (!IPAddress.TryParse(configuredProxy, out var address))
            throw new InvalidOperationException($"ReverseProxy:KnownProxies contém um endereço inválido: {configuredProxy}.");
        options.KnownProxies.Add(address);
    }
});

var googleClientId = builder.Configuration["Authentication:Google:ClientId"];
var googleClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
if (!string.IsNullOrWhiteSpace(googleClientId) && !string.IsNullOrWhiteSpace(googleClientSecret))
{
    builder.Services.AddAuthentication().AddGoogle(options =>
    {
        options.ClientId = googleClientId;
        options.ClientSecret = googleClientSecret;
    });
}

var app = builder.Build();
app.UseForwardedHeaders();
app.UseMiddleware<CorrelationIdMiddleware>();
app.UseMiddleware<RequestLoggingMiddleware>();
app.UseExceptionHandler();
app.UseStatusCodePages(async statusCodeContext =>
{
    var response = statusCodeContext.HttpContext.Response;
    var (title, detail, code) = response.StatusCode switch
    {
        StatusCodes.Status401Unauthorized => ("Autenticação necessária", "Faça login para acessar este recurso.", "authentication_required"),
        StatusCodes.Status403Forbidden => ("Acesso negado", "Você não possui permissão para executar esta operação.", "forbidden"),
        StatusCodes.Status404NotFound => ("Recurso não encontrado", "O recurso solicitado não foi encontrado.", "not_found"),
        StatusCodes.Status429TooManyRequests => ("Muitas solicitações", "Aguarde antes de tentar novamente.", "rate_limit_exceeded"),
        _ => ("Não foi possível concluir a solicitação", "A solicitação não pôde ser concluída.", "request_failed")
    };
    var problem = new ProblemDetails
    {
        Status = response.StatusCode,
        Title = title,
        Detail = detail,
        Type = $"https://qrportal.com/problems/{code}"
    };
    problem.Extensions["code"] = code;
    problem.Extensions["traceId"] = statusCodeContext.HttpContext.TraceIdentifier;
    await response.WriteAsJsonAsync(
        problem,
        options: null,
        contentType: "application/problem+json",
        cancellationToken: statusCodeContext.HttpContext.RequestAborted);
});
app.UseMiddleware<SecurityHeadersMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsDevelopment() && !isE2E)
{
    app.UseHsts();
    app.UseHttpsRedirection();
}
app.UseCors("frontend");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.UseAntiforgery();

var storage = builder.Configuration.GetSection(StorageOptions.Section).Get<StorageOptions>() ?? new StorageOptions();
if (storage.Provider.Equals("Local", StringComparison.OrdinalIgnoreCase))
{
    var root = Path.GetFullPath(storage.LocalRoot);
    Directory.CreateDirectory(root);
    app.UseStaticFiles(new StaticFileOptions { FileProvider = new PhysicalFileProvider(root), RequestPath = "/files" });
}

app.MapControllers();
app.MapHealthChecks("/health/live", new HealthCheckOptions { Predicate = _ => false });
app.MapHealthChecks("/health/ready", new HealthCheckOptions { Predicate = check => check.Tags.Contains("ready") });
app.Run();

public partial class Program;
