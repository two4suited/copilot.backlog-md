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
