---
id: TASK-23
title: Sync all backlog tasks to GitHub Issues including historical Done tasks
status: Done
assignee:
  - '@copilot'
created_date: '2026-03-14 22:11'
updated_date: '2026-03-14 22:12'
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
- [x] #1 workflow_dispatch trigger added — can manually run full sync from GitHub Actions UI
- [x] #2 Scheduled cron trigger runs daily full sync
- [x] #3 All tasks (including Done) appear as GitHub Issues after sync runs
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Removed the paths filter from the push trigger so every push runs a full sync of all tasks.

Added:
- workflow_dispatch: run full sync on demand from the GitHub Actions UI (with optional reason input)
- schedule: daily cron at 02:00 UTC for complete sync coverage

All tasks — including historical Done tasks — will now be synced to GitHub Issues on every push, daily, or on demand.
<!-- SECTION:FINAL_SUMMARY:END -->
