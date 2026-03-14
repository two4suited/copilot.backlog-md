using ConferenceApp.Models;

namespace ConferenceApp.Api.Services;

public interface IEmailService
{
    Task SendRegistrationConfirmationAsync(string toEmail, string toName, Session session);
    Task SendSessionReminderAsync(string toEmail, string toName, Session session);
}
