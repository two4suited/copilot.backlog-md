---
id: TASK-19
title: Admin Dashboard — conference/session/speaker management UI
status: Done
assignee:
  - '@copilot'
created_date: '2026-03-14 22:05'
updated_date: '2026-03-14 22:18'
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
Implemented full protected /admin section. Backend: added PUT /api/sessions/{id}/speakers endpoint (Admin-only) and UpdateSessionSpeakersRequest DTO. Frontend: AdminLayout with sidebar nav and role guard (redirects non-admins to /); 6 admin pages for conferences/sessions/speakers with create/edit/delete; cascade conference->track selects in SessionFormPage; speaker multi-select checkboxes; email disabled on speaker edit; shared useToast, Toast, and ConfirmDialog components; Admin nav link in Layout for Admin role users. Build passes with 0 TypeScript errors.
<!-- SECTION:FINAL_SUMMARY:END -->
