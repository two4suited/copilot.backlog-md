---
id: TASK-19
title: Admin Dashboard — conference/session/speaker management UI
status: Done
assignee:
  - '@copilot'
created_date: '2026-03-14 22:05'
updated_date: '2026-03-14 22:20'
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
Full admin dashboard UI — 15 files, 1293 insertions.

Backend: PUT /api/sessions/{id}/speakers for speaker assignment.
Shared: ConfirmDialog, Toast, useToast hook.
AdminLayout: sidebar nav + role guard (redirects non-Admin to /).
Layout: Admin nav link (Settings icon) shown only to Admin role.
6 admin pages: Conferences/Sessions/Speakers list (delete confirm) + form pages (create/edit, inline validation, toasts, breadcrumbs).
App.tsx: /admin/* routes nested under AdminLayout.

Builds with 0 TypeScript errors.
<!-- SECTION:FINAL_SUMMARY:END -->
