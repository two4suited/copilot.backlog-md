---
id: TASK-20
title: Backend unit tests — xUnit for API controllers and services
status: To Do
assignee: []
created_date: '2026-03-14 22:05'
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
- [ ] #1 ConferenceApp.Api.Tests project created and added to solution
- [ ] #2 AuthController tests: register, login valid, login invalid credentials
- [ ] #3 RegistrationsController tests: register, cancel, duplicate (409), over-capacity
- [ ] #4 dotnet test passes with all tests green
<!-- AC:END -->
