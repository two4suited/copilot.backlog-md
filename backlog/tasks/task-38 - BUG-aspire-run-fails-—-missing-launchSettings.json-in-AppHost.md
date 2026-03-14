---
id: TASK-38
title: '[BUG] aspire run fails — missing launchSettings.json in AppHost'
status: Done
assignee: []
created_date: '2026-03-14 22:31'
updated_date: '2026-03-14 22:49'
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

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Fixed: created launchSettings.json for AppHost (http+https profiles). Fixed WaitFor stuck bug: changed to fixed pg-password parameter and WaitFor(postgres) instead of WaitFor(db). Deleted stale conference-pgdata volume. Updated vite proxy to read Aspire service discovery env vars (services__api__https__0).
<!-- SECTION:FINAL_SUMMARY:END -->
