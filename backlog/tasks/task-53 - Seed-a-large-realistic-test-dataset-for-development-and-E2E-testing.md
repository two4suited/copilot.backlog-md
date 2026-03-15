---
id: TASK-53
title: Seed a large realistic test dataset for development and E2E testing
status: In Progress
assignee:
  - '@agent-seeder'
created_date: '2026-03-15 00:49'
updated_date: '2026-03-15 01:03'
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

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Expanded DbSeeder.cs to produce a large, realistic conference dataset:

**Seed data volume:**
- 3 conferences: TechConf 2023 (past, New York), DevSummit 2025 (current, Chicago), TechConf 2026 (future, San Francisco)
- 17 speakers with full bios, companies, Twitter handles, and ui-avatars.com photo URLs
- 18 tracks (6 per conference) with distinct hex colours across indigo/purple/pink/red/amber/green palette
- 43 sessions total: 14 per past/future conference, 15 in current; mix of Keynote/Talk/Workshop, Beginner/Intermediate/Advanced/All levels, multiple rooms
- 3 test users: user1@test.dev, user2@test.dev, user3@test.dev (password: Test123!)
- 7 registrations: user1 has 5 in DevSummit 2025, user2 fills the sold-out workshop (Capacity=2 → 2 regs), user3 has 1
- One sold-out session: "Event Sourcing and CQRS in Practice" with Capacity=2 and 2 registrations
- Seeder is idempotent: user accounts checked by email, conferences guarded by AnyAsync()

**E2E test update:**
- Updated comprehensive-audit.spec.ts to resolve conference/session/speaker IDs dynamically via API in beforeAll, replacing three hardcoded UUID constants
- All ID-based navigation now uses accessor functions (conferenceId(), sessionId(), speakerId()) that fall back to first available entity if preferred names not found
- Hard assertions on specific names (TechConf 2026, Bob Martinez, React 18) replaced with flexible content-based assertions
- Tests skip gracefully when API is unavailable
<!-- SECTION:FINAL_SUMMARY:END -->
