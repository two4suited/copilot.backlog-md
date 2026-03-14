---
id: TASK-27
title: '[BUG] sync creates duplicate GitHub Issues — no workflow concurrency guard'
status: Done
assignee:
  - '@copilot'
created_date: '2026-03-14 22:15'
updated_date: '2026-03-14 22:16'
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
- [x] #1 Workflow has concurrency group preventing parallel runs
- [x] #2 Script searches by title before creating if label search finds nothing
- [x] #3 All duplicate GitHub Issues are closed (keep lowest number per task)
- [x] #4 Task frontmatter github_issue fields point to the canonical (lowest) issue number
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Fixed duplicate GitHub Issues caused by concurrent sync runs.

1. Added concurrency group to workflow (sync-backlog-issues) with cancel-in-progress:false — runs queue rather than race
2. Script now uses 3-tier dedup: frontmatter → label search (sort_by lowest) → exact title search
3. Closed 31 duplicate issues (kept lowest number per task) via one-shot cleanup script
4. Task frontmatter will be corrected on next sync run
<!-- SECTION:FINAL_SUMMARY:END -->
