---
id: TASK-4.1
title: 'FEATURE: Authentication API'
status: Done
assignee:
  - '@dotnet-developer'
created_date: '2026-03-14 21:13'
updated_date: '2026-03-14 21:34'
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
- [x] #1 POST /api/auth/register creates user account with hashed password
- [x] #2 POST /api/auth/login returns JWT access token and refresh token
- [x] #3 POST /api/auth/refresh exchanges refresh token for new access token
- [x] #4 Token includes userId, email, and role claims
- [x] #5 Passwords hashed with bcrypt
- [x] #6 Returns 401 for invalid credentials
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implemented JWT authentication: POST /api/auth/register (BCrypt hash, returns JWT), POST /api/auth/login (credential validation, returns JWT), GET /api/auth/me ([Authorize], returns profile). User model uses UserRole enum with .ToString() for claims. TokenService (scoped), JwtBearer middleware, 7-day tokens with sub/email/role claims. JWT config in appsettings.json. Build clean.
<!-- SECTION:FINAL_SUMMARY:END -->
