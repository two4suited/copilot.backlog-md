---
id: TASK-53
title: Seed a large realistic test dataset for development and E2E testing
status: To Do
assignee: []
created_date: '2026-03-15 00:49'
labels:
  - testing
  - data
  - backend
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The current DbSeeder.cs only creates 1 conference, 2 speakers, 2 tracks, and 4 sessions. This is not enough to test pagination, filtering, search, schedule grid layout, or real-world UI behaviour. Expand the seed data to a volume that exercises every feature of the app.

Target data volume:
- 3 conferences (past, current, future) with varied dates/locations
- 15+ speakers with bios, companies, photos (use placeholder URLs like ui-avatars.com)
- 6+ tracks per conference with distinct colours
- 40+ sessions spread across tracks and time slots (multiple rooms, levels, types)
- At least 1 admin user and 3 regular users pre-seeded with registrations
- Sessions with varying seat counts (some nearly full, some empty, one sold out)
- Use realistic tech-conference content: talk titles, descriptions, speaker names

The seeder should be idempotent — safe to run multiple times without duplicating data. Keep the existing admin@conference.dev / Admin123! credentials.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 DbSeeder.cs creates 3 conferences with past/current/future dates
- [ ] #2 15+ speakers seeded with name, bio, company, and placeholder photo URL
- [ ] #3 Each conference has 6+ tracks with distinct colours
- [ ] #4 40+ sessions across tracks with realistic titles, descriptions, levels, types, rooms
- [ ] #5 3 regular user accounts seeded for testing registration flows
- [ ] #6 Some sessions have registrations to test seat availability display
- [ ] #7 At least one session is sold out (registrationCount == seatsTotal)
- [ ] #8 Seeder is idempotent — re-running does not duplicate data
- [ ] #9 E2E tests that relied on specific seed IDs are updated to query dynamically
<!-- AC:END -->
