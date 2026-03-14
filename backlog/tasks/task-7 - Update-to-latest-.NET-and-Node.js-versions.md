---
id: TASK-7
title: Update to latest .NET and Node.js versions
status: Done
assignee:
  - '@copilot'
created_date: '2026-03-14 21:39'
updated_date: '2026-03-14 21:44'
labels:
  - infrastructure
  - aspire
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Update all projects to .NET 10 LTS (SDK 10.0.201) and Node.js 24.14.0. Add global.json pinning .NET 10. Add .nvmrc for Node 24. Update Aspire packages from 9.5.2 to latest (13.x). Verify dotnet build passes after upgrade.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 global.json added pinning net10.0 SDK
- [x] #2 Aspire packages updated to latest version (13.x)
- [x] #3 .nvmrc added with node 24
- [x] #4 dotnet build passes after all updates
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Updated to .NET 10 SDK (10.0.100, rollForward: latestFeature) via global.json.

Aspire packages updated: Aspire.AppHost.Sdk, Aspire.Hosting.AppHost, and Aspire.Hosting.PostgreSQL bumped from 9.5.2 → 13.1.2. Aspire.Hosting.NodeJs remains at 9.5.2 (still latest on NuGet).

.nvmrc added with `24` for Node.js 24. `engines.node` >= 24.0.0 added to frontend/package.json.

`dotnet build ConferenceApp.sln` passes with 0 warnings and 0 errors.
<!-- SECTION:FINAL_SUMMARY:END -->
