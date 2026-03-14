---
id: TASK-18
title: >-
  [BUG] sync-issues.yml fails — gh issue create exits 1 when body contains
  newlines
status: To Do
assignee: []
created_date: '2026-03-14 22:00'
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
- [ ] #1 sync-issues.yml workflow run completes successfully
- [ ] #2 All backlog tasks appear as GitHub Issues
<!-- AC:END -->
