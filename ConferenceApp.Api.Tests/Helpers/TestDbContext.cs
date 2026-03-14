using ConferenceApp.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace ConferenceApp.Api.Tests.Helpers;

/// <summary>
/// Factory for creating an isolated EF Core InMemory database context per test.
/// </summary>
public static class TestDbContext
{
    public static ConferenceDbContext Create(string? dbName = null)
    {
        var options = new DbContextOptionsBuilder<ConferenceDbContext>()
            .UseInMemoryDatabase(dbName ?? Guid.NewGuid().ToString())
            .Options;

        return new ConferenceDbContext(options);
    }
}
