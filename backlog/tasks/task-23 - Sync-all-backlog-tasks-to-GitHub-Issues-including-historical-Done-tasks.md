---
id: TASK-23
title: Sync all backlog tasks to GitHub Issues including historical Done tasks
status: In Progress
assignee:
  - '@copilot'
created_date: '2026-03-14 22:11'
updated_date: '2026-03-14 22:11'
labels:
  - ci
  - infrastructure
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The sync workflow only fires on push when backlog/tasks/** changes, so historical Done tasks never get synced. Need:
1. workflow_dispatch trigger for on-demand full sync
2. Scheduled daily run (cron) to keep all tasks in sync
3. Remove paths filter from push OR keep it and rely on schedule+dispatch for full coverage
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 workflow_dispatch trigger added — can manually run full sync from GitHub Actions UI
- [ ] #2 Scheduled cron trigger runs daily full sync
- [ ] #3 All tasks (including Done) appear as GitHub Issues after sync runs
<!-- AC:END -->
