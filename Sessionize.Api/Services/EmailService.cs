using Sessionize.Models;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace Sessionize.Api.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendRegistrationConfirmationAsync(string toEmail, string toName, Session session)
    {
        var subject = $"Registration Confirmed: {session.Title}";
        var body = $"""
            <html><body>
            <p>Hi {toName},</p>
            <p>You're registered for <strong>{session.Title}</strong> on
            {session.StartTime:dddd, MMMM d} at {session.StartTime:h:mm tt}.</p>
            <p>We look forward to seeing you there!</p>
            </body></html>
            """;

        await SendAsync(toEmail, toName, subject, body);
    }

    public async Task SendSessionReminderAsync(string toEmail, string toName, Session session)
    {
        var subject = $"Reminder: {session.Title} starts soon";
        var body = $"""
            <html><body>
            <p>Hi {toName},</p>
            <p>Reminder: <strong>{session.Title}</strong> starts in 1 hour at {session.StartTime:h:mm tt}.</p>
            <p>See you there!</p>
            </body></html>
            """;

        await SendAsync(toEmail, toName, subject, body);
    }

    private async Task SendAsync(string toEmail, string toName, string subject, string htmlBody)
    {
        var host = _configuration["Smtp__Host"];
        if (string.IsNullOrWhiteSpace(host))
        {
            _logger.LogWarning("SMTP host is not configured — skipping email to {Email}.", toEmail);
            return;
        }

        var port = int.TryParse(_configuration["Smtp__Port"], out var p) ? p : 587;
        var user = _configuration["Smtp__User"] ?? string.Empty;
        var password = _configuration["Smtp__Password"] ?? string.Empty;
        var from = _configuration["Smtp__From"] ?? "noreply@conference.dev";

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("ConferenceApp", from));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = subject;
        message.Body = new TextPart("html") { Text = htmlBody };

        using var client = new SmtpClient();
        await client.ConnectAsync(host, port, SecureSocketOptions.StartTlsWhenAvailable);
        if (!string.IsNullOrEmpty(user))
            await client.AuthenticateAsync(user, password);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}
