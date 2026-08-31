using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using QrPortal.Application.Abstractions;
using QrPortal.Application.Contracts;
using QrPortal.Infrastructure.Persistence;
using Testcontainers.PostgreSql;

namespace QrPortal.IntegrationTests;

public sealed class PostgresWorkflowTests
{
    [Fact]
    public void Database_factory_replaces_the_application_connection_string()
    {
        const string connectionString = "Host=database.test;Port=5433;Database=qrportal;Username=tester;Password=test-password";
        using var factory = new DatabaseApiFactory(connectionString);
        using var scope = factory.Services.CreateScope();

        var configured = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>().Database.GetConnectionString();

        Assert.Equal(connectionString, configured);
    }

    [Fact]
    public async Task Database_factory_exposes_anonymous_csrf_token()
    {
        const string connectionString = "Host=database.test;Database=qrportal;Username=tester;Password=test-password";
        using var factory = new DatabaseApiFactory(connectionString);
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });

        var response = await client.GetAsync("/api/v1/auth/csrf");
        var token = await ReadCsrfToken(response);

        Assert.False(string.IsNullOrWhiteSpace(token));
        Assert.Contains(response.Headers.GetValues("Set-Cookie"), value => value.StartsWith("__Host-qrportal_antiforgery=", StringComparison.Ordinal));
    }

    [Fact]
    public async Task Database_factory_rejects_mutation_without_csrf_token()
    {
        const string connectionString = "Host=database.test;Database=qrportal;Username=tester;Password=test-password";
        using var factory = new DatabaseApiFactory(connectionString);
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });

        var response = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest("tester@qrportal.test", "StrongPass123"));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [DockerFact]
    public async Task Registration_csrf_migrations_and_store_isolation_work_together()
    {
        await using var postgres = new PostgreSqlBuilder("postgres:17-alpine").Build();
        await postgres.StartAsync();
        await using var factory = new DatabaseApiFactory(postgres.GetConnectionString());
        using (var scope = factory.Services.CreateScope())
        {
            await scope.ServiceProvider.GetRequiredService<ApplicationDbContext>().Database.MigrateAsync();
        }

        var owner = await AuthenticatedClient(factory, "owner@qrportal.test");
        var storeResponse = await owner.PostAsJsonAsync("/api/v1/stores", new CreateStoreRequest("Loja do Owner", "loja-owner"));
        storeResponse.EnsureSuccessStatusCode();
        var store = await storeResponse.Content.ReadFromJsonAsync<StoreDto>();
        Assert.NotNull(store);

        var intruder = await AuthenticatedClient(factory, "intruder@qrportal.test");
        var forbiddenRead = await intruder.GetAsync($"/api/v1/stores/{store.Id}");

        Assert.Equal(HttpStatusCode.NotFound, forbiddenRead.StatusCode);
        var forbiddenProblem = await forbiddenRead.Content.ReadFromJsonAsync<Microsoft.AspNetCore.Mvc.ProblemDetails>();
        Assert.NotNull(forbiddenProblem);
        Assert.Equal("O recurso solicitado não foi encontrado.", forbiddenProblem.Detail);
        Assert.DoesNotContain("acesso", forbiddenProblem.Detail, StringComparison.OrdinalIgnoreCase);

        using var auditScope = factory.Services.CreateScope();
        var auditEvents = await auditScope.ServiceProvider.GetRequiredService<ApplicationDbContext>().AuditLogs
            .AsNoTracking()
            .Select(log => log.EventName)
            .ToListAsync();
        Assert.Equal(2, auditEvents.Count(eventName => eventName == "auth.registered"));
        Assert.Contains("store.created", auditEvents);
        Assert.Contains("authorization.denied", auditEvents);
    }

    private static async Task<HttpClient> AuthenticatedClient(WebApplicationFactory<Program> factory, string email)
    {
        var client = factory.CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });
        var anonymousCsrf = await client.GetAsync("/api/v1/auth/csrf");
        var anonymousToken = await ReadCsrfToken(anonymousCsrf);
        var antiforgeryCookie = Cookie(anonymousCsrf, "__Host-qrportal_antiforgery");

        using var register = new HttpRequestMessage(HttpMethod.Post, "/api/v1/auth/register")
        {
            Content = JsonContent.Create(new RegisterRequest(email, "StrongPass123"))
        };
        register.Headers.Add("Cookie", antiforgeryCookie);
        register.Headers.Add("X-CSRF-TOKEN", anonymousToken);
        var registered = await client.SendAsync(register);
        registered.EnsureSuccessStatusCode();
        var sessionCookie = Cookie(registered, "__Host-qrportal_session");

        using var refresh = new HttpRequestMessage(HttpMethod.Get, "/api/v1/auth/csrf");
        refresh.Headers.Add("Cookie", $"{antiforgeryCookie}; {sessionCookie}");
        var authenticatedCsrf = await client.SendAsync(refresh);
        var authenticatedToken = await ReadCsrfToken(authenticatedCsrf);
        var refreshedAntiforgery = CookieOrDefault(authenticatedCsrf, "__Host-qrportal_antiforgery", antiforgeryCookie);

        client.DefaultRequestHeaders.Add("Cookie", $"{refreshedAntiforgery}; {sessionCookie}");
        client.DefaultRequestHeaders.Add("X-CSRF-TOKEN", authenticatedToken);
        return client;
    }

    private static async Task<string> ReadCsrfToken(HttpResponseMessage response)
    {
        if (!response.IsSuccessStatusCode)
        {
            var problem = await response.Content.ReadAsStringAsync();
            Assert.Fail($"Falha ao obter CSRF ({(int)response.StatusCode}): {problem}");
        }
        var payload = await response.Content.ReadFromJsonAsync<CsrfResponse>();
        Assert.NotNull(payload);
        Assert.False(string.IsNullOrWhiteSpace(payload.Token));
        return payload.Token;
    }

    private static string Cookie(HttpResponseMessage response, string name)
        => response.Headers.GetValues("Set-Cookie").Select(value => value.Split(';')[0]).Single(value => value.StartsWith(name, StringComparison.Ordinal));

    private static string CookieOrDefault(HttpResponseMessage response, string name, string fallback)
        => response.Headers.TryGetValues("Set-Cookie", out var values)
            ? values.Select(value => value.Split(';')[0]).FirstOrDefault(value => value.StartsWith(name, StringComparison.Ordinal)) ?? fallback
            : fallback;
}

public sealed record CsrfResponse(string Token);

public sealed class DatabaseApiFactory(string connectionString) : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration((_, configuration) => configuration.AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["ConnectionStrings:DefaultConnection"] = connectionString,
            ["AllowedHosts"] = "localhost;127.0.0.1",
            ["Frontend:Origin"] = "https://localhost",
            ["Storage:Provider"] = "Local",
            ["Storage:LocalRoot"] = Path.Combine(Path.GetTempPath(), "qrportal-postgres-tests")
        }));
        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<ApplicationDbContext>();
            services.RemoveAll<DbContextOptions<ApplicationDbContext>>();
            services.AddDbContext<ApplicationDbContext>(options => options.UseNpgsql(connectionString));
            services.RemoveAll<ITransactionalEmailSender>();
            services.AddSingleton<ITransactionalEmailSender, NoOpEmailSender>();
        });
    }
}

public sealed class NoOpEmailSender : ITransactionalEmailSender
{
    public Task SendAsync(string recipient, string subject, string htmlBody, CancellationToken cancellationToken) => Task.CompletedTask;
}

public sealed class DockerFactAttribute : FactAttribute
{
    public DockerFactAttribute()
    {
        if (OperatingSystem.IsWindows() && string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("DOCKER_HOST")))
        {
            Skip = "Docker não está disponível neste ambiente local.";
        }
        else if (!OperatingSystem.IsWindows() && !File.Exists("/var/run/docker.sock") && string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("DOCKER_HOST")))
        {
            Skip = "Docker não está disponível.";
        }
    }
}
