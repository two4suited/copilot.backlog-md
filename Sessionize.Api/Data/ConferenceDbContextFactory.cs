using Sessionize.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Sessionize.Api;

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
