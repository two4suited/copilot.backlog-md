---
id: TASK-22
title: '[BUG] sync script: gh issue create fails — unknown flag --json'
status: Done
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
- [x] #1 gh issue create succeeds and returns issue number
- [x] #2 GitHub Issues are created for all backlog tasks on next push
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Fixed gh issue create call: removed unsupported --json/--jq flags. Now captures stdout URL and extracts issue number with grep -oE '[0-9]+$'.
<!-- SECTION:FINAL_SUMMARY:END -->
