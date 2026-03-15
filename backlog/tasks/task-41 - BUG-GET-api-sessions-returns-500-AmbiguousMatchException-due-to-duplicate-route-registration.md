---
id: TASK-41
title: >-
  [BUG] GET /api/sessions returns 500 AmbiguousMatchException due to duplicate
  route registration
status: Done
assignee: []
created_date: '2026-03-14 23:47'
updated_date: '2026-03-15 00:13'
labels:
  - bug
  - tester
dependencies: []
priority: high
github_issue: 97
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
GET /api/sessions returns HTTP 500 with AmbiguousMatchException.

Root cause: Program.cs registers Minimal API endpoints for /api/sessions and /api/sessions/{id:guid} that conflict with the MVC SessionsController routes.

Impact: Schedule page shows no sessions, deep-link navigation to session detail is impossible, E2E tests skip or fail.

Fix: Remove the duplicate Minimal API session endpoints from Program.cs.
<!-- SECTION:DESCRIPTION:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Removed duplicate Minimal API endpoints for /api/sessions and variants from Program.cs. SessionsController already handles these routes. AmbiguousMatchException resolved.
<!-- SECTION:FINAL_SUMMARY:END -->
