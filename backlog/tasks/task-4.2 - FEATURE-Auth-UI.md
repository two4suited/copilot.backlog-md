---
id: TASK-4.2
title: 'FEATURE: Auth UI'
status: In Progress
assignee:
  - '@react-developer'
created_date: '2026-03-14 21:13'
updated_date: '2026-03-14 21:34'
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
- [ ] #1 Login page with email/password form
- [ ] #2 Register page with name/email/password/confirm form
- [ ] #3 JWT stored in httpOnly cookie or memory (not localStorage)
- [ ] #4 Navigation shows Login/Register when logged out, user name + Logout when logged in
- [ ] #5 Protected routes redirect to login if unauthenticated
<!-- AC:END -->
