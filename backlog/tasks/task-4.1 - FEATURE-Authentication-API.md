---
id: TASK-4.1
title: 'FEATURE: Authentication API'
status: In Progress
assignee:
  - '@dotnet-developer'
created_date: '2026-03-14 21:13'
updated_date: '2026-03-14 21:30'
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
JWT-based login/register endpoints. Issues tokens with role claims. Refresh token support.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 POST /api/auth/register creates user account with hashed password
- [ ] #2 POST /api/auth/login returns JWT access token and refresh token
- [ ] #3 POST /api/auth/refresh exchanges refresh token for new access token
- [ ] #4 Token includes userId, email, and role claims
- [ ] #5 Passwords hashed with bcrypt
- [ ] #6 Returns 401 for invalid credentials
<!-- AC:END -->
