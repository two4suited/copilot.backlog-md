---
id: TASK-20
title: Backend unit tests — xUnit for API controllers and services
status: In Progress
assignee:
  - '@copilot'
created_date: '2026-03-14 22:05'
updated_date: '2026-03-14 22:09'
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
