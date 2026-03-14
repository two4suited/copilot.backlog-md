---
id: TASK-29
title: 'Conference agenda export: iCal (.ics) download'
status: Done
assignee:
  - '@dotnet-developer'
created_date: '2026-03-14 22:17'
updated_date: '2026-03-14 22:19'
labels:
  - backend
  - frontend
  - feature
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Allow attendees to export their personal schedule as an iCal file. GET /api/registrations/export/ical returns a .ics file with one VEVENT per registered session. Also add an Export button on the MySchedule page.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 GET /api/registrations/export/ical returns valid .ics file for authenticated user
- [x] #2 Each VEVENT includes SUMMARY, DTSTART, DTEND, DESCRIPTION, LOCATION
- [x] #3 Export button on MySchedule page triggers download
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added GET /api/registrations/export/ical endpoint to RegistrationsController and an Export to Calendar button on MySchedulePage.

**Backend (RegistrationsController.cs):**
- New ExportIcal action queries active registrations with Session+Track includes
- Builds RFC 5545-compliant VCALENDAR with one VEVENT per session (UID, DTSTAMP, DTSTART, DTEND, SUMMARY, DESCRIPTION, LOCATION)
- Description truncated to 500 chars; commas, semicolons, newlines escaped per spec
- LOCATION: Room field with fallback to Track name
- Returns text/calendar response with filename my-schedule.ics

**Frontend (MySchedulePage.tsx):**
- Added useAuth hook to access JWT token
- handleExport fetches the endpoint with Bearer token and triggers browser file download
- Export to Calendar button in page header (visible when user has sessions), styled consistently with existing buttons

Both dotnet and Vite builds pass with zero warnings or errors.
<!-- SECTION:FINAL_SUMMARY:END -->
