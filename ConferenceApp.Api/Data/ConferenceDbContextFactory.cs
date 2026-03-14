using ConferenceApp.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace ConferenceApp.Api;

public class ConferenceDbContextFactory : IDesignTimeDbContextFactory<ConferenceDbContext>
{
    public ConferenceDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<ConferenceDbContext>()
            .UseNpgsql("Host=localhost;Database=conferencedb;Username=postgres;Password=postgres")
            .Options;
        return new ConferenceDbContext(options);
    }
}
