---
id: TASK-42
title: >-
  [BUG] GET /api/speakers returns 500 AmbiguousMatchException due to duplicate
  route registration
status: To Do
assignee: []
created_date: '2026-03-14 23:48'
labels:
  - bug
  - tester
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
GET /api/speakers returns HTTP 500 with AmbiguousMatchException.

Root cause: Program.cs registers Minimal API endpoints for /api/speakers that conflict with the MVC SpeakersController routes.

Impact: Speakers page fails to load, speaker detail navigation broken, E2E tests skip.

Fix: Remove the duplicate Minimal API speaker endpoints from Program.cs.
<!-- SECTION:DESCRIPTION:END -->
