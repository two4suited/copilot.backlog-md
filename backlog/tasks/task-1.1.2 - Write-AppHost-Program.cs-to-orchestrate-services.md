---
id: TASK-1.1.2
title: Write AppHost Program.cs to orchestrate services
status: Done
assignee: []
created_date: '2026-03-14 21:13'
updated_date: '2026-03-14 21:26'
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
- [x] #1 PostgreSQL resource added with .WithDataVolume() for persistence
- [x] #2 API project added as ProjectResource and receives postgres connection string
- [x] #3 Vite frontend added via AddNpmApp pointing to ./frontend
- [x] #4 Running dotnet run in AppHost starts all three services
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
AppHost Program.cs orchestrates: PostgreSQL with .WithDataVolume('conference-pgdata') for persistence; API via typed AddProject<Projects.ConferenceApp_Api>('api') with .WithReference(db) and .WaitFor(db); Vite frontend via AddNpmApp with .WithReference(api), .WithHttpEndpoint(env:'PORT'), .WithEnvironment('BROWSER','none'), and .WaitFor(api). Uses builder.Build().Run() pattern.
<!-- SECTION:FINAL_SUMMARY:END -->
