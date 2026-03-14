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

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Created ConferenceApp.Api.Tests/ xUnit project targeting net10.0 with EF Core InMemory provider.

**New files:**
- `ConferenceApp.Api.Tests.csproj` — xUnit + EF InMemory; framework ref to Microsoft.AspNetCore.App; project ref to ConferenceApp.Api
- `Helpers/TestDbContext.cs` — factory for isolated in-memory DbContext per test
- `Helpers/FakeHubContext.cs` — no-op IHubContext<SessionHub> (avoids Moq)
- `Controllers/AuthControllerTests.cs` — 5 tests: register valid, duplicate email (409), login valid, wrong password (401), unknown email (401)
- `Controllers/RegistrationsControllerTests.cs` — 5 tests: register available, duplicate (409), at capacity (400), cancel (204), cancel non-existent (404)
- `Controllers/SessionsControllerTests.cs` — 9 tests: list by conference, get existing, get 404, create 201, create bad track 400, update 204, update 404, delete 204, delete 404

**Result:** 19/19 tests green; `dotnet test` passes with no warnings.
<!-- SECTION:FINAL_SUMMARY:END -->
