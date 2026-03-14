---
id: TASK-1.1.3
title: Configure API to accept Aspire connection string
status: To Do
assignee: []
created_date: '2026-03-14 21:13'
updated_date: '2026-03-14 21:19'
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
- [ ] #1 API reads connection string from ConnectionStrings:postgres env var
- [ ] #2 DbContext registered with UseNpgsql
- [ ] #3 Migrations applied automatically on startup (EnsureMigratedAsync)
<!-- AC:END -->
