using ConferenceApp.Api.Data;
using ConferenceApp.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ConferenceApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConferencesController : ControllerBase
{
    private readonly ConferenceDbContext _db;

    public ConferencesController(ConferenceDbContext db) => _db = db;

    /// <summary>Return a paginated list of conferences, newest first.</summary>
    /// <param name="page">Page number (1-based).</param>
    /// <param name="pageSize">Items per page (1–100, default 20).</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Paginated conference list.</response>
    [HttpGet]
    public async Task<ActionResult<PagedResult<ConferenceDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _db.Conferences.AsNoTracking();
        var total = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(c => c.StartDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new ConferenceDto(
                c.Id, c.Name, c.Description, c.StartDate, c.EndDate,
                c.Location, c.WebsiteUrl, c.ImageUrl, c.Timezone, c.Tracks.Count, c.CreatedAt))
            .ToListAsync(ct);

        return Ok(new PagedResult<ConferenceDto>(items, total, page, pageSize));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ConferenceDetailDto>> Get(Guid id, CancellationToken ct)
    {
        var conference = await _db.Conferences
            .AsNoTracking()
            .Include(c => c.Tracks)
                .ThenInclude(t => t.Sessions)
            .FirstOrDefaultAsync(c => c.Id == id, ct);

        if (conference is null) return NotFound();

        var dto = new ConferenceDetailDto(
            conference.Id, conference.Name, conference.Description,
            conference.StartDate, conference.EndDate, conference.Location,
            conference.WebsiteUrl, conference.ImageUrl, conference.Timezone,
            conference.Tracks.Select(t => new TrackDto(
                t.Id, t.ConferenceId, t.Name, t.Description, t.Color, t.SortOrder,
                t.Sessions.Count)).ToList(),
            conference.CreatedAt);

        return Ok(dto);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ConferenceDto>> Create(
        [FromBody] CreateConferenceRequest req, CancellationToken ct)
    {
        var conference = new ConferenceApp.Models.Conference
        {
            Name = req.Name,
            Description = req.Description ?? string.Empty,
            StartDate = req.StartDate,
            EndDate = req.EndDate,
            Location = req.Location,
            WebsiteUrl = req.WebsiteUrl,
            Timezone = req.Timezone ?? "UTC",
        };

        _db.Conferences.Add(conference);
        await _db.SaveChangesAsync(ct);

        var dto = new ConferenceDto(conference.Id, conference.Name, conference.Description,
            conference.StartDate, conference.EndDate, conference.Location,
            conference.WebsiteUrl, conference.ImageUrl, conference.Timezone, 0, conference.CreatedAt);

        return CreatedAtAction(nameof(Get), new { id = conference.Id }, dto);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateConferenceRequest req, CancellationToken ct)
    {
        var conference = await _db.Conferences
            .AsTracking()
            .FirstOrDefaultAsync(c => c.Id == id, ct);
        if (conference is null) return NotFound();

        conference.Name = req.Name;
        conference.Description = req.Description ?? string.Empty;
        conference.StartDate = req.StartDate;
        conference.EndDate = req.EndDate;
        conference.Location = req.Location;
        conference.WebsiteUrl = req.WebsiteUrl;
        conference.Timezone = req.Timezone ?? conference.Timezone;

        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var conference = await _db.Conferences
            .AsTracking()
            .FirstOrDefaultAsync(c => c.Id == id, ct);
        if (conference is null) return NotFound();

        conference.IsDeleted = true;
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}
