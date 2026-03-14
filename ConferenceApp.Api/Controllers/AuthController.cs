using System.Security.Claims;
using ConferenceApp.Api.Data;
using ConferenceApp.Api.DTOs;
using ConferenceApp.Api.Services;
using ConferenceApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ConferenceApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ConferenceDbContext _db;
    private readonly TokenService _tokenService;

    public AuthController(ConferenceDbContext db, TokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(
        [FromBody] RegisterRequest req, CancellationToken ct)
    {
        if (await _db.Users.AnyAsync(u => u.Email == req.Email, ct))
            return Conflict(new { message = "Email already registered." });

        var user = new User
        {
            Name = req.Name,
            Email = req.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Role = UserRole.Attendee,
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);

        var token = _tokenService.GenerateToken(user.Id, user.Email, user.Role.ToString());
        return Ok(new AuthResponse(token, user.Email, user.Name, user.Role.ToString()));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(
        [FromBody] LoginRequest req, CancellationToken ct)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Email == req.Email, ct);

        if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid email or password." });

        var token = _tokenService.GenerateToken(user.Id, user.Email, user.Role.ToString());
        return Ok(new AuthResponse(token, user.Email, user.Name, user.Role.ToString()));
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserProfileDto>> Me(CancellationToken ct)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (!Guid.TryParse(userIdStr, out var userId))
            return Unauthorized();

        var user = await _db.Users.FindAsync([userId], ct);
        if (user is null) return NotFound();

        return Ok(new UserProfileDto(user.Id, user.Email, user.Name, user.Role.ToString()));
    }
}
