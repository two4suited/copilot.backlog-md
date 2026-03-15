using Sessionize.Api.Data;
using Sessionize.Models;
using Microsoft.EntityFrameworkCore;

namespace Sessionize.Api.Services;

public class SessionReminderService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<SessionReminderService> _logger;
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(5);

    public SessionReminderService(IServiceScopeFactory scopeFactory, ILogger<SessionReminderService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessRemindersAsync(stoppingToken);
                    await Task.Delay(Interval, stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    // Normal shutdown — exit gracefully
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing session reminders.");
                    await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
                }
            }
        }
        catch (OperationCanceledException)
        {
            // Cancellation raised during error-recovery delay — exit gracefully
        }
    }

    private async Task ProcessRemindersAsync(CancellationToken ct)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<ConferenceDbContext>();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

        var now = DateTime.UtcNow;
        var windowStart = now.AddMinutes(55);
        var windowEnd = now.AddMinutes(65);

        var registrations = await db.Registrations
            .IgnoreQueryFilters()
            .Include(r => r.User)
            .Include(r => r.Session)
            .Where(r => !r.IsDeleted
                     && !r.ReminderSent
                     && r.Session.StartTime >= windowStart
                     && r.Session.StartTime <= windowEnd)
            .ToListAsync(ct);

        if (registrations.Count == 0)
            return;

        _logger.LogInformation("Sending {Count} session reminders.", registrations.Count);

        foreach (var registration in registrations)
        {
            try
            {
                await emailService.SendSessionReminderAsync(
                    registration.User.Email,
                    registration.User.Name,
                    registration.Session);

                registration.ReminderSent = true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send reminder for registration {Id}.", registration.Id);
            }
        }

        // Persist ReminderSent flags — use a tracking context for the updates
        await using var trackingScope = _scopeFactory.CreateAsyncScope();
        var trackingDb = trackingScope.ServiceProvider.GetRequiredService<ConferenceDbContext>();

        foreach (var registration in registrations.Where(r => r.ReminderSent))
        {
            await trackingDb.Registrations
                .IgnoreQueryFilters()
                .Where(r => r.Id == registration.Id)
                .ExecuteUpdateAsync(s => s.SetProperty(r => r.ReminderSent, true), ct);
        }
    }
}
