---
id: TASK-66
title: >-
  Bug: Schedule grid only shows sessions in first track column — other columns
  empty
status: Done
assignee:
  - '@agent-fix66'
created_date: '2026-03-15 01:46'
updated_date: '2026-03-15 02:10'
labels:
  - bug
  - frontend
  - schedule
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Screenshot shows the schedule grid has 4 columns but only the leftmost column (Backend & APIs) has session cards. Columns 2, 3, and 4 show empty dashed-border placeholder boxes.

Root cause candidates:
- Sessions are only being assigned to the first track in the data or the grid rendering logic is not correctly mapping sessions to their track column
- The DayGrid column rendering may be iterating tracks but only rendering sessions for tracks[0]
- Session data may only have a trackId matching the first track, with other tracks having no sessions in the current conference/day view
- The multi-column layout may have a CSS issue where columns 2+ overflow off-screen (visible as empty boxes)

File: frontend/src/pages/SchedulePage.tsx — check DayGrid column/session rendering logic
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 All 6 tracks show their sessions in the correct column
- [x] #2 Sessions are correctly mapped to track columns by trackId
- [x] #3 No empty placeholder columns visible when sessions exist for that track
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Root cause: tracks returned from GET /api/conferences/{id} were not ordered by sortOrder. EF navigation collections have no guaranteed ordering, so tracks arrived in arbitrary DB order. When rendering the schedule grid, Backend & APIs (sortOrder=1) could appear as column 6 while tracks with no sessions on that day occupied columns 1–4. Users saw sessions only in the first visible populated column with empty dashed boxes in between.

Fix:
- ConferencesController.Get: added .OrderBy(t => t.SortOrder) before mapping the Tracks collection to TrackDto. This ensures all clients receive tracks in intended order (Backend=1, Frontend=2, DevOps=3, Security=4, Data=5, Architecture=6).
- SchedulePage.tsx: replaced the plain tracks array assignment with a useMemo that spreads and sorts conference.tracks by sortOrder, providing a client-side safety net.

All 19 API tests pass. TypeScript compiles clean.
<!-- SECTION:FINAL_SUMMARY:END -->
