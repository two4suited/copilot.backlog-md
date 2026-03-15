---
id: TASK-68
title: 'Bug: Schedule page session times still showing UTC instead of venue timezone'
status: In Progress
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
