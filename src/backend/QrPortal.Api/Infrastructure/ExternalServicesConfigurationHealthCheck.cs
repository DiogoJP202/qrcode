using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;
using QrPortal.Infrastructure.Configuration;

namespace QrPortal.Api.Infrastructure;

public sealed class ExternalServicesConfigurationHealthCheck(
    IOptions<StorageOptions> storageOptions,
    IOptions<EmailOptions> emailOptions) : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        var failures = new List<string>();
        ValidateStorage(storageOptions.Value, failures);
        ValidateEmail(emailOptions.Value, failures);

        var result = failures.Count == 0
            ? HealthCheckResult.Healthy("Storage e e-mail possuem configuração mínima válida.")
            : HealthCheckResult.Unhealthy(string.Join(' ', failures));
        return Task.FromResult(result);
    }

    private static void ValidateStorage(StorageOptions options, ICollection<string> failures)
    {
        if (options.Provider.Equals("Local", StringComparison.OrdinalIgnoreCase))
        {
            if (string.IsNullOrWhiteSpace(options.LocalRoot) || string.IsNullOrWhiteSpace(options.PublicBaseUrl))
                failures.Add("Storage local incompleto.");
            return;
        }

        if (!options.Provider.Equals("S3", StringComparison.OrdinalIgnoreCase))
        {
            failures.Add("Provedor de storage inválido.");
            return;
        }

        if (string.IsNullOrWhiteSpace(options.S3.ServiceUrl)
            || string.IsNullOrWhiteSpace(options.S3.Bucket)
            || string.IsNullOrWhiteSpace(options.S3.AccessKey)
            || string.IsNullOrWhiteSpace(options.S3.SecretKey)
            || string.IsNullOrWhiteSpace(options.PublicBaseUrl))
        {
            failures.Add("Storage S3 incompleto.");
        }
    }

    private static void ValidateEmail(EmailOptions options, ICollection<string> failures)
    {
        if (options.Provider.Equals("LocalOutbox", StringComparison.OrdinalIgnoreCase))
        {
            if (string.IsNullOrWhiteSpace(options.LocalOutboxRoot) || string.IsNullOrWhiteSpace(options.SenderEmail))
                failures.Add("Outbox local incompleto.");
            return;
        }

        if (!options.Provider.Equals("Smtp", StringComparison.OrdinalIgnoreCase))
        {
            failures.Add("Provedor de e-mail inválido.");
            return;
        }

        if (string.IsNullOrWhiteSpace(options.Host)
            || options.Port is <= 0 or > 65535
            || string.IsNullOrWhiteSpace(options.SenderEmail))
        {
            failures.Add("SMTP incompleto.");
        }
    }
}
