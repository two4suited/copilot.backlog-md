using Sessionize.Api.Controllers;
using Sessionize.Api.DTOs;
using Sessionize.Api.Services;
using Sessionize.Api.Tests.Helpers;
using Sessionize.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace Sessionize.Api.Tests.Controllers;

public class AuthControllerTests
{
    private static TokenService BuildTokenService()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "super-secret-test-key-that-is-long-enough-32chars",
                ["Jwt:Issuer"] = "test-issuer",
                ["Jwt:Audience"] = "test-audience",
            })
            .Build();
        return new TokenService(config);
    }

    [Fact]
    public async Task Register_ValidData_Returns200WithToken()
    {
        using var db = TestDbContext.Create();
        var controller = new AuthController(db, BuildTokenService());

        var result = await controller.Register(
            new RegisterRequest("Alice", "alice@example.com", "Password1!"),
            CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var body = Assert.IsType<AuthResponse>(ok.Value);
        Assert.Equal("alice@example.com", body.Email);
        Assert.Equal("Alice", body.Name);
        Assert.Equal("Attendee", body.Role);
        Assert.False(string.IsNullOrWhiteSpace(body.Token));
    }

    [Fact]
    public async Task Register_DuplicateEmail_Returns409Conflict()
    {
        using var db = TestDbContext.Create();
        var controller = new AuthController(db, BuildTokenService());

        // First registration succeeds
        await controller.Register(
            new RegisterRequest("Alice", "alice@example.com", "Password1!"),
            CancellationToken.None);

        // Second registration with same email should conflict
        var result = await controller.Register(
            new RegisterRequest("Alice2", "alice@example.com", "Different1!"),
            CancellationToken.None);

        Assert.IsType<ConflictObjectResult>(result.Result);
    }

    [Fact]
    public async Task Login_ValidCredentials_Returns200WithToken()
    {
        using var db = TestDbContext.Create();
        var tokenService = BuildTokenService();
        var controller = new AuthController(db, tokenService);

        // Register first
        await controller.Register(
            new RegisterRequest("Bob", "bob@example.com", "Secret123!"),
            CancellationToken.None);

        // Login
        var result = await controller.Login(
            new LoginRequest("bob@example.com", "Secret123!"),
            CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var body = Assert.IsType<AuthResponse>(ok.Value);
        Assert.Equal("bob@example.com", body.Email);
        Assert.False(string.IsNullOrWhiteSpace(body.Token));
    }

    [Fact]
    public async Task Login_WrongPassword_Returns401Unauthorized()
    {
        using var db = TestDbContext.Create();
        var controller = new AuthController(db, BuildTokenService());

        await controller.Register(
            new RegisterRequest("Carol", "carol@example.com", "RightPass1!"),
            CancellationToken.None);

        var result = await controller.Login(
            new LoginRequest("carol@example.com", "WrongPass99!"),
            CancellationToken.None);

        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }

    [Fact]
    public async Task Login_NonexistentEmail_Returns401Unauthorized()
    {
        using var db = TestDbContext.Create();
        var controller = new AuthController(db, BuildTokenService());

        var result = await controller.Login(
            new LoginRequest("nobody@example.com", "Pass1!"),
            CancellationToken.None);

        Assert.IsType<UnauthorizedObjectResult>(result.Result);
    }
}
