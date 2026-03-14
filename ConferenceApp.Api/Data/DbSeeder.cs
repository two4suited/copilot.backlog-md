using ConferenceApp.Models;
using Microsoft.EntityFrameworkCore;

namespace ConferenceApp.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(ConferenceDbContext db)
    {
        if (await db.Conferences.IgnoreQueryFilters().AnyAsync()) return;

        var speaker1Id = Guid.NewGuid();
        var speaker2Id = Guid.NewGuid();
        var conferenceId = Guid.NewGuid();
        var track1Id = Guid.NewGuid();
        var track2Id = Guid.NewGuid();

        var conference = new Conference
        {
            Id = conferenceId,
            Name = "TechConf 2026",
            Description = "The premier conference for software developers and architects.",
            StartDate = new DateTime(2026, 6, 15, 9, 0, 0, DateTimeKind.Utc),
            EndDate = new DateTime(2026, 6, 16, 18, 0, 0, DateTimeKind.Utc),
            Location = "San Francisco, CA",
            WebsiteUrl = "https://techconf2026.example.com",
        };

        var speakers = new[]
        {
            new Speaker
            {
                Id = speaker1Id,
                Name = "Alice Chen",
                Bio = "Senior Software Engineer at Contoso, specialising in distributed systems and cloud architecture.",
                Email = "alice@example.com",
                Company = "Contoso",
                TwitterHandle = "@alicechen",
            },
            new Speaker
            {
                Id = speaker2Id,
                Name = "Bob Martinez",
                Bio = "Full-stack developer and open source contributor with 10 years of experience in .NET and React.",
                Email = "bob@example.com",
                Company = "Fabrikam",
                TwitterHandle = "@bobdev",
            },
        };

        var track1 = new Track
        {
            Id = track1Id,
            ConferenceId = conferenceId,
            Name = "Backend & APIs",
            Description = "Deep dives into .NET, APIs, databases, and cloud services.",
            Color = "#6366f1",
            SortOrder = 1,
        };

        var track2 = new Track
        {
            Id = track2Id,
            ConferenceId = conferenceId,
            Name = "Frontend & UX",
            Description = "Everything React, TypeScript, design systems, and accessibility.",
            Color = "#8b5cf6",
            SortOrder = 2,
        };

        var session1Id = Guid.NewGuid();
        var session2Id = Guid.NewGuid();
        var session3Id = Guid.NewGuid();
        var session4Id = Guid.NewGuid();

        var sessions = new[]
        {
            new Session
            {
                Id = session1Id,
                TrackId = track1Id,
                Title = "Building Scalable APIs with .NET Aspire",
                Description = "Learn how to build and orchestrate microservices using .NET Aspire, from local dev to production.",
                StartTime = new DateTime(2026, 6, 15, 10, 0, 0, DateTimeKind.Utc),
                EndTime = new DateTime(2026, 6, 15, 11, 0, 0, DateTimeKind.Utc),
                Room = "Hall A",
                Capacity = 200,
                SessionType = "Talk",
                Level = "Intermediate",
            },
            new Session
            {
                Id = session2Id,
                TrackId = track1Id,
                Title = "PostgreSQL Performance Tuning",
                Description = "Practical indexing strategies, query optimisation, and connection pooling for high-traffic applications.",
                StartTime = new DateTime(2026, 6, 15, 11, 30, 0, DateTimeKind.Utc),
                EndTime = new DateTime(2026, 6, 15, 12, 30, 0, DateTimeKind.Utc),
                Room = "Hall A",
                Capacity = 200,
                SessionType = "Talk",
                Level = "Advanced",
            },
            new Session
            {
                Id = session3Id,
                TrackId = track2Id,
                Title = "React 18 and Beyond",
                Description = "Concurrent rendering, server components, and what's next for the React ecosystem.",
                StartTime = new DateTime(2026, 6, 15, 10, 0, 0, DateTimeKind.Utc),
                EndTime = new DateTime(2026, 6, 15, 11, 0, 0, DateTimeKind.Utc),
                Room = "Hall B",
                Capacity = 150,
                SessionType = "Talk",
                Level = "Intermediate",
            },
            new Session
            {
                Id = session4Id,
                TrackId = track2Id,
                Title = "Design Systems with Tailwind CSS",
                Description = "Building consistent, accessible component libraries using Tailwind CSS and design tokens.",
                StartTime = new DateTime(2026, 6, 15, 11, 30, 0, DateTimeKind.Utc),
                EndTime = new DateTime(2026, 6, 15, 12, 30, 0, DateTimeKind.Utc),
                Room = "Hall B",
                Capacity = 150,
                SessionType = "Talk",
                Level = "Beginner",
            },
        };

        var sessionSpeakers = new[]
        {
            new SessionSpeaker { SessionId = session1Id, SpeakerId = speaker1Id },
            new SessionSpeaker { SessionId = session2Id, SpeakerId = speaker1Id },
            new SessionSpeaker { SessionId = session3Id, SpeakerId = speaker2Id },
            new SessionSpeaker { SessionId = session4Id, SpeakerId = speaker2Id },
        };

        db.Conferences.Add(conference);
        db.Speakers.AddRange(speakers);
        db.Tracks.AddRange(track1, track2);
        db.Sessions.AddRange(sessions);
        db.SessionSpeakers.AddRange(sessionSpeakers);

        await db.SaveChangesAsync();
    }
}
