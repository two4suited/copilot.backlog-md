---
id: TASK-7
title: Update to latest .NET and Node.js versions
status: To Do
assignee: []
created_date: '2026-03-14 21:39'
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
- [ ] #1 global.json added pinning net10.0 SDK
- [ ] #2 Aspire packages updated to latest version (13.x)
- [ ] #3 .nvmrc added with node 24
- [ ] #4 dotnet build passes after all updates
<!-- AC:END -->
