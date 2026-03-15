---
id: TASK-42
title: >-
  [BUG] GET /api/speakers returns 500 AmbiguousMatchException due to duplicate
  route registration
status: Done
assignee: []
created_date: '2026-03-14 23:48'
updated_date: '2026-03-15 00:13'
labels:
  - bug
  - tester
dependencies: []
priority: high
github_issue: 98
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
GET /api/speakers returns HTTP 500 with AmbiguousMatchException.

Root cause: Program.cs registers Minimal API endpoints for /api/speakers that conflict with the MVC SpeakersController routes.

Impact: Speakers page fails to load, speaker detail navigation broken, E2E tests skip.

Fix: Remove the duplicate Minimal API speaker endpoints from Program.cs.
<!-- SECTION:DESCRIPTION:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Removed duplicate Minimal API endpoints for /api/speakers and variants from Program.cs. SpeakersController already handles these routes. AmbiguousMatchException resolved.
<!-- SECTION:FINAL_SUMMARY:END -->
