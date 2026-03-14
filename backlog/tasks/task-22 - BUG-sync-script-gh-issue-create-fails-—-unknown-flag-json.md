---
id: TASK-22
title: '[BUG] sync script: gh issue create fails — unknown flag --json'
status: In Progress
assignee:
  - '@copilot'
created_date: '2026-03-14 22:08'
updated_date: '2026-03-14 22:08'
labels:
  - bug
  - ci
  - infrastructure
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
gh issue create does not support --json/--jq flags (only list/view do). Fix: capture stdout URL from gh issue create and parse issue number from it with grep -oE [0-9]+$
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 gh issue create succeeds and returns issue number
- [ ] #2 GitHub Issues are created for all backlog tasks on next push
<!-- AC:END -->
