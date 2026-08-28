using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using QrPortal.Infrastructure.Configuration;

namespace QrPortal.Infrastructure.Persistence;

public sealed class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        DotEnvLoader.LoadNearest(Directory.GetCurrentDirectory());
        var connectionString = PostgresConnectionString.Normalize(
            Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
            ?? "Host=localhost;Port=5432;Database=qrportal;Username=qrportal;Password=qrportal_dev");
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql(connectionString)
            .Options;
        return new ApplicationDbContext(options);
    }
}
