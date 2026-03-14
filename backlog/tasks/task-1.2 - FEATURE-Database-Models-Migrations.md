---
id: TASK-1.2
title: 'FEATURE: Database Models & Migrations'
status: In Progress
assignee:
  - '@database-developer'
created_date: '2026-03-14 21:11'
updated_date: '2026-03-14 21:29'
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
- [ ] #3 Initial migration generated and applied on startup
- [x] #4 Seed data includes at least 1 conference, 2 tracks, 4 sessions, 2 speakers
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Created all entity models with Guid PKs (Conference, Track, Session, Speaker, SessionSpeaker, AppUser, Registration) plus BaseEntity base class. Renamed User→AppUser to avoid ASP.NET Identity conflict. Updated DbContext with all DbSets, composite PK for SessionSpeaker, unique indexes, cascade deletes, and SeedAsync() method. SeedAsync() seeds TechConf 2026, two tracks (Backend/Frontend), four sessions, and two speakers. dotnet build passes with 0 errors.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## TASK-1.2: Database Models & Migrations

### What Changed
- All EF Core entity models created in `ConferenceApp.Models/` with Guid PKs
- `User.cs` renamed to `AppUser.cs` (class `AppUser`, avoids ASP.NET Identity collision)
- `ConferenceDbContext` fully configured: all DbSets, composite PK on SessionSpeaker, unique index on AppUser.Email and Speaker.Email, cascade deletes
- `SeedAsync()` method added to DbContext — inserts TechConf 2026 conference, Backend + Frontend tracks, 4 sessions, 2 speakers if DB is empty
- `Program.cs` updated to call `SeedAsync()` via DbSeeder on startup

### Build
`dotnet build` → **0 errors, 0 warnings**

### Notes
AC #3 (initial migration) is deferred — Aspire agent wires up connection string first.
<!-- SECTION:FINAL_SUMMARY:END -->
