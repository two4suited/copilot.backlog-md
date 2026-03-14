---
id: TASK-2.1
title: 'FEATURE: Conference API'
status: Done
assignee:
  - '@dotnet-developer'
created_date: '2026-03-14 21:12'
updated_date: '2026-03-14 21:32'
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
- [x] #1 GET /api/conferences returns paginated list
- [x] #2 GET /api/conferences/{id} returns single conference with tracks
- [x] #3 POST /api/conferences creates conference (Admin only)
- [x] #4 PUT /api/conferences/{id} updates conference (Admin only)
- [x] #5 DELETE /api/conferences/{id} soft-deletes conference (Admin only)
- [x] #6 Returns 404 for unknown id, 422 for validation errors
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implemented ConferencesController with GET (paginated list), GET/{id} (with tracks), POST, PUT, soft-delete DELETE. DTOs in ConferenceApp.Api/DTOs/ConferenceDtos.cs. ProblemDetails wired via AddProblemDetails() + global exception handler middleware returning 500 problem+json. Removed conflicting minimal-API conference routes from Program.cs and added AddControllers()/MapControllers().
<!-- SECTION:FINAL_SUMMARY:END -->
