---
id: TASK-70
title: 'Bug: Schedule page track column headers overlap first session row'
status: In Progress
assignee:
  - '@agent-fix70'
created_date: '2026-03-15 01:48'
updated_date: '2026-03-15 01:54'
labels:
  - bug
  - frontend
  - schedule
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The track column headers (showing track names like 'Backend & APIs', 'Data & AI', etc.) are rendering inside / at the same vertical position as the first time-slot row instead of sitting above all session rows.

This is a sticky positioning issue. The column headers are likely using `sticky top-[116px]` (nav 64px + filter bar 52px) but the first time row is also starting at that same offset, causing the header to visually sit on top of the first session.

Fix candidates in frontend/src/pages/SchedulePage.tsx:
- The column headers need a higher `top-[]` offset, OR the session grid needs more padding-top to clear them
- Alternatively, the column header row may not be a sticky row at all — it should be a fixed-height header row ABOVE the scrollable grid, not sticky within it
- Check the DayGrid component structure: headers should be outside the scrollable time-slot container, not inside it
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Track column headers sit above all session rows, not overlapping the first row
- [ ] #2 Headers are visible and fixed when scrolling horizontally and vertically
- [ ] #3 First session time slot is fully visible below the header row
<!-- AC:END -->
