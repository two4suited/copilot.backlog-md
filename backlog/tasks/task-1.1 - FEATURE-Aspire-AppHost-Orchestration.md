---
id: TASK-1.1
title: 'FEATURE: Aspire AppHost & Orchestration'
status: To Do
assignee: []
created_date: '2026-03-14 21:11'
updated_date: '2026-03-14 21:19'
labels:
  - feature
  - infrastructure
  - aspire
dependencies: []
parent_task_id: TASK-1
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create the .NET Aspire AppHost project that wires PostgreSQL, the API, and the React frontend together. Developers run one command to start everything.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 AppHost project added to solution with Aspire.Hosting package
- [ ] #2 PostgreSQL added as a named resource with WithDataVolume
- [ ] #3 API project referenced and receives the postgres connection string via Aspire
- [ ] #4 React Vite app added via AddNpmApp or AddViteApp
- [ ] #5 dotnet run from AppHost starts all services
<!-- AC:END -->
