using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using System.Text.Json;

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
        Assert.Equal("DENY", response.Headers.GetValues("X-Frame-Options").Single());
        Assert.True(response.Headers.Contains("X-Correlation-ID"));
    }

    [Fact]
    public async Task Anonymous_private_request_is_rejected()
    {
        var response = await client.GetAsync("/api/v1/stores");

        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        using var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.Equal("authentication_required", body.RootElement.GetProperty("code").GetString());
        Assert.Equal(response.Headers.GetValues("X-Correlation-ID").Single(), body.RootElement.GetProperty("traceId").GetString());
    }

    [Fact]
    public async Task Invalid_correlation_id_is_replaced_but_valid_id_is_preserved()
    {
        using var invalidRequest = new HttpRequestMessage(HttpMethod.Get, "/health/live");
        invalidRequest.Headers.Add("X-Correlation-ID", "../../bad?token=secret");
        var invalidResponse = await client.SendAsync(invalidRequest);
        var generated = invalidResponse.Headers.GetValues("X-Correlation-ID").Single();

        Assert.True(Guid.TryParseExact(generated, "N", out _));

        using var validRequest = new HttpRequestMessage(HttpMethod.Get, "/health/live");
        validRequest.Headers.Add("X-Correlation-ID", "frontend-request_123.test");
        var validResponse = await client.SendAsync(validRequest);

        Assert.Equal("frontend-request_123.test", validResponse.Headers.GetValues("X-Correlation-ID").Single());
    }

    [Fact]
    public async Task Unknown_route_returns_sanitized_problem_details()
    {
        var response = await client.GetAsync("/api/v1/does-not-exist?token=must-not-be-reflected");

        Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        using var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.Equal("not_found", body.RootElement.GetProperty("code").GetString());
        Assert.DoesNotContain("must-not-be-reflected", body.RootElement.ToString(), StringComparison.Ordinal);
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
