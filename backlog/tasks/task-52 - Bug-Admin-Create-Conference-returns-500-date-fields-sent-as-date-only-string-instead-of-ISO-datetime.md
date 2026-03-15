---
id: TASK-52
title: >-
  Bug: Admin Create Conference returns 500 - date fields sent as date-only
  string instead of ISO datetime
status: In Progress
assignee:
  - '@agent-fix52'
created_date: '2026-03-15 00:49'
updated_date: '2026-03-15 00:52'
labels:
  - bug
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
When creating a new conference via /admin/conferences/new, the form uses HTML <input type='date'> fields which return values like '2027-03-01'. The ConferenceFormPage submits these directly to the API as startDate and endDate. The .NET API expects ISO 8601 DateTimeOffset values (e.g., '2027-03-01T00:00:00Z') and returns a 500 Internal Server Error when given date-only strings.

URL: /admin/conferences/new
Action: Fill all required fields (Name, Start Date, End Date, Location) and click 'Create Conference'
Expected: Conference is created, user is redirected to /admin/conferences
Actual: HTTP 500 error from POST /api/conferences, toast shows 'Failed to save conference', user stays on /new page

Root cause: In ConferenceFormPage.tsx, the payload sends startDate and endDate directly from form.startDate (the value from input[type='date'] which is 'YYYY-MM-DD') without converting to ISO format.

Fix: Append 'T00:00:00Z' or convert date string to ISO format before sending:
  startDate: data.startDate ? data.startDate + 'T00:00:00Z' : '',
  endDate: data.endDate ? data.endDate + 'T00:00:00Z' : ''
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Creating a new conference via the admin form succeeds (201 response)
- [x] #2 User is redirected to /admin/conferences after successful creation
- [x] #3 Edit conference form also handles date format correctly
- [x] #4 No regression on existing conferences
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Fixed HTTP 500 on Create Conference form by converting date-only strings to ISO datetime format.

**Root cause:** HTML `<input type="date">` returns `YYYY-MM-DD` strings; the .NET API's `CreateConferenceRequest` and `UpdateConferenceRequest` use `DateTime` and cannot parse bare date strings.

**Change:** In `ConferenceFormPage.tsx`, the `saveMutation` payload now appends `T00:00:00Z` to both `startDate` and `endDate` before sending to the API:
```
startDate: data.startDate ? data.startDate + "T00:00:00Z" : ""
endDate: data.endDate ? data.endDate + "T00:00:00Z" : ""
```
The existing `toDateInput()` helper already strips the time component when loading existing data for editing, so round-trip is correct for both create and edit flows.
<!-- SECTION:FINAL_SUMMARY:END -->
