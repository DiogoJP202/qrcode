using System.Net;
using System.Text;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using QrPortal.Application.Abstractions;
using QrPortal.Infrastructure.Configuration;

namespace QrPortal.Infrastructure.Email;

public sealed class LocalOutboxEmailSender(IOptions<EmailOptions> options, ILogger<LocalOutboxEmailSender> logger) : ITransactionalEmailSender
{
    public async Task SendAsync(string recipient, string subject, string htmlBody, CancellationToken cancellationToken)
    {
        var root = Path.GetFullPath(options.Value.LocalOutboxRoot);
        Directory.CreateDirectory(root);

        var now = DateTimeOffset.UtcNow;
        var fileName = $"{now:yyyyMMddTHHmmssfffZ}-{Guid.CreateVersion7():N}.html";
        var filePath = Path.Combine(root, fileName);
        var document = $$"""
            <!doctype html>
            <html lang="pt-BR">
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>{{WebUtility.HtmlEncode(subject)}}</title>
                <style>
                  body { margin: 0; padding: 32px; background: #f1f5f9; color: #0f172a; font-family: system-ui, sans-serif; }
                  main { max-width: 720px; margin: 0 auto; padding: 32px; border-radius: 16px; background: white; box-shadow: 0 8px 30px rgba(15, 23, 42, .08); }
                  dl { display: grid; grid-template-columns: max-content 1fr; gap: 8px 16px; margin: 0 0 28px; font-size: 14px; }
                  dt { font-weight: 700; color: #475569; }
                  dd { margin: 0; overflow-wrap: anywhere; }
                  .message { padding-top: 24px; border-top: 1px solid #e2e8f0; }
                </style>
              </head>
              <body>
                <main>
                  <dl>
                    <dt>Para</dt><dd>{{WebUtility.HtmlEncode(recipient)}}</dd>
                    <dt>Assunto</dt><dd>{{WebUtility.HtmlEncode(subject)}}</dd>
                    <dt>Gerado em</dt><dd>{{now:O}}</dd>
                  </dl>
                  <div class="message">{{htmlBody}}</div>
                </main>
              </body>
            </html>
            """;

        await File.WriteAllTextAsync(filePath, document, new UTF8Encoding(false), cancellationToken);
        logger.LogInformation("E-mail transacional gravado na caixa local com o identificador {OutboxFile}", fileName);
    }
}
