using Sessionize.Models;
using Microsoft.EntityFrameworkCore;

namespace Sessionize.Api.Data;

public class ConferenceDbContext : DbContext
{
    public ConferenceDbContext(DbContextOptions<ConferenceDbContext> options) : base(options) { }

    public DbSet<Conference> Conferences => Set<Conference>();
    public DbSet<Track> Tracks => Set<Track>();
    public DbSet<Session> Sessions => Set<Session>();
    public DbSet<Speaker> Speakers => Set<Speaker>();
    public DbSet<SessionSpeaker> SessionSpeakers => Set<SessionSpeaker>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Registration> Registrations => Set<Registration>();
    public DbSet<SessionRating> SessionRatings => Set<SessionRating>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<SessionSpeaker>()
            .HasKey(ss => new { ss.SessionId, ss.SpeakerId });

        modelBuilder.Entity<Conference>().HasQueryFilter(c => !c.IsDeleted);
        modelBuilder.Entity<Track>().HasQueryFilter(t => !t.IsDeleted);
        modelBuilder.Entity<Session>().HasQueryFilter(s => !s.IsDeleted);
        modelBuilder.Entity<Speaker>().HasQueryFilter(s => !s.IsDeleted);
        modelBuilder.Entity<User>().HasQueryFilter(u => !u.IsDeleted);
        modelBuilder.Entity<Registration>().HasQueryFilter(r => !r.IsDeleted);
        // SessionSpeaker is a join entity — filter mirrors Session and Speaker so EF warning 10622 is resolved
        modelBuilder.Entity<SessionSpeaker>().HasQueryFilter(ss => !ss.Session.IsDeleted && !ss.Speaker.IsDeleted);
        modelBuilder.Entity<SessionRating>().HasQueryFilter(sr => !sr.IsDeleted);

        modelBuilder.Entity<Conference>()
            .HasMany(c => c.Tracks)
            .WithOne(t => t.Conference)
            .HasForeignKey(t => t.ConferenceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Track>()
            .HasMany(t => t.Sessions)
            .WithOne(s => s.Track)
            .HasForeignKey(s => s.TrackId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Session>()
            .HasMany(s => s.Registrations)
            .WithOne(r => r.Session)
            .HasForeignKey(r => r.SessionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<User>()
            .HasMany(u => u.Registrations)
            .WithOne(r => r.User)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SessionSpeaker>()
            .HasOne(ss => ss.Session)
            .WithMany(s => s.SessionSpeakers)
            .HasForeignKey(ss => ss.SessionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SessionSpeaker>()
            .HasOne(ss => ss.Speaker)
            .WithMany(sp => sp.SessionSpeakers)
            .HasForeignKey(ss => ss.SpeakerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Conference>().HasIndex(c => c.StartDate);
        modelBuilder.Entity<Conference>().HasIndex(c => c.IsDeleted);
        modelBuilder.Entity<Session>().HasIndex(s => s.StartTime);
        modelBuilder.Entity<Session>().HasIndex(s => new { s.TrackId, s.StartTime });
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<Speaker>().HasIndex(sp => sp.Email).IsUnique();
        modelBuilder.Entity<Registration>().HasIndex(r => new { r.UserId, r.SessionId }).IsUnique();

        modelBuilder.Entity<Session>()
            .HasMany(s => s.Ratings)
            .WithOne(r => r.Session)
            .HasForeignKey(r => r.SessionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<User>()
            .HasMany(u => u.Ratings)
            .WithOne(r => r.User)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SessionRating>()
            .HasIndex(r => new { r.UserId, r.SessionId }).IsUnique();
        modelBuilder.Entity<SessionRating>()
            .Property(r => r.Comment).HasMaxLength(500);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>()
            .Where(e => e.State == EntityState.Modified))
        {
            entry.Entity.UpdatedAt = DateTime.UtcNow;
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}
