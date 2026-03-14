---
id: TASK-20
title: Backend unit tests — xUnit for API controllers and services
status: Done
assignee:
  - '@copilot'
created_date: '2026-03-14 22:05'
updated_date: '2026-03-14 22:10'
labels:
  - backend
  - testing
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Write xUnit unit tests for the ConferenceApp.Api project. Cover: AuthController (register/login happy+sad paths), SessionsController (CRUD, capacity enforcement), RegistrationsController (register/cancel/duplicate detection). Use Moq for EF DbContext mocking or use an in-memory SQLite provider.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 ConferenceApp.Api.Tests project created and added to solution
- [x] #2 AuthController tests: register, login valid, login invalid credentials
- [x] #3 RegistrationsController tests: register, cancel, duplicate (409), over-capacity
- [x] #4 dotnet test passes with all tests green
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
19 xUnit tests passing across 3 controller test classes.

- AuthControllerTests (5): register, duplicate email 409, login, wrong password 401, unknown email 401
- RegistrationsControllerTests (5): register, duplicate 409, at-capacity 400, cancel 204, cancel-missing 404
- SessionsControllerTests (9): list by conference, get/404, create 201/bad-track 400, update 204/404, delete 204/404

Used EF Core InMemory provider and FakeSessionHubContext to avoid Moq for SignalR. ClaimsPrincipal injected via ControllerContext.
<!-- SECTION:FINAL_SUMMARY:END -->
