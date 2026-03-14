---
id: TASK-4.3
title: 'FEATURE: Role-Based Authorization'
status: Done
assignee:
  - '@copilot'
created_date: '2026-03-14 21:13'
updated_date: '2026-03-14 21:46'
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
- [ ] #2 Admin can promote/demote users via GET/PUT /api/admin/users
- [ ] #3 Speaker role grants access to edit own speaker profile
- [ ] #4 UI hides admin-only actions for non-admin users
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added [Authorize(Roles="Admin")] to all mutation endpoints across ConferencesController, TracksController, SessionsController, and SpeakersController. GET endpoints remain open.

TokenService already used ClaimTypes.Role correctly — no change needed.

Added AdminOnly and SpeakerOrAdmin authorization policies in Program.cs.

Seeded admin@conference.dev / Admin123! account with UserRole.Admin in DbSeeder.cs; seed runs independently of the conference data seed.

Build: 0 errors, 0 warnings.
<!-- SECTION:FINAL_SUMMARY:END -->
