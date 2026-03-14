---
id: TASK-27
title: '[BUG] sync creates duplicate GitHub Issues — no workflow concurrency guard'
status: To Do
assignee: []
created_date: '2026-03-14 22:15'
labels:
  - bug
  - ci
  - infrastructure
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Two concurrent sync runs both searched for existing issues before either created one, causing ~20 duplicates. Fix: (1) add concurrency group to workflow, (2) add title-based dedup search in script as second lookup, (3) close all existing duplicate issues keeping lowest number.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Workflow has concurrency group preventing parallel runs
- [ ] #2 Script searches by title before creating if label search finds nothing
- [ ] #3 All duplicate GitHub Issues are closed (keep lowest number per task)
- [ ] #4 Task frontmatter github_issue fields point to the canonical (lowest) issue number
<!-- AC:END -->
