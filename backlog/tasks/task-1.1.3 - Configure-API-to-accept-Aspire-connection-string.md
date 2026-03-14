---
id: TASK-1.1.3
title: Configure API to accept Aspire connection string
status: Done
assignee: []
created_date: '2026-03-14 21:13'
updated_date: '2026-03-14 21:26'
labels:
  - task
  - infrastructure
  - aspire
  - backend
dependencies: []
parent_task_id: TASK-1.1
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Update ConferenceApp.Api Program.cs to read the PostgreSQL connection string from environment (injected by Aspire) and register DbContext.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 API reads connection string from ConnectionStrings:postgres env var
- [x] #2 DbContext registered with UseNpgsql
- [x] #3 Migrations applied automatically on startup (EnsureMigratedAsync)
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
API Program.cs reads connection string via builder.Configuration.GetConnectionString('conferencedb') (injected by Aspire at runtime). DbContext registered with builder.Services.AddDbContext<ConferenceDbContext> using .UseNpgsql(connectionString). Auto-migration runs asynchronously on startup via await dbContext.Database.MigrateAsync() in a scoped block before await app.RunAsync().
<!-- SECTION:FINAL_SUMMARY:END -->
