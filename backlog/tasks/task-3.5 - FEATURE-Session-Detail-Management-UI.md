---
id: TASK-3.5
title: 'FEATURE: Session Detail & Management UI'
status: Done
assignee:
  - '@copilot'
created_date: '2026-03-14 21:12'
updated_date: '2026-03-14 21:49'
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
Session detail view and admin create/edit forms. Includes speaker assignment UI.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Session detail shows title, description, time, room, capacity, speakers
- [x] #2 Admin create/edit form includes all session fields
- [x] #3 Admin can assign/unassign speakers via search-select in the form
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
SessionDetailPage with breadcrumb, level badge, seat availability, register button (auth-gated), speaker cards. SpeakersPage grid. SpeakerDetailPage with social links + session list. Routes wired. api.ts register/unregister added. 0 TS errors.
<!-- SECTION:FINAL_SUMMARY:END -->
