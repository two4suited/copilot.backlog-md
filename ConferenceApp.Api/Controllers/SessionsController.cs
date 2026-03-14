using ConferenceApp.Api.Data;
using ConferenceApp.Api.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ConferenceApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SessionsController : ControllerBase
{
    private readonly ConferenceDbContext _db;
    public SessionsController(ConferenceDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SessionDto>>> List(
        [FromQuery] Guid? trackId,
        [FromQuery] Guid? conferenceId,
        CancellationToken ct)
    {
        var query = _db.Sessions
            .AsNoTracking()
            .Include(s => s.Track)
            .Include(s => s.SessionSpeakers).ThenInclude(ss => ss.Speaker)
            .Include(s => s.Registrations)
            .AsQueryable();

        if (trackId.HasValue)
            query = query.Where(s => s.TrackId == trackId.Value);

        if (conferenceId.HasValue)
            query = query.Where(s => s.Track.ConferenceId == conferenceId.Value);

        var sessions = await query
            .OrderBy(s => s.StartTime)
            .ToListAsync(ct);

        return Ok(sessions.Select(MapToDto).ToList());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SessionDto>> Get(Guid id, CancellationToken ct)
    {
        var session = await _db.Sessions
            .AsNoTracking()
            .Include(s => s.Track)
            .Include(s => s.SessionSpeakers).ThenInclude(ss => ss.Speaker)
            .Include(s => s.Registrations)
            .FirstOrDefaultAsync(s => s.Id == id, ct);

        if (session is null) return NotFound();
        return Ok(MapToDto(session));
    }

    [HttpPost]
    public async Task<ActionResult<SessionDto>> Create(
        [FromBody] CreateSessionRequest req, CancellationToken ct)
    {
        var track = await _db.Tracks.FindAsync([req.TrackId], ct);
        if (track is null) return BadRequest(new { message = "Track not found." });

        var session = new ConferenceApp.Models.Session
        {
            TrackId = req.TrackId,
            Title = req.Title,
            Description = req.Description ?? string.Empty,
            StartTime = req.StartTime,
            EndTime = req.EndTime,
            Room = req.Room,
            Capacity = req.Capacity,
            SessionType = req.SessionType,
            Level = req.Level,
        };

        _db.Sessions.Add(session);

        if (req.SpeakerIds is { Count: > 0 })
        {
            foreach (var speakerId in req.SpeakerIds)
            {
                _db.SessionSpeakers.Add(new ConferenceApp.Models.SessionSpeaker
                {
                    SessionId = session.Id,
                    SpeakerId = speakerId,
                });
            }
        }

        await _db.SaveChangesAsync(ct);

        var created = await _db.Sessions
            .AsNoTracking()
            .Include(s => s.Track)
            .Include(s => s.SessionSpeakers).ThenInclude(ss => ss.Speaker)
            .Include(s => s.Registrations)
            .FirstAsync(s => s.Id == session.Id, ct);

        return CreatedAtAction(nameof(Get), new { id = session.Id }, MapToDto(created));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSessionRequest req, CancellationToken ct)
    {
        var session = await _db.Sessions.FindAsync([id], ct);
        if (session is null) return NotFound();

        session.Title = req.Title;
        session.Description = req.Description ?? string.Empty;
        session.StartTime = req.StartTime;
        session.EndTime = req.EndTime;
        session.Room = req.Room;
        session.Capacity = req.Capacity;
        session.SessionType = req.SessionType;
        session.Level = req.Level;
        session.SlidesUrl = req.SlidesUrl;
        session.RecordingUrl = req.RecordingUrl;

        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var session = await _db.Sessions.FindAsync([id], ct);
        if (session is null) return NotFound();
        session.IsDeleted = true;
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static SessionDto MapToDto(ConferenceApp.Models.Session s) => new(
        s.Id, s.TrackId,
        s.Track?.Name ?? "",
        s.Track?.Color ?? "#6366f1",
        s.Title, s.Description,
        s.StartTime, s.EndTime,
        s.Room, s.Capacity,
        s.Registrations?.Count ?? 0,
        s.SessionType, s.Level,
        s.SlidesUrl, s.RecordingUrl,
        s.SessionSpeakers?.Select(ss => new SpeakerSummaryDto(
            ss.Speaker.Id, ss.Speaker.Name,
            ss.Speaker.Company, ss.Speaker.PhotoUrl)).ToList()
        ?? new List<SpeakerSummaryDto>()
    );
}
