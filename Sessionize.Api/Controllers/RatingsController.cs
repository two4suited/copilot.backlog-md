using System.Security.Claims;
using Sessionize.Api.Data;
using Sessionize.Api.DTOs;
using Sessionize.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Sessionize.Api.Controllers;

[ApiController]
public class RatingsController : ControllerBase
{
    private readonly ConferenceDbContext _db;

    public RatingsController(ConferenceDbContext db) => _db = db;

    /// <summary>Submit or update a rating for a session.</summary>
    /// <remarks>
    /// The authenticated user must have a registration for the session and
    /// the session must have already ended. Submitting a second rating
    /// replaces the previous one (upsert).
    /// </remarks>
    /// <param name="sessionId">Session to rate.</param>
    /// <param name="request">Stars (1–5) and optional comment.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Rating saved.</response>
    /// <response code="400">Stars out of range, session has not ended yet, or comment exceeds 500 chars.</response>
    /// <response code="401">Not authenticated.</response>
    /// <response code="403">User was not registered for this session.</response>
    /// <response code="404">Session not found.</response>
    [HttpPost("api/sessions/{sessionId:guid}/ratings")]
    [Authorize]
    public async Task<ActionResult<RatingDto>> Submit(
        Guid sessionId,
        [FromBody] SubmitRatingRequest request,
        CancellationToken ct)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized();

        if (request.Stars < 1 || request.Stars > 5)
            return BadRequest(new { message = "Stars must be between 1 and 5." });

        if (request.Comment?.Length > 500)
            return BadRequest(new { message = "Comment must not exceed 500 characters." });

        var session = await _db.Sessions.FindAsync([sessionId], ct);
        if (session is null)
            return NotFound(new { message = "Session not found." });

        if (session.EndTime > DateTime.UtcNow)
            return BadRequest(new { message = "You can only rate a session after it has ended." });

        var wasRegistered = await _db.Registrations
            .AnyAsync(r => r.UserId == userId && r.SessionId == sessionId, ct);

        if (!wasRegistered)
            return Forbid();

        var existing = await _db.SessionRatings
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(r => r.UserId == userId && r.SessionId == sessionId, ct);

        SessionRating rating;
        if (existing is not null)
        {
            existing.Stars = request.Stars;
            existing.Comment = request.Comment;
            existing.IsDeleted = false;
            rating = existing;
        }
        else
        {
            rating = new SessionRating
            {
                SessionId = sessionId,
                UserId = userId,
                Stars = request.Stars,
                Comment = request.Comment,
            };
            _db.SessionRatings.Add(rating);
        }

        await _db.SaveChangesAsync(ct);

        return Ok(ToDto(rating));
    }

    /// <summary>Get the aggregate rating summary for a session.</summary>
    /// <param name="sessionId">Session to summarise.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Summary with average, count, and star distribution.</response>
    /// <response code="404">Session not found.</response>
    [HttpGet("api/sessions/{sessionId:guid}/ratings/summary")]
    public async Task<ActionResult<RatingSummaryDto>> Summary(Guid sessionId, CancellationToken ct)
    {
        var sessionExists = await _db.Sessions
            .AnyAsync(s => s.Id == sessionId, ct);

        if (!sessionExists)
            return NotFound(new { message = "Session not found." });

        var ratings = await _db.SessionRatings
            .AsNoTracking()
            .Where(r => r.SessionId == sessionId)
            .Select(r => r.Stars)
            .ToListAsync(ct);

        if (ratings.Count == 0)
            return Ok(new RatingSummaryDto(0, 0, new StarDistribution(0, 0, 0, 0, 0)));

        var avg = Math.Round(ratings.Average(), 1);
        var dist = new StarDistribution(
            ratings.Count(s => s == 1),
            ratings.Count(s => s == 2),
            ratings.Count(s => s == 3),
            ratings.Count(s => s == 4),
            ratings.Count(s => s == 5)
        );

        return Ok(new RatingSummaryDto(avg, ratings.Count, dist));
    }

    /// <summary>Get the current user's rating for a session, if any.</summary>
    /// <param name="sessionId">Session to check.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">The user's rating or <c>{ hasRated: false }</c>.</response>
    /// <response code="401">Not authenticated.</response>
    [HttpGet("api/sessions/{sessionId:guid}/ratings/mine")]
    [Authorize]
    public async Task<ActionResult<MyRatingDto>> Mine(Guid sessionId, CancellationToken ct)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized();

        var rating = await _db.SessionRatings
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.UserId == userId && r.SessionId == sessionId, ct);

        return Ok(rating is null
            ? new MyRatingDto(false, null)
            : new MyRatingDto(true, ToDto(rating)));
    }

    /// <summary>List all ratings for a session (Admin only).</summary>
    /// <param name="sessionId">Session to query.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <response code="200">Paginated list of ratings with reviewer details.</response>
    /// <response code="401">Not authenticated.</response>
    /// <response code="403">Admin role required.</response>
    /// <response code="404">Session not found.</response>
    [HttpGet("api/sessions/{sessionId:guid}/ratings")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IReadOnlyList<AdminRatingDto>>> List(Guid sessionId, CancellationToken ct)
    {
        var sessionExists = await _db.Sessions.AnyAsync(s => s.Id == sessionId, ct);
        if (!sessionExists)
            return NotFound(new { message = "Session not found." });

        var ratings = await _db.SessionRatings
            .AsNoTracking()
            .Include(r => r.User)
            .Where(r => r.SessionId == sessionId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new AdminRatingDto(
                r.Id,
                r.UserId,
                r.User.Name,
                r.Stars,
                r.Comment,
                r.CreatedAt,
                r.UpdatedAt))
            .ToListAsync(ct);

        return Ok(ratings);
    }

    private bool TryGetUserId(out Guid userId)
    {
        var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier)
                    ?? User.FindFirstValue("sub");
        return Guid.TryParse(idStr, out userId);
    }

    private static RatingDto ToDto(SessionRating r) =>
        new(r.Id, r.Stars, r.Comment, r.CreatedAt, r.UpdatedAt);
}
