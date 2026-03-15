---
id: TASK-53
title: Seed a large realistic test dataset for development and E2E testing
status: In Progress
assignee:
  - '@agent-seeder'
created_date: '2026-03-15 00:49'
updated_date: '2026-03-15 01:02'
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
- [x] #1 DbSeeder.cs creates 3 conferences with past/current/future dates
- [x] #2 15+ speakers seeded with name, bio, company, and placeholder photo URL
- [x] #3 Each conference has 6+ tracks with distinct colours
- [x] #4 40+ sessions across tracks with realistic titles, descriptions, levels, types, rooms
- [x] #5 3 regular user accounts seeded for testing registration flows
- [x] #6 Some sessions have registrations to test seat availability display
- [x] #7 At least one session is sold out (registrationCount == seatsTotal)
- [x] #8 Seeder is idempotent — re-running does not duplicate data
- [x] #9 E2E tests that relied on specific seed IDs are updated to query dynamically
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Rewrite DbSeeder.cs with 3 conferences (past 2023/current 2025/future 2026), 17 speakers, 6 tracks per conference, 14 sessions per conference (42 total), 3 test users + registrations, one sold-out session
2. Update comprehensive-audit.spec.ts to fetch conference/session/speaker IDs dynamically via API in beforeAll instead of using hardcoded constants
3. Build API to verify no compile errors
4. Check all ACs and finalize
<!-- SECTION:PLAN:END -->
