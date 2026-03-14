---
id: TASK-38
title: '[BUG] aspire run fails — missing launchSettings.json in AppHost'
status: To Do
assignee: []
created_date: '2026-03-14 22:31'
labels:
  - bug
  - infrastructure
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
ConferenceApp.AppHost/Properties/launchSettings.json was missing. aspire run requires it to configure ASPNETCORE_URLS, DOTNET_DASHBOARD_OTLP_ENDPOINT_URL etc. Without it, AppHost crashes on startup. Fixed by creating launchSettings.json with http and https profiles.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 aspire run starts successfully with all services
<!-- AC:END -->
