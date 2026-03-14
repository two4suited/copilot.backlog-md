---
id: TASK-5.1
title: 'FEATURE: Session Registration'
status: Done
assignee:
  - '@dotnet-developer'
created_date: '2026-03-14 21:13'
updated_date: '2026-03-14 21:52'
labels:
  - feature
  - backend
  - frontend
dependencies: []
parent_task_id: TASK-5
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Attendees can register for sessions up to the seat capacity. Cancellation supported. API enforces limits.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 POST /api/sessions/{id}/register creates registration for authenticated user
- [x] #2 DELETE /api/sessions/{id}/register cancels registration
- [x] #3 Returns 409 Conflict when session is full
- [x] #4 Register button on session card/detail shows correct state (Register / Registered / Full)
- [x] #5 Registration count decrements on cancellation
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implemented session registration API and UI.

API changes:
- POST /api/sessions/{id}/register: creates registration, enforces capacity (409 conflict if already registered, 400 if full), reactivates soft-deleted registrations to avoid unique index violation
- DELETE /api/sessions/{id}/register: soft-delete cancel
- GET /api/sessions/{id}/registrations: admin-only attendee list
- GET /api/users/me/registrations: authenticated user registered sessions
- Added RegistrationDtos.cs with RegisterSessionResponse, MyRegistrationsResponse, AttendeeDto
- Extended SessionDto with SeatsAvailable field

Frontend changes:
- Updated Session type with seatsTotal/seatsAvailable
- Added api.registrations service to api.ts
- Created MySchedulePage.tsx: sessions grouped by day with cancel button
- Added /my-schedule protected route in App.tsx
- Added My Schedule nav link in Layout.tsx
- Enhanced SessionDetailPage with cancel button via registrations API

Both dotnet build and npm run build pass 0 errors.
<!-- SECTION:FINAL_SUMMARY:END -->
