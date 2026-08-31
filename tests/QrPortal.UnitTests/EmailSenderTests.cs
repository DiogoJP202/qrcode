using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using QrPortal.Infrastructure.Configuration;
using QrPortal.Infrastructure.Email;

namespace QrPortal.UnitTests;

public sealed class EmailSenderTests
{
    [Fact]
    public async Task Local_outbox_writes_openable_html_without_pii_in_the_file_name()
    {
        var root = Path.Combine(Path.GetTempPath(), $"qrportal-email-{Guid.CreateVersion7():N}");
        try
        {
            var options = Options.Create(new EmailOptions { Provider = "LocalOutbox", LocalOutboxRoot = root });
            var sender = new LocalOutboxEmailSender(options, NullLogger<LocalOutboxEmailSender>.Instance);

            await sender.SendAsync(
                "owner@example.test",
                "Confirme <seu> e-mail",
                "<p><a href=\"http://localhost:4200/confirmar-email?token=test\">Confirmar e-mail</a></p>",
                CancellationToken.None);

            var file = Assert.Single(Directory.GetFiles(root, "*.html"));
            Assert.DoesNotContain("owner", Path.GetFileName(file), StringComparison.OrdinalIgnoreCase);
            var contents = await File.ReadAllTextAsync(file, CancellationToken.None);
            Assert.Contains("owner@example.test", contents, StringComparison.Ordinal);
            Assert.Contains("Confirme &lt;seu&gt; e-mail", contents, StringComparison.Ordinal);
            Assert.Contains("http://localhost:4200/confirmar-email?token=test", contents, StringComparison.Ordinal);
        }
        finally
        {
            if (Directory.Exists(root)) Directory.Delete(root, recursive: true);
        }
    }
}
