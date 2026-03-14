---
id: TASK-2.1
title: 'FEATURE: Conference API'
status: In Progress
assignee:
  - '@dotnet-developer'
created_date: '2026-03-14 21:12'
updated_date: '2026-03-14 21:30'
labels:
  - feature
  - backend
  - api
dependencies: []
parent_task_id: TASK-2
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
REST endpoints for Conference CRUD. Returns paginated conference list. Secured: write actions require Admin role.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 GET /api/conferences returns paginated list
- [ ] #2 GET /api/conferences/{id} returns single conference with tracks
- [ ] #3 POST /api/conferences creates conference (Admin only)
- [ ] #4 PUT /api/conferences/{id} updates conference (Admin only)
- [ ] #5 DELETE /api/conferences/{id} soft-deletes conference (Admin only)
- [ ] #6 Returns 404 for unknown id, 422 for validation errors
<!-- AC:END -->
