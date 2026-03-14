---
id: TASK-3.3
title: 'FEATURE: Schedule View'
status: Done
assignee:
  - '@react-developer'
created_date: '2026-03-14 21:12'
updated_date: '2026-03-14 21:50'
labels:
  - feature
  - frontend
  - react
dependencies: []
parent_task_id: TASK-3
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
A visual conference schedule page showing sessions in a time-grid format, filterable by track. Main navigation destination for attendees.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Schedule page shows sessions in a time-grid (rows=time slots, columns=tracks)
- [x] #2 Session cards show title, speaker name, room, and seat availability
- [x] #3 Filter bar allows filtering by track
- [x] #4 Day selector shown for multi-day conferences
- [x] #5 Clicking a session card opens the session detail modal/page
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implemented full schedule grid view in SchedulePage.tsx.

**What changed:**
- Added `api.sessions.listByConference(conferenceId)` to services/api.ts fetching `/conferences/:id/sessions`
- Replaced SchedulePage stub with a fully functional time-grid component

**Features:**
- Day tabs at top for multi-day conferences (Day 1 — March 14, etc.)
- Track filter bar: toggle individual tracks; pill buttons with colour dot
- Desktop CSS grid: sticky time column on left, one column per visible track, rows per time slot
- Mobile stacked view: time label followed by session cards full-width
- SessionCard shows: title, speaker name(s), room, seats remaining, level badge, duration
- Empty slots shown as dashed grey placeholders
- Clicking any session card navigates to /sessions/:id
- Conference selector dropdown shown when multiple conferences exist

**Data flow:** conferences → conference detail (tracks) → sessions grouped by dayKey → timeSlot index

**Build:** 0 errors, 0 warnings
<!-- SECTION:FINAL_SUMMARY:END -->
