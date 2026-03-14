using ConferenceApp.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ConferenceApp.Api.Controllers;

public record SessionSearchItem(Guid Id, string Title, string ConferenceName, string TrackName, DateTime StartTime);
public record SpeakerSearchItem(Guid Id, string Name, string Company, string? PhotoUrl);
public record SearchResultDto(List<SessionSearchItem> Sessions, List<SpeakerSearchItem> Speakers);

[ApiController]
[Route("api/search")]
public class SearchController : ControllerBase
{
    private readonly ConferenceDbContext _db;
    public SearchController(ConferenceDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<SearchResultDto>> Search([FromQuery] string? q, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Trim().Length < 2)
            return BadRequest("Query must be at least 2 characters.");

        var pattern = $"%{q.Trim()}%";

        var sessionIds = await _db.Sessions
            .AsNoTracking()
            .Include(s => s.Track).ThenInclude(t => t.Conference)
            .Include(s => s.SessionSpeakers).ThenInclude(ss => ss.Speaker)
            .Where(s =>
                EF.Functions.ILike(s.Title, pattern) ||
                EF.Functions.ILike(s.Description, pattern) ||
                s.SessionSpeakers.Any(ss => EF.Functions.ILike(ss.Speaker.Name, pattern)))
            .OrderBy(s => s.StartTime)
            .Take(10)
            .Select(s => new SessionSearchItem(
                s.Id,
                s.Title,
                s.Track.Conference.Name,
                s.Track.Name,
                s.StartTime))
            .ToListAsync(ct);

        var speakers = await _db.Speakers
            .AsNoTracking()
            .Where(sp =>
                EF.Functions.ILike(sp.Name, pattern) ||
                EF.Functions.ILike(sp.Bio, pattern) ||
                EF.Functions.ILike(sp.Company, pattern))
            .OrderBy(sp => sp.Name)
            .Take(10)
            .Select(sp => new SpeakerSearchItem(sp.Id, sp.Name, sp.Company, sp.PhotoUrl))
            .ToListAsync(ct);

        return Ok(new SearchResultDto(sessionIds, speakers));
    }
}
