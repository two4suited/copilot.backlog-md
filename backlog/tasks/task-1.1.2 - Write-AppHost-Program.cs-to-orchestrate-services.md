---
id: TASK-1.1.2
title: Write AppHost Program.cs to orchestrate services
status: To Do
assignee: []
created_date: '2026-03-14 21:13'
updated_date: '2026-03-14 21:19'
labels:
  - task
  - infrastructure
  - aspire
dependencies: []
parent_task_id: TASK-1.1
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement the Aspire AppHost entry point that adds PostgreSQL, wires the API with the connection string, and adds the Vite frontend.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 PostgreSQL resource added with .WithDataVolume() for persistence
- [ ] #2 API project added as ProjectResource and receives postgres connection string
- [ ] #3 Vite frontend added via AddNpmApp pointing to ./frontend
- [ ] #4 Running dotnet run in AppHost starts all three services
<!-- AC:END -->
