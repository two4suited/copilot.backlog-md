using System.Security.Claims;
using ConferenceApp.Api.Data;
using ConferenceApp.Api.DTOs;
using ConferenceApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ConferenceApp.Api.Controllers;

[ApiController]
public class RegistrationsController : ControllerBase
{
    private readonly ConferenceDbContext _db;
    public RegistrationsController(ConferenceDbContext db) => _db = db;

    /// <summary>POST /api/sessions/{sessionId}/register — register the current user</summary>
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

        return Ok(new RegisterSessionResponse(
            registration.Id,
            session.Id,
            session.Title,
            registration.RegisteredAt
        ));
    }

    /// <summary>DELETE /api/sessions/{sessionId}/register — cancel the current user's registration</summary>
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
        return NoContent();
    }

    /// <summary>GET /api/sessions/{sessionId}/registrations — list attendees (Admin only)</summary>
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

    /// <summary>GET /api/users/me/registrations — my registered sessions</summary>
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

    private bool TryGetUserId(out Guid userId)
    {
        var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier)
                    ?? User.FindFirstValue("sub");
        return Guid.TryParse(idStr, out userId);
    }
}
