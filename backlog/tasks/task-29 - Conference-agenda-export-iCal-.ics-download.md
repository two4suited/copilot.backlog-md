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
Implemented iCal export for personal schedule.

Backend: GET /api/registrations/export/ical (authorized) builds RFC 5545 VCALENDAR with one VEVENT per registered session — UID, DTSTAMP, DTSTART, DTEND, SUMMARY, DESCRIPTION (≤500 chars, escaped), LOCATION (Room → Track fallback). Returns text/calendar as my-schedule.ics.

Frontend: Export to Calendar button on MySchedulePage header (shown when sessions exist) fetches endpoint with Bearer token and triggers browser download via blob URL.
<!-- SECTION:FINAL_SUMMARY:END -->
