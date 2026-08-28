using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using QrPortal.Application.Abstractions;
using QrPortal.Infrastructure.Configuration;

namespace QrPortal.Infrastructure.Email;

public sealed class SmtpEmailSender(IOptions<EmailOptions> options) : ITransactionalEmailSender
{
    public async Task SendAsync(string recipient, string subject, string htmlBody, CancellationToken cancellationToken)
    {
        var settings = options.Value;
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(settings.SenderName, settings.SenderEmail));
        message.To.Add(MailboxAddress.Parse(recipient));
        message.Subject = subject;
        message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

        using var client = new SmtpClient();
        await client.ConnectAsync(settings.Host, settings.Port, settings.UseSsl ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.Auto, cancellationToken);
        if (!string.IsNullOrWhiteSpace(settings.Username))
        {
            await client.AuthenticateAsync(settings.Username, settings.Password ?? string.Empty, cancellationToken);
        }
        await client.SendAsync(message, cancellationToken);
        await client.DisconnectAsync(true, cancellationToken);
    }
}
