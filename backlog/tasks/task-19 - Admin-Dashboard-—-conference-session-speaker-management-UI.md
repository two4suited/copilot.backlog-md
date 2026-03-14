---
id: TASK-19
title: Admin Dashboard — conference/session/speaker management UI
status: Done
assignee:
  - '@copilot'
created_date: '2026-03-14 22:05'
updated_date: '2026-03-14 22:19'
labels:
  - frontend
  - react
  - admin
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Build a protected /admin section for admins to create, edit, and delete conferences, tracks, sessions, and speakers. Should include forms with validation, confirmation dialogs for deletes, and feedback toasts. Route guard: redirect to /login if not Admin role.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Admin-only route /admin/* redirects non-admins to home
- [x] #2 Admin can create/edit/delete conferences
- [x] #3 Admin can create/edit/delete sessions and assign speakers
- [x] #4 Admin can create/edit/delete speakers
- [x] #5 Forms validate required fields and show inline errors
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implemented full /admin protected section for managing conferences, sessions, and speakers.

**What changed:**
- Added AdminLayout (sidebar nav + role guard — redirects to / if not Admin)
- Admin link in main nav visible only to Admin role users
- ConferenceAdminPage/ConferenceFormPage — table + create/edit/delete with date pickers and inline validation
- SessionAdminPage/SessionFormPage — table + create/edit/delete with conference→track cascade selector, datetime-local inputs, multi-speaker checkbox selector
- SpeakerAdminPage/SpeakerFormPage — table + create/edit/delete (email read-only on edit)
- Shared ConfirmDialog, Toast, useToast for consistent UX
- Backend: added PUT /api/sessions/{id}/speakers endpoint (Admin-only) + UpdateSessionSpeakersRequest DTO so speaker assignments can be updated on edit
- services/api.ts extended with create/update/delete/updateSpeakers/listAll admin methods

**Tests:** `npm run build` passes with 0 TypeScript errors.
<!-- SECTION:FINAL_SUMMARY:END -->
