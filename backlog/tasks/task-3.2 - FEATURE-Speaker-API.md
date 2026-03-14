---
id: TASK-3.2
title: 'FEATURE: Speaker API'
status: Done
assignee:
  - '@dotnet-developer'
created_date: '2026-03-14 21:12'
updated_date: '2026-03-14 21:36'
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
- [x] #1 GET /api/speakers returns paginated speaker list
- [x] #2 GET /api/speakers/{id} returns profile with assigned sessions
- [x] #3 POST/PUT/DELETE speaker endpoints (Admin only)
- [x] #4 Speaker photo upload endpoint accepts image and stores URL
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
SpeakersController with list, detail (with sessions), create, update, soft-delete. Speaker detail shows all non-deleted sessions. DTOs added to ConferenceDtos.cs.
<!-- SECTION:FINAL_SUMMARY:END -->
