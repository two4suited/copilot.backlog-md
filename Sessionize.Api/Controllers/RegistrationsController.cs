using System.Security.Claims;
using System.Text;
using Sessionize.Api.Data;
using Sessionize.Api.DTOs;
using Sessionize.Api.Hubs;
using Sessionize.Api.Services;
using Sessionize.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Sessionize.Api.Controllers;

[ApiController]
public class RegistrationsController : ControllerBase
{
    private readonly ConferenceDbContext _db;
    private readonly IHubContext<SessionHub> _hubContext;
    private readonly IEmailService _emailService;

    public RegistrationsController(ConferenceDbContext db, IHubContext<SessionHub> hubContext, IEmailService emailService)
    {
        _db = db;
        _hubContext = hubContext;
        _emailService = emailService;
    }

    /// <summary>Register the currently authenticated user for a session.</summary>
    /// <param name="sessionId">ID of the session to register for.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Registration successful.</response>
    /// <response code="400">Session is full.</response>
    /// <response code="401">Not authenticated.</response>
    /// <response code="404">Session not found.</response>
    /// <response code="409">Already registered for this session.</response>
    [HttpPost("api/sessions/{sessionId:guid}/register")]
    [Authorize]
    public async Task<ActionResult<RegisterSessionResponse>> Register(Guid sessionId, CancellationToken ct)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized();

        var session = await _db.Sessions.FindAsync([sessionId], ct);
        if (session is null) return NotFound(new { message = "Session not found." });

        // Check for an existing registration (including soft-deleted) to handle re-registration
        var existing = await _db.Registrations
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(r => r.UserId == userId && r.SessionId == sessionId, ct);

        if (existing is not null && !existing.IsDeleted)
            return Conflict(new { message = "Already registered for this session." });

        // Count active registrations to enforce capacity
        var activeCount = await _db.Registrations
            .CountAsync(r => r.SessionId == sessionId, ct);

        if (activeCount >= session.Capacity)
            return BadRequest(new { message = "Session is full." });

        Registration registration;
        if (existing is not null)
        {
            // Reactivate a previously cancelled registration
            existing.IsDeleted = false;
            existing.RegisteredAt = DateTime.UtcNow;
            registration = existing;
        }
        else
        {
            registration = new Registration
            {
                UserId = userId,
                SessionId = sessionId,
                RegisteredAt = DateTime.UtcNow,
            };
            _db.Registrations.Add(registration);
        }

        await _db.SaveChangesAsync(ct);

        var newActiveCount = await _db.Registrations.CountAsync(r => r.SessionId == sessionId, ct);
        await _hubContext.Clients.Group($"session-{sessionId}")
            .SendAsync("SeatsUpdated", new { sessionId = sessionId.ToString(), seatsAvailable = session.Capacity - newActiveCount }, ct);

        var user = await _db.Users.FindAsync([userId], ct);
        if (user is not null)
            _ = _emailService.SendRegistrationConfirmationAsync(user.Email, user.Name, session);

        return Ok(new RegisterSessionResponse(
            registration.Id,
            session.Id,
            session.Title,
            registration.RegisteredAt
        ));
    }

    /// <summary>Cancel the currently authenticated user's registration for a session.</summary>
    /// <param name="sessionId">ID of the session to cancel registration for.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="204">Cancellation successful.</response>
    /// <response code="401">Not authenticated.</response>
    /// <response code="404">Registration not found.</response>
    [HttpDelete("api/sessions/{sessionId:guid}/register")]
    [Authorize]
    public async Task<IActionResult> Cancel(Guid sessionId, CancellationToken ct)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized();

        var registration = await _db.Registrations
            .FirstOrDefaultAsync(r => r.UserId == userId && r.SessionId == sessionId, ct);

        if (registration is null)
            return NotFound(new { message = "Registration not found." });

        registration.IsDeleted = true;
        await _db.SaveChangesAsync(ct);

        var session = await _db.Sessions.FindAsync([sessionId], ct);
        if (session is not null)
        {
            var activeCount = await _db.Registrations.CountAsync(r => r.SessionId == sessionId, ct);
            await _hubContext.Clients.Group($"session-{sessionId}")
                .SendAsync("SeatsUpdated", new { sessionId = sessionId.ToString(), seatsAvailable = session.Capacity - activeCount }, ct);
        }

        return NoContent();
    }

    /// <summary>List all attendees registered for a session (Admin only).</summary>
    /// <param name="sessionId">ID of the session.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">List of registered attendees.</response>
    /// <response code="401">Not authenticated.</response>
    /// <response code="403">Admin role required.</response>
    /// <response code="404">Session not found.</response>
    [HttpGet("api/sessions/{sessionId:guid}/registrations")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IReadOnlyList<AttendeeDto>>> ListAttendees(Guid sessionId, CancellationToken ct)
    {
        var session = await _db.Sessions.FindAsync([sessionId], ct);
        if (session is null) return NotFound(new { message = "Session not found." });

        var attendees = await _db.Registrations
            .AsNoTracking()
            .Include(r => r.User)
            .Where(r => r.SessionId == sessionId)
            .Select(r => new AttendeeDto(r.UserId, r.User.Name, r.User.Email, r.RegisteredAt))
            .ToListAsync(ct);

        return Ok(attendees);
    }

    /// <summary>Return all sessions the currently authenticated user is registered for.</summary>
    /// <response code="200">List of sessions the current user has registered for.</response>
    /// <response code="401">Not authenticated.</response>
    [HttpGet("api/users/me/registrations")]
    [Authorize]
    public async Task<ActionResult<MyRegistrationsResponse>> MyRegistrations(CancellationToken ct)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized();

        var sessions = await _db.Registrations
            .AsNoTracking()
            .Include(r => r.Session).ThenInclude(s => s.Track)
            .Include(r => r.Session).ThenInclude(s => s.SessionSpeakers).ThenInclude(ss => ss.Speaker)
            .Include(r => r.Session).ThenInclude(s => s.Registrations)
            .Where(r => r.UserId == userId)
            .OrderBy(r => r.Session.StartTime)
            .Select(r => r.Session)
            .ToListAsync(ct);

        var dtos = sessions.Select(s => new SessionDto(
            s.Id, s.TrackId,
            s.Track?.Name ?? "",
            s.Track?.Color ?? "#6366f1",
            s.Title, s.Description,
            s.StartTime, s.EndTime,
            s.Room, s.Capacity,
            s.Registrations?.Count ?? 0,
            s.Capacity - (s.Registrations?.Count ?? 0),
            s.SessionType, s.Level,
            s.SlidesUrl, s.RecordingUrl,
            s.SessionSpeakers?.Select(ss => new SpeakerSummaryDto(
                ss.Speaker.Id, ss.Speaker.Name,
                ss.Speaker.Company, ss.Speaker.PhotoUrl)).ToList()
            ?? new List<SpeakerSummaryDto>()
        )).ToList();

        return Ok(new MyRegistrationsResponse(dtos));
    }

    /// <summary>Export the currently authenticated user's schedule as an iCal (.ics) file.</summary>
    /// <response code="200">iCal file containing one VEVENT per registered session.</response>
    /// <response code="401">Not authenticated.</response>
    [HttpGet("api/registrations/export/ical")]
    [Authorize]
    public async Task<IActionResult> ExportIcal(CancellationToken ct)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized();

        var registrations = await _db.Registrations
            .AsNoTracking()
            .Include(r => r.Session).ThenInclude(s => s.Track)
            .Where(r => r.UserId == userId)
            .OrderBy(r => r.Session.StartTime)
            .ToListAsync(ct);

        var sb = new StringBuilder();
        sb.AppendLine("BEGIN:VCALENDAR");
        sb.AppendLine("VERSION:2.0");
        sb.AppendLine("PRODID:-//ConferenceApp//EN");
        sb.AppendLine("CALSCALE:GREGORIAN");
        sb.AppendLine("METHOD:PUBLISH");

        var stamp = DateTime.UtcNow.ToString("yyyyMMddTHHmmssZ");
        foreach (var reg in registrations)
        {
            var session = reg.Session;
            var description = (session.Description ?? string.Empty);
            if (description.Length > 500) description = description[..500];
            description = description
                .Replace("\\", "\\\\")
                .Replace(",", "\\,")
                .Replace(";", "\\;")
                .Replace("\r\n", "\\n")
                .Replace("\n", "\\n")
                .Replace("\r", "\\n");

            var location = !string.IsNullOrWhiteSpace(session.Room)
                ? session.Room
                : session.Track?.Name ?? string.Empty;

            sb.AppendLine("BEGIN:VEVENT");
            sb.AppendLine($"UID:{reg.Id}@conferenceapp");
            sb.AppendLine($"DTSTAMP:{stamp}");
            sb.AppendLine($"DTSTART:{session.StartTime:yyyyMMddTHHmmssZ}");
            sb.AppendLine($"DTEND:{session.EndTime:yyyyMMddTHHmmssZ}");
            sb.AppendLine($"SUMMARY:{session.Title}");
            sb.AppendLine($"DESCRIPTION:{description}");
            sb.AppendLine($"LOCATION:{location}");
            sb.AppendLine("END:VEVENT");
        }

        sb.AppendLine("END:VCALENDAR");

        return File(Encoding.UTF8.GetBytes(sb.ToString()), "text/calendar", "my-schedule.ics");
    }

    private bool TryGetUserId(out Guid userId)
    {
        var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier)
                    ?? User.FindFirstValue("sub");
        return Guid.TryParse(idStr, out userId);
    }
}
