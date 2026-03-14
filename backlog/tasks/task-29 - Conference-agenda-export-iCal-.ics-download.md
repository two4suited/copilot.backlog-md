---
id: TASK-29
title: 'Conference agenda export: iCal (.ics) download'
status: To Do
assignee: []
created_date: '2026-03-14 22:17'
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
- [ ] #1 GET /api/registrations/export/ical returns valid .ics file for authenticated user
- [ ] #2 Each VEVENT includes SUMMARY, DTSTART, DTEND, DESCRIPTION, LOCATION
- [ ] #3 Export button on MySchedule page triggers download
<!-- AC:END -->
