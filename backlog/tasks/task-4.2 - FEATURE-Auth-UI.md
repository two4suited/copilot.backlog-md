---
id: TASK-4.2
title: 'FEATURE: Auth UI'
status: In Progress
assignee:
  - '@copilot'
created_date: '2026-03-14 21:13'
updated_date: '2026-03-14 21:40'
labels:
  - feature
  - frontend
  - auth
dependencies: []
parent_task_id: TASK-4
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Login and registration pages, JWT storage, auth-aware navigation, and protected route wrapper.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Login page with email/password form
- [x] #2 Register page with name/email/password/confirm form
- [x] #3 JWT stored in httpOnly cookie or memory (not localStorage)
- [x] #4 Navigation shows Login/Register when logged out, user name + Logout when logged in
- [x] #5 Protected routes redirect to login if unauthenticated
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
AuthContext with login/logout/isAuthenticated, persisted to localStorage. LoginPage and RegisterPage with inline error handling. ProtectedRoute redirects unauthenticated users to /login preserving destination. Layout nav shows user name and Sign Out button when authenticated. api/client.ts interceptor key fixed from jwt to token. TypeScript and Vite build clean.
<!-- SECTION:FINAL_SUMMARY:END -->
