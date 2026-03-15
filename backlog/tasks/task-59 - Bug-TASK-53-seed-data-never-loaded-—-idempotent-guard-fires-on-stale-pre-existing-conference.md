---
id: TASK-59
title: >-
  Bug: TASK-53 seed data never loaded — idempotent guard fires on stale
  pre-existing conference
status: In Progress
assignee:
  - '@copilot'
created_date: '2026-03-15 01:14'
updated_date: '2026-03-15 01:22'
labels:
  - bug
  - data
  - backend
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The DbSeeder.cs rewrite from TASK-53 was never applied to the database. The guard at line 56 —\n\n    if (await db.Conferences.IgnoreQueryFilters().AnyAsync()) return;\n\n— fires immediately because an old TechConf 2026 record already exists in the DB (seeded before TASK-53). The entire new seed block is skipped, leaving the database in a stale, incomplete state.\n\nActual vs Expected:\n- Conferences: 1 found (TechConf 2026, old truncated data) vs 3 expected (TechConf 2023, DevSummit 2025, TechConf 2026)\n- Speakers: 4 found (Alice Chen, Bob Martinez, Brian Sheridan, 1 audit test speaker) vs 17 expected\n- Tracks: 2 found (Backend & APIs + Frontend & UX for 2026 only) vs 18 expected (6 per conference x 3 conferences)\n- Sessions: 4 found vs 43 expected\n\nThe existing TechConf 2026 record also has a truncated description ('The premier conference for software developers and architects.') rather than the full TASK-53 text. Existing sessions have old, shorter descriptions that do not match DbSeeder.cs.\n\nFix options:\n1. Drop and re-create the database (simplest for dev), then restart the API so SeedAsync runs cleanly.\n2. OR make the idempotent guard smarter: check for the specific seed markers or record counts rather than just AnyAsync(), so re-seeding can happen when the data is incomplete or stale.\n3. Optionally prefix the guard with a delete of the old stale data before re-inserting.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 GET /api/conferences returns exactly 3 conferences: TechConf 2023, DevSummit 2025, TechConf 2026
- [x] #2 GET /api/speakers returns exactly 17 speakers (Alice Chen through Quinn Robinson)
- [x] #3 GET /api/tracks?conferenceId=<id> returns 6 tracks for each conference (18 total)
- [x] #4 GET /api/sessions returns 43 total sessions (14 for 2023, 15 for 2025, 14 for 2026)
- [x] #5 TechConf 2026 conference description matches the full text in DbSeeder.cs line 117
- [x] #6 Sessions have descriptions matching DbSeeder.cs (not the old shorter versions)
- [x] #7 user1@test.dev has expected seeded registrations from DbSeeder.cs
<!-- AC:END -->
