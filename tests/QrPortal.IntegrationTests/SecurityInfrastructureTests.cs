using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using QrPortal.Api.Infrastructure;
using QrPortal.Infrastructure.Configuration;

namespace QrPortal.IntegrationTests;

public sealed class SecurityInfrastructureTests
{
    [Fact]
    public async Task Request_log_omits_query_string_and_sensitive_values()
    {
        var logger = new CapturingLogger<RequestLoggingMiddleware>();
        var middleware = new RequestLoggingMiddleware(_ => Task.CompletedTask, logger);
        var context = new DefaultHttpContext();
        context.Request.Method = HttpMethods.Get;
        context.Request.Path = "/api/v1/auth/confirm-email";
        context.Request.QueryString = new QueryString("?token=super-secret&email=user@example.com");
        context.TraceIdentifier = "safe-trace";

        await middleware.InvokeAsync(context);

        var message = Assert.Single(logger.Messages);
        Assert.Contains("unmatched", message, StringComparison.Ordinal);
        Assert.DoesNotContain("super-secret", message, StringComparison.Ordinal);
        Assert.DoesNotContain("user@example.com", message, StringComparison.Ordinal);
        Assert.DoesNotContain("?token", message, StringComparison.Ordinal);
    }

    [Fact]
    public async Task External_configuration_health_check_accepts_local_development_providers()
    {
        var check = new ExternalServicesConfigurationHealthCheck(
            Options.Create(new StorageOptions { Provider = "Local", LocalRoot = "./data/uploads", PublicBaseUrl = "http://localhost/files" }),
            Options.Create(new EmailOptions { Provider = "LocalOutbox", LocalOutboxRoot = "./data/emails", SenderEmail = "no-reply@example.test" }));

        var result = await check.CheckHealthAsync(new HealthCheckContext());

        Assert.Equal(HealthStatus.Healthy, result.Status);
    }

    [Fact]
    public async Task External_configuration_health_check_rejects_incomplete_production_providers_without_exposing_credentials()
    {
        var check = new ExternalServicesConfigurationHealthCheck(
            Options.Create(new StorageOptions
            {
                Provider = "S3",
                PublicBaseUrl = "https://cdn.example.test",
                S3 = new S3Options { ServiceUrl = "https://s3.example.test", Bucket = "", AccessKey = "visible-access", SecretKey = "visible-secret" }
            }),
            Options.Create(new EmailOptions { Provider = "Smtp", Host = "", Port = 587, SenderEmail = "no-reply@example.test", Password = "smtp-secret" }));

        var result = await check.CheckHealthAsync(new HealthCheckContext());

        Assert.Equal(HealthStatus.Unhealthy, result.Status);
        Assert.DoesNotContain("visible-access", result.Description, StringComparison.Ordinal);
        Assert.DoesNotContain("visible-secret", result.Description, StringComparison.Ordinal);
        Assert.DoesNotContain("smtp-secret", result.Description, StringComparison.Ordinal);
    }

    private sealed class CapturingLogger<T> : ILogger<T>
    {
        public List<string> Messages { get; } = [];

        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;
        public bool IsEnabled(LogLevel logLevel) => true;
        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
            => Messages.Add(formatter(state, exception));
    }
}
