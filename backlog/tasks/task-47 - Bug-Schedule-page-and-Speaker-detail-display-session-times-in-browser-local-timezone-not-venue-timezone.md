---
id: TASK-47
title: >-
  Bug: Schedule page and Speaker detail display session times in browser local
  timezone, not venue timezone
status: In Progress
assignee:
  - '@agent-timezone'
created_date: '2026-03-15 00:44'
updated_date: '2026-03-15 00:53'
labels:
  - bug
  - ux
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The SchedulePage and SpeakerDetailPage display session times using the browser's local timezone via toLocaleTimeString('en-US'). Sessions for TechConf 2026 (San Francisco, CA) are stored with start times such as 2026-06-15T10:00:00Z. In the browser (Pacific timezone, UTC-7), this renders as 03:00 AM instead of 10:00 AM.

URL: /schedule, /speakers/:id
Action: Visit the schedule page or a speaker detail page with active sessions
Expected: Session times should be clearly meaningful (e.g., labeled with timezone, or shown in venue/UTC time)
Actual: Times show as 03:00 AM and 04:30 AM for a daytime San Francisco conference

Root cause: fmtTime() in SchedulePage.tsx uses new Date(iso).toLocaleTimeString() which converts UTC ISO strings to the browser's local timezone without any timezone label or correction.

Fix options:
1. Display times in UTC and show 'UTC' label
2. Display times in the conference venue timezone (requires timezone field on Conference)
3. At minimum, add a timezone indicator so users understand the time context
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Session times are displayed with timezone context (e.g., UTC label or venue timezone)
- [ ] #2 Times are not misleadingly shown in browser-local timezone without indication
- [ ] #3 Schedule page is consistent with session detail page times
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add Timezone field to Conference model
2. Update DTOs (ConferenceDto, SessionDto, SessionSummaryDto)
3. Update all controllers to pass timezone
4. Update DbSeeder with timezone
5. Add EF Core migration
6. Install date-fns-tz in frontend
7. Update TypeScript types
8. Create shared time formatting utility
9. Update all frontend pages to use venue timezone
<!-- SECTION:PLAN:END -->
