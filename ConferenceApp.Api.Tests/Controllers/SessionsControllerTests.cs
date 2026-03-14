using System.Security.Claims;
using ConferenceApp.Api.Controllers;
using ConferenceApp.Api.DTOs;
using ConferenceApp.Api.Tests.Helpers;
using ConferenceApp.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace ConferenceApp.Api.Tests.Controllers;

public class SessionsControllerTests
{
    // ── helpers ───────────────────────────────────────────────────────────────

    private static SessionsController BuildAdminController(ConferenceApp.Api.Data.ConferenceDbContext db)
    {
        var controller = new SessionsController(db);
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
                    new Claim(ClaimTypes.Role, "Admin"),
                }, "test"))
            }
        };
        return controller;
    }

    private static async Task<(Conference conf, Track track, Session session)> SeedAsync(
        ConferenceApp.Api.Data.ConferenceDbContext db)
    {
        var conf = new Conference
        {
            Name = "Dev Summit",
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(2),
            Location = "Online",
        };
        db.Conferences.Add(conf);

        var track = new Track { Name = "Backend", ConferenceId = conf.Id };
        db.Tracks.Add(track);

        var session = new Session
        {
            TrackId = track.Id,
            Title = "Intro to .NET",
            StartTime = DateTime.UtcNow.AddHours(1),
            EndTime = DateTime.UtcNow.AddHours(2),
            Capacity = 30,
        };
        db.Sessions.Add(session);
        await db.SaveChangesAsync();
        return (conf, track, session);
    }

    // ── GET tests ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task List_ByConferenceId_Returns200WithSessions()
    {
        using var db = TestDbContext.Create();
        var (conf, _, _) = await SeedAsync(db);
        var controller = BuildAdminController(db);

        var result = await controller.List(null, conf.Id, CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsAssignableFrom<IReadOnlyList<SessionDto>>(ok.Value);
        Assert.Single(list);
    }

    [Fact]
    public async Task Get_ExistingSession_Returns200WithDetails()
    {
        using var db = TestDbContext.Create();
        var (_, _, session) = await SeedAsync(db);
        var controller = BuildAdminController(db);

        var result = await controller.Get(session.Id, CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var dto = Assert.IsType<SessionDto>(ok.Value);
        Assert.Equal(session.Id, dto.Id);
        Assert.Equal("Intro to .NET", dto.Title);
    }

    [Fact]
    public async Task Get_NonExistentSession_Returns404()
    {
        using var db = TestDbContext.Create();
        var controller = BuildAdminController(db);

        var result = await controller.Get(Guid.NewGuid(), CancellationToken.None);

        Assert.IsType<NotFoundResult>(result.Result);
    }

    // ── POST tests ────────────────────────────────────────────────────────────

    [Fact]
    public async Task Create_ValidRequest_Returns201WithSession()
    {
        using var db = TestDbContext.Create();
        var (_, track, _) = await SeedAsync(db);
        var controller = BuildAdminController(db);

        var req = new CreateSessionRequest(
            TrackId: track.Id,
            Title: "Advanced C#",
            Description: "Deep dive",
            StartTime: DateTime.UtcNow.AddHours(3),
            EndTime: DateTime.UtcNow.AddHours(4),
            Room: "Hall B",
            Capacity: 50,
            SessionType: "Talk",
            Level: "Advanced",
            SpeakerIds: null);

        var result = await controller.Create(req, CancellationToken.None);

        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        Assert.Equal(201, created.StatusCode);
        var dto = Assert.IsType<SessionDto>(created.Value);
        Assert.Equal("Advanced C#", dto.Title);
    }

    [Fact]
    public async Task Create_UnknownTrack_Returns400()
    {
        using var db = TestDbContext.Create();
        var controller = BuildAdminController(db);

        var req = new CreateSessionRequest(
            TrackId: Guid.NewGuid(),
            Title: "Orphaned Session",
            Description: null,
            StartTime: DateTime.UtcNow,
            EndTime: DateTime.UtcNow.AddHours(1),
            Room: "Room X",
            Capacity: 10,
            SessionType: "Talk",
            Level: "Beginner",
            SpeakerIds: null);

        var result = await controller.Create(req, CancellationToken.None);

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    // ── PUT tests ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task Update_ExistingSession_Returns204NoContent()
    {
        using var db = TestDbContext.Create();
        var (_, _, session) = await SeedAsync(db);
        var controller = BuildAdminController(db);

        var req = new UpdateSessionRequest(
            Title: "Updated Title",
            Description: "Updated desc",
            StartTime: DateTime.UtcNow.AddHours(1),
            EndTime: DateTime.UtcNow.AddHours(2),
            Room: "Room C",
            Capacity: 40,
            SessionType: "Workshop",
            Level: "Beginner",
            SlidesUrl: null,
            RecordingUrl: null);

        var result = await controller.Update(session.Id, req, CancellationToken.None);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Update_NonExistentSession_Returns404()
    {
        using var db = TestDbContext.Create();
        var controller = BuildAdminController(db);

        var req = new UpdateSessionRequest(
            Title: "X", Description: null,
            StartTime: DateTime.UtcNow, EndTime: DateTime.UtcNow.AddHours(1),
            Room: "R", Capacity: 10, SessionType: "Talk", Level: "Beginner",
            SlidesUrl: null, RecordingUrl: null);

        var result = await controller.Update(Guid.NewGuid(), req, CancellationToken.None);

        Assert.IsType<NotFoundResult>(result);
    }

    // ── DELETE tests ──────────────────────────────────────────────────────────

    [Fact]
    public async Task Delete_ExistingSession_Returns204NoContent()
    {
        using var db = TestDbContext.Create();
        var (_, _, session) = await SeedAsync(db);
        var controller = BuildAdminController(db);

        var result = await controller.Delete(session.Id, CancellationToken.None);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_NonExistentSession_Returns404()
    {
        using var db = TestDbContext.Create();
        var controller = BuildAdminController(db);

        var result = await controller.Delete(Guid.NewGuid(), CancellationToken.None);

        Assert.IsType<NotFoundResult>(result);
    }
}
