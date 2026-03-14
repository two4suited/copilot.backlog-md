using ConferenceApp.Api.Data;
using ConferenceApp.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ConferenceApp.Api.Controllers;

[ApiController]
[Route("api/conferences/{conferenceId:guid}/tracks")]
public class TracksController : ControllerBase
{
    private readonly ConferenceDbContext _db;

    public TracksController(ConferenceDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TrackDto>>> List(Guid conferenceId, CancellationToken ct)
    {
        var exists = await _db.Conferences.AnyAsync(c => c.Id == conferenceId, ct);
        if (!exists) return NotFound();

        var tracks = await _db.Tracks
            .AsNoTracking()
            .Where(t => t.ConferenceId == conferenceId)
            .OrderBy(t => t.SortOrder)
            .Select(t => new TrackDto(
                t.Id, t.ConferenceId, t.Name, t.Description, t.Color, t.SortOrder,
                t.Sessions.Count))
            .ToListAsync(ct);

        return Ok(tracks);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TrackDetailDto>> Get(Guid conferenceId, Guid id, CancellationToken ct)
    {
        var track = await _db.Tracks
            .AsNoTracking()
            .Include(t => t.Sessions)
            .FirstOrDefaultAsync(t => t.Id == id && t.ConferenceId == conferenceId, ct);

        if (track is null) return NotFound();

        var dto = new TrackDetailDto(
            track.Id, track.ConferenceId, track.Name, track.Description,
            track.Color, track.SortOrder,
            track.Sessions.Select(s => new SessionSummaryDto(
                s.Id, s.Title, s.StartTime, s.EndTime, s.Room,
                s.Capacity, s.SessionType, s.Level)).ToList());

        return Ok(dto);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<TrackDto>> Create(
        Guid conferenceId, [FromBody] CreateTrackRequest req, CancellationToken ct)
    {
        var exists = await _db.Conferences.AnyAsync(c => c.Id == conferenceId, ct);
        if (!exists) return NotFound();

        var track = new ConferenceApp.Models.Track
        {
            ConferenceId = conferenceId,
            Name = req.Name,
            Description = req.Description ?? string.Empty,
            Color = req.Color,
            SortOrder = req.SortOrder,
        };

        _db.Tracks.Add(track);
        await _db.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(Get), new { conferenceId, id = track.Id },
            new TrackDto(track.Id, track.ConferenceId, track.Name, track.Description,
                track.Color, track.SortOrder, 0));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(
        Guid conferenceId, Guid id, [FromBody] UpdateTrackRequest req, CancellationToken ct)
    {
        var track = await _db.Tracks
            .AsTracking()
            .FirstOrDefaultAsync(t => t.Id == id && t.ConferenceId == conferenceId, ct);
        if (track is null) return NotFound();

        track.Name = req.Name;
        track.Description = req.Description ?? string.Empty;
        track.Color = req.Color;
        track.SortOrder = req.SortOrder;

        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid conferenceId, Guid id, CancellationToken ct)
    {
        var track = await _db.Tracks
            .AsTracking()
            .FirstOrDefaultAsync(t => t.Id == id && t.ConferenceId == conferenceId, ct);
        if (track is null) return NotFound();

        track.IsDeleted = true;
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}
