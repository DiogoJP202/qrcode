using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using QrPortal.Infrastructure.Configuration;
using QrPortal.Infrastructure.Media;

namespace QrPortal.IntegrationTests;

public sealed class ExternalStorageTests
{
    [ExternalStorageFact]
    public async Task Configured_s3_storage_supports_public_roundtrip()
    {
        DotEnvLoader.LoadNearest(Directory.GetCurrentDirectory());
        var configuration = new ConfigurationBuilder().AddEnvironmentVariables().Build();
        Assert.True(StorageConfiguration.ApplyAwsS3Compatibility(configuration));

        var options = new StorageOptions
        {
            Provider = configuration["Storage:Provider"]!,
            PublicBaseUrl = configuration["Storage:PublicBaseUrl"]!,
            S3 = new S3Options
            {
                ServiceUrl = configuration["Storage:S3:ServiceUrl"]!,
                Bucket = configuration["Storage:S3:Bucket"]!,
                Region = configuration["Storage:S3:Region"]!,
                AccessKey = configuration["Storage:S3:AccessKey"]!,
                SecretKey = configuration["Storage:S3:SecretKey"]!
            }
        };
        using var storage = new S3CompatibleFileStorage(Options.Create(options));
        var key = $"diagnostics/{Guid.CreateVersion7():N}.txt";
        var payload = Encoding.UTF8.GetBytes("qrportal-storage-probe");
        var uploaded = false;

        try
        {
            await storage.PutAsync(key, new MemoryStream(payload), "text/plain", CancellationToken.None);
            uploaded = true;
            using var http = new HttpClient();
            using var response = await http.GetAsync(storage.GetPublicUrl(key));
            response.EnsureSuccessStatusCode();
            Assert.Equal(payload, await response.Content.ReadAsByteArrayAsync());
        }
        finally
        {
            if (uploaded) await storage.DeleteAsync(key, CancellationToken.None);
        }
    }
}

public sealed class ExternalStorageFactAttribute : FactAttribute
{
    public ExternalStorageFactAttribute()
    {
        if (!string.Equals(Environment.GetEnvironmentVariable("QRPORTAL_RUN_EXTERNAL_STORAGE_TESTS"), "1", StringComparison.Ordinal))
        {
            Skip = "Teste externo de storage não solicitado.";
        }
    }
}
