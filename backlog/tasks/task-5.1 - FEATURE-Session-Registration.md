---
id: TASK-5.1
title: 'FEATURE: Session Registration'
status: Done
assignee:
  - '@dotnet-developer'
created_date: '2026-03-14 21:13'
updated_date: '2026-03-14 21:52'
labels:
  - feature
  - backend
  - frontend
dependencies: []
parent_task_id: TASK-5
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Attendees can register for sessions up to the seat capacity. Cancellation supported. API enforces limits.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 POST /api/sessions/{id}/register creates registration for authenticated user
- [x] #2 DELETE /api/sessions/{id}/register cancels registration
- [x] #3 Returns 409 Conflict when session is full
- [x] #4 Register button on session card/detail shows correct state (Register / Registered / Full)
- [x] #5 Registration count decrements on cancellation
<!-- AC:END -->
