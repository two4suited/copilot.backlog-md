using ConferenceApp.Api.Data;
using ConferenceApp.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ConferenceApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SpeakersController : ControllerBase
{
    private readonly ConferenceDbContext _db;
    public SpeakersController(ConferenceDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SpeakerDto>>> List(CancellationToken ct)
    {
        var speakers = await _db.Speakers
            .AsNoTracking()
            .OrderBy(s => s.Name)
            .Select(s => new SpeakerDto(s.Id, s.Name, s.Bio, s.Email,
                s.Company, s.PhotoUrl, s.TwitterHandle, s.LinkedInUrl))
            .ToListAsync(ct);

        return Ok(speakers);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SpeakerDetailDto>> Get(Guid id, CancellationToken ct)
    {
        var speaker = await _db.Speakers
            .AsNoTracking()
            .Include(s => s.SessionSpeakers)
                .ThenInclude(ss => ss.Session)
                    .ThenInclude(s => s.Track)
            .FirstOrDefaultAsync(s => s.Id == id, ct);

        if (speaker is null) return NotFound();

        var sessions = speaker.SessionSpeakers
            .Where(ss => !ss.Session.IsDeleted)
            .Select(ss => new SessionSummaryDto(
                ss.Session.Id, ss.Session.Title,
                ss.Session.StartTime, ss.Session.EndTime,
                ss.Session.Room, ss.Session.Capacity,
                ss.Session.SessionType, ss.Session.Level))
            .ToList();

        return Ok(new SpeakerDetailDto(
            speaker.Id, speaker.Name, speaker.Bio, speaker.Email,
            speaker.Company, speaker.PhotoUrl,
            speaker.TwitterHandle, speaker.LinkedInUrl, sessions));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SpeakerDto>> Create(
        [FromBody] CreateSpeakerRequest req, CancellationToken ct)
    {
        var speaker = new ConferenceApp.Models.Speaker
        {
            Name = req.Name,
            Bio = req.Bio,
            Email = req.Email,
            Company = req.Company,
            PhotoUrl = req.PhotoUrl,
            TwitterHandle = req.TwitterHandle,
            LinkedInUrl = req.LinkedInUrl,
        };

        _db.Speakers.Add(speaker);
        await _db.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(Get), new { id = speaker.Id },
            new SpeakerDto(speaker.Id, speaker.Name, speaker.Bio, speaker.Email,
                speaker.Company, speaker.PhotoUrl, speaker.TwitterHandle, speaker.LinkedInUrl));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSpeakerRequest req, CancellationToken ct)
    {
        var speaker = await _db.Speakers.FindAsync([id], ct);
        if (speaker is null) return NotFound();

        speaker.Name = req.Name;
        speaker.Bio = req.Bio;
        speaker.Company = req.Company;
        speaker.PhotoUrl = req.PhotoUrl;
        speaker.TwitterHandle = req.TwitterHandle;
        speaker.LinkedInUrl = req.LinkedInUrl;

        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var speaker = await _db.Speakers.FindAsync([id], ct);
        if (speaker is null) return NotFound();
        speaker.IsDeleted = true;
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}
