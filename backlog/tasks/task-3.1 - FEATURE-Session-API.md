---
id: TASK-3.1
title: 'FEATURE: Session API'
status: To Do
assignee: []
created_date: '2026-03-14 21:12'
updated_date: '2026-03-14 21:19'
labels:
  - feature
  - backend
  - api
dependencies: []
parent_task_id: TASK-3
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
REST endpoints for Session CRUD nested under a track, including speaker assignment endpoints.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 GET /api/sessions returns sessions (filterable by conference, track, date)
- [ ] #2 GET /api/sessions/{id} returns session with speakers
- [ ] #3 POST/PUT/DELETE session endpoints (Admin only)
- [ ] #4 POST /api/sessions/{id}/speakers adds speaker to session
- [ ] #5 DELETE /api/sessions/{id}/speakers/{speakerId} removes speaker
- [ ] #6 Conflict returned if session times overlap in the same room
<!-- AC:END -->
