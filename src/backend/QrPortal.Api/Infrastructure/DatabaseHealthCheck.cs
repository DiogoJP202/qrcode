using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using QrPortal.Infrastructure.Persistence;

namespace QrPortal.Api.Infrastructure;

public sealed class DatabaseHealthCheck(IServiceScopeFactory scopeFactory) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            await using var scope = scopeFactory.CreateAsyncScope();
            var database = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            return await database.Database.CanConnectAsync(cancellationToken)
                ? HealthCheckResult.Healthy("PostgreSQL disponível.")
                : HealthCheckResult.Unhealthy("PostgreSQL indisponível.");
        }
        catch (Exception exception)
        {
            return HealthCheckResult.Unhealthy("Falha ao consultar PostgreSQL.", exception);
        }
    }
}
