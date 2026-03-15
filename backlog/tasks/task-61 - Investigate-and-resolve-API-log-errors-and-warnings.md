---
id: TASK-61
title: Investigate and resolve API log errors and warnings
status: In Progress
assignee:
  - '@agent-api-errors'
created_date: '2026-03-15 01:25'
updated_date: '2026-03-15 01:26'
labels:
  - bug
  - backend
  - security
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The API logs show several issues that need investigation and resolution:

## 1. MimeKit vulnerability (NU1902 — moderate severity)
Package 'MimeKit' 4.8.0 has a known moderate vulnerability: https://github.com/advisories/GHSA-g7hc-96xr-gvvx
Action: update MimeKit to a patched version or evaluate if it can be removed if unused.

## 2. EF Core model validation warning
`warn: Microsoft.EntityFrameworkCore.Model.Validation[10622]` fires on startup — needs investigation. Common causes: missing index, unmapped property, shadow property issues. Check what the full warning message says and fix the model configuration.

## 3. BackgroundService TaskCanceledException
`BackgroundService failed — System.Threading.Tasks.TaskCanceledException` on shutdown. Likely the SignalR hub or seat-availability background service not handling CancellationToken gracefully. Should catch OperationCanceledException/TaskCanceledException on shutdown and exit cleanly instead of crashing.

## Investigation steps:
- Run `dotnet run` in ConferenceApp.Api directly (not via Aspire) with verbose logging to capture full error messages
- Check `ConferenceApp.Api/ConferenceApp.Api.csproj` for MimeKit reference and update it
- Find the BackgroundService implementation and add proper cancellation handling
- Find and fix the EF Core model validation warning
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 MimeKit updated to a version with no known vulnerabilities (or removed if unused)
- [ ] #2 EF Core model validation warning identified and resolved
- [ ] #3 BackgroundService handles CancellationToken gracefully — no exception on clean shutdown
- [ ] #4 API starts with zero warnings and zero errors in normal operation
<!-- AC:END -->
