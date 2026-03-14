---
id: TASK-3.2
title: 'FEATURE: Speaker API'
status: In Progress
assignee:
  - '@dotnet-developer'
created_date: '2026-03-14 21:12'
updated_date: '2026-03-14 21:34'
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
REST endpoints for Speaker CRUD and speaker-session relationship management.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 GET /api/speakers returns paginated speaker list
- [ ] #2 GET /api/speakers/{id} returns profile with assigned sessions
- [ ] #3 POST/PUT/DELETE speaker endpoints (Admin only)
- [ ] #4 Speaker photo upload endpoint accepts image and stores URL
<!-- AC:END -->
