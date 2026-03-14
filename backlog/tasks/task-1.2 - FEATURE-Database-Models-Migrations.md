---
id: TASK-1.2
title: 'FEATURE: Database Models & Migrations'
status: Done
assignee:
  - '@database-developer'
created_date: '2026-03-14 21:11'
updated_date: '2026-03-14 21:30'
labels:
  - feature
  - database
  - backend
dependencies: []
parent_task_id: TASK-1
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Define all EF Core entity models, configure relationships in DbContext, generate initial migration, and add seed data so the app starts with demo content.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Models created: Conference, Track, Session, Speaker, User, Registration, SessionSpeaker (join)
- [x] #2 ConferenceDbContext configured with all DbSets and relationships
- [x] #3 Initial migration generated and applied on startup
- [x] #4 Seed data includes at least 1 conference, 2 tracks, 4 sessions, 2 speakers
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Created all entity models with Guid PKs (Conference, Track, Session, Speaker, SessionSpeaker, AppUser, Registration) plus BaseEntity base class. Renamed User→AppUser to avoid ASP.NET Identity conflict. Updated DbContext with all DbSets, composite PK for SessionSpeaker, unique indexes, cascade deletes, and SeedAsync() method. SeedAsync() seeds TechConf 2026, two tracks (Backend/Frontend), four sessions, and two speakers. dotnet build passes with 0 errors.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Created all EF Core models (Conference, Track, Session, Speaker, User, Registration, SessionSpeaker) inheriting from BaseEntity with Guid PKs, soft-delete flag, and audit timestamps. Implemented ConferenceDbContext with soft-delete query filters, cascade relationships, and indexes (StartDate, Email unique, composite TrackId+StartTime, UserId+SessionId unique). Created DbSeeder with TechConf 2026 demo data (1 conference, 2 tracks, 4 sessions, 2 speakers linked via SessionSpeaker). Added design-time factory so EF tooling works without a live DB. Generated InitialCreate migration. Updated Program.cs with async MigrateAsync + DbSeeder call on startup and Guid-typed route parameters throughout.
<!-- SECTION:FINAL_SUMMARY:END -->
