using ConferenceApp.Api.Services;
using ConferenceApp.Models;

namespace ConferenceApp.Api.Tests.Helpers;

/// <summary>No-op IEmailService for use in unit tests — never sends real mail.</summary>
public class NoOpEmailService : IEmailService
{
    public Task SendRegistrationConfirmationAsync(string toEmail, string toName, Session session)
        => Task.CompletedTask;

    public Task SendSessionReminderAsync(string toEmail, string toName, Session session)
        => Task.CompletedTask;
}
