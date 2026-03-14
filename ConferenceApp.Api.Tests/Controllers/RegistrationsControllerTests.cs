using System.Security.Claims;
using ConferenceApp.Api.Controllers;
using ConferenceApp.Api.Services;
using ConferenceApp.Api.Tests.Helpers;
using ConferenceApp.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace ConferenceApp.Api.Tests.Controllers;

public class RegistrationsControllerTests
{
    // ── helpers ──────────────────────────────────────────────────────────────

    private static RegistrationsController BuildController(
        ConferenceApp.Api.Data.ConferenceDbContext db, Guid userId)
    {
        var controller = new RegistrationsController(db, new FakeSessionHubContext(), new NoOpEmailService());
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                }, "test"))
            }
        };
        return controller;
    }

    /// <summary>Seeds a Track + Session pair and returns the session.</summary>
    private static async Task<Session> SeedSessionAsync(
        ConferenceApp.Api.Data.ConferenceDbContext db, int capacity = 10)
    {
        var conference = new Conference { Name = "Conf", StartDate = DateTime.UtcNow, EndDate = DateTime.UtcNow.AddDays(1), Location = "Online" };
        db.Conferences.Add(conference);

        var track = new Track { Name = "Track A", ConferenceId = conference.Id };
        db.Tracks.Add(track);

        var session = new Session
        {
            TrackId = track.Id,
            Title = "Test Session",
            StartTime = DateTime.UtcNow,
            EndTime = DateTime.UtcNow.AddHours(1),
            Capacity = capacity,
        };
        db.Sessions.Add(session);
        await db.SaveChangesAsync();
        return session;
    }

    private static User SeedUser(ConferenceApp.Api.Data.ConferenceDbContext db)
    {
        var user = new User { Name = "Test User", Email = $"user-{Guid.NewGuid()}@test.com", PasswordHash = "x" };
        db.Users.Add(user);
        db.SaveChanges();
        return user;
    }

    // ── tests ─────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Register_AvailableSeats_Returns200()
    {
        using var db = TestDbContext.Create();
        var user = SeedUser(db);
        var session = await SeedSessionAsync(db);
        var controller = BuildController(db, user.Id);

        var result = await controller.Register(session.Id, CancellationToken.None);

        Assert.IsType<OkObjectResult>(result.Result);
    }

    [Fact]
    public async Task Register_SameSessionTwice_Returns409Conflict()
    {
        using var db = TestDbContext.Create();
        var user = SeedUser(db);
        var session = await SeedSessionAsync(db);
        var controller = BuildController(db, user.Id);

        await controller.Register(session.Id, CancellationToken.None);
        var result = await controller.Register(session.Id, CancellationToken.None);

        Assert.IsType<ConflictObjectResult>(result.Result);
    }

    [Fact]
    public async Task Register_SessionAtCapacity_Returns400BadRequest()
    {
        using var db = TestDbContext.Create();
        var session = await SeedSessionAsync(db, capacity: 1);

        // Fill the seat with another user
        var firstUser = SeedUser(db);
        var firstController = BuildController(db, firstUser.Id);
        await firstController.Register(session.Id, CancellationToken.None);

        // Second user should hit capacity
        var secondUser = SeedUser(db);
        var secondController = BuildController(db, secondUser.Id);
        var result = await secondController.Register(session.Id, CancellationToken.None);

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task Cancel_ExistingRegistration_Returns204NoContent()
    {
        using var db = TestDbContext.Create();
        var user = SeedUser(db);
        var session = await SeedSessionAsync(db);
        var controller = BuildController(db, user.Id);

        await controller.Register(session.Id, CancellationToken.None);
        var result = await controller.Cancel(session.Id, CancellationToken.None);

        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Cancel_NonExistentRegistration_Returns404NotFound()
    {
        using var db = TestDbContext.Create();
        var user = SeedUser(db);
        var session = await SeedSessionAsync(db);
        var controller = BuildController(db, user.Id);

        // No registration was ever made
        var result = await controller.Cancel(session.Id, CancellationToken.None);

        Assert.IsType<NotFoundObjectResult>(result);
    }
}
