---
id: TASK-63
title: 'Bug: Schedule page filter bar overlaps the session grid'
status: To Do
assignee: []
created_date: '2026-03-15 01:31'
labels:
  - bug
  - frontend
  - ui
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
On the Schedule page, the filter/track-selector bar is overlapping the session grid below it. Sessions or time slots are hidden behind the filter bar, making the schedule unreadable.

Likely causes:
- Filter bar has `position: sticky` or `position: fixed` without enough top offset
- The session grid container lacks sufficient `padding-top` or `margin-top` to account for the filter bar height
- z-index stacking issue causing the filter to render over grid content
- After the TASK-54/56 redesign, the filter bar height may have changed but the grid offset wasn't updated

File to investigate: `frontend/src/pages/SchedulePage.tsx`
Also check any sticky header logic in `frontend/src/components/` related to schedule/track filtering.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Filter bar no longer overlaps session grid content
- [ ] #2 All time slots and sessions are fully visible below the filter bar
- [ ] #3 Sticky positioning (if used) has correct top offset accounting for nav + filter bar height
- [ ] #4 Fix verified at both desktop (1280px) and mobile (375px) viewport widths
<!-- AC:END -->
