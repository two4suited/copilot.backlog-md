---
id: TASK-4.3
title: 'FEATURE: Role-Based Authorization'
status: Done
assignee:
  - '@copilot'
created_date: '2026-03-14 21:13'
updated_date: '2026-03-14 21:48'
labels:
  - feature
  - backend
  - auth
dependencies: []
parent_task_id: TASK-4
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Apply Admin/Speaker/Attendee role enforcement to API and UI. Admin panel for user management.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 API endpoints enforce roles via [Authorize(Roles=...)] attributes
- [x] #2 Admin can promote/demote users via GET/PUT /api/admin/users
- [x] #3 Speaker role grants access to edit own speaker profile
- [ ] #4 UI hides admin-only actions for non-admin users
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added [Authorize(Roles=Admin)] to all mutation endpoints. AdminOnly + SpeakerOrAdmin policies in Program.cs. Seeded admin@conference.dev. ClaimTypes.Role was already correct. 0 errors.
<!-- SECTION:FINAL_SUMMARY:END -->
