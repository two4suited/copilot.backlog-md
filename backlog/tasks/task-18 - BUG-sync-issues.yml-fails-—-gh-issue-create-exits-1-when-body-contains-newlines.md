---
id: TASK-18
title: >-
  [BUG] sync-issues.yml fails — gh issue create exits 1 when body contains
  newlines
status: Done
assignee:
  - '@copilot'
created_date: '2026-03-14 22:00'
updated_date: '2026-03-14 22:01'
labels:
  - bug
  - ci
  - infrastructure
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
sync-issues workflow run #23097205757 fails at "Creating issue for TASK-1" with exit code 1. Root cause: issue body with embedded newlines/quotes passed via --body "..." is parsed incorrectly by gh in CI. Fix: write body to a temp file and use --body-file.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 sync-issues.yml workflow run completes successfully
- [x] #2 All backlog tasks appear as GitHub Issues
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Fixed sync-backlog-issues.sh: replaced --body with --body-file (temp file) to handle newlines/quotes. Added rc capture and error output on create/edit failures so the script no longer fails silently.
<!-- SECTION:FINAL_SUMMARY:END -->
