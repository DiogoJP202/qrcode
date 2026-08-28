using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace QrPortal.IntegrationTests;

public sealed class ApiFoundationTests : IClassFixture<QrPortalApiFactory>
{
    private readonly HttpClient client;

    public ApiFoundationTests(QrPortalApiFactory factory)
    {
        client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });
    }

    [Fact]
    public async Task Liveness_endpoint_is_available_and_adds_security_headers()
    {
        var response = await client.GetAsync("/health/live");

        response.EnsureSuccessStatusCode();
        Assert.Equal("nosniff", response.Headers.GetValues("X-Content-Type-Options").Single());
        Assert.True(response.Headers.Contains("X-Correlation-ID"));
    }

    [Fact]
    public async Task Anonymous_private_request_is_rejected()
    {
        var response = await client.GetAsync("/api/v1/stores");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }
}

public sealed class QrPortalApiFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration((_, configuration) => configuration.AddInMemoryCollection(
            new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = "Host=localhost;Database=qrportal_tests;Username=postgres;Password=postgres",
                ["AllowedHosts"] = "localhost;127.0.0.1",
                ["Frontend:Origin"] = "https://localhost:4200",
                ["Storage:Provider"] = "Local",
                ["Storage:LocalRoot"] = Path.Combine(Path.GetTempPath(), "qrportal-integration-tests")
            }));
    }
}
