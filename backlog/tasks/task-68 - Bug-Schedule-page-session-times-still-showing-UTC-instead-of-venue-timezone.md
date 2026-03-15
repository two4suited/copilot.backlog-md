---
id: TASK-68
title: 'Bug: Schedule page session times still showing UTC instead of venue timezone'
status: Done
assignee:
  - '@agent-fix68'
created_date: '2026-03-15 01:46'
updated_date: '2026-03-15 01:56'
labels:
  - bug
  - frontend
  - timezone
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Screenshot shows session times as '01:00 PM UTC', '09:00 AM UTC', '10:30 AM UTC' — the TASK-47 timezone fix should be displaying the venue's local timezone (e.g. '09:00 AM PDT' for a San Francisco conference).

Possible causes:
- The Conference.Timezone field may be null or empty in the current seed data  
- The ConferenceTimezone field may not be included in the SessionDto returned by the API
- The frontend time formatting utility (src/utils/time.ts) may be falling back to UTC when timezone is missing
- The schedule page may not be passing the conference timezone down to the DayGrid/session card components

Verify: curl -k 'https://localhost:7133/api/sessions?conferenceId=<id>' | python3 -m json.tool | grep -i timezone
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Session times displayed in venue timezone (e.g. PDT, EST) not UTC
- [x] #2 Conference.Timezone is populated in the database for all seeded conferences
- [x] #3 ConferenceTimezone is included in SessionDto API response
- [x] #4 Fallback gracefully shows UTC label if timezone is genuinely unknown
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Fixed session times displaying as UTC on the Schedule page instead of venue timezone.

**Root cause:** DbSeeder.cs created all conferences without a `Timezone` property, so they all defaulted to "UTC". The API, DTOs, and frontend code were all correct — the data was just missing.

**Changes:**
- `ConferenceApp.Api/Data/DbSeeder.cs`: Added `Timezone` property to all three seeded conferences based on their location:
  - TechConf 2023 (New York, NY) → `America/New_York`
  - DevSummit 2025 (Chicago, IL) → `America/Chicago`
  - TechConf 2026 (San Francisco, CA) → `America/Los_Angeles`
- Updated existing DB records via SQL to match.

**Verification:** API now returns correct IANA timezone identifiers; `date-fns-tz` on the frontend renders e.g. "01:00 PM CDT" instead of "01:00 PM UTC". All 19 existing tests pass.
<!-- SECTION:FINAL_SUMMARY:END -->
