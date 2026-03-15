---
id: TASK-66
title: >-
  Bug: Schedule grid only shows sessions in first track column — other columns
  empty
status: In Progress
assignee:
  - '@agent-fix66'
created_date: '2026-03-15 01:46'
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
- [ ] #1 All 6 tracks show their sessions in the correct column
- [ ] #2 Sessions are correctly mapped to track columns by trackId
- [ ] #3 No empty placeholder columns visible when sessions exist for that track
<!-- AC:END -->
