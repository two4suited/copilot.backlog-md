---
id: TASK-75
title: >-
  Fix GitHub Issues sync — bidirectional status reconciliation instead of
  20-issue cap
status: To Do
assignee: []
created_date: '2026-03-15 02:58'
labels:
  - bug
  - ci
  - github-actions
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The current sync script (scripts/sync-backlog-issues.sh) has a MAX_ISSUES_PER_RUN=20 cap that means only 20 tasks get synced per run. Over time, GitHub Issues fall out of sync with backlog.md status (e.g. Done tasks stay open on GitHub, or open tasks get closed incorrectly).

## Better approach: reconcile by querying GitHub first

Instead of capping at 20 and blindly iterating all task files, the sync should:

1. **Fetch all open GitHub Issues** from the repo (paginated REST: GET /repos/.../issues?state=open&per_page=100)
2. For each open issue, extract the task ID from the title (e.g. '[TASK-63]') or the task: label
3. Look up the corresponding backlog task file to check its current status
4. If the task is Done/Archived in backlog.md → close the GitHub issue
5. If the task no longer exists in backlog.md → close the GitHub issue with a comment

Then for the create/update pass:
6. Iterate all task files that are NOT Done/Archived (active tasks only)
7. For each, create or update its GitHub issue with current metadata
8. Remove the 20-issue cap entirely — active tasks are typically far fewer than total tasks

This keeps GitHub Issues as a live view of the backlog without stale open issues piling up.

## Key changes to scripts/sync-backlog-issues.sh
- Add a reconcile_open_issues() function that paginates GET /issues?state=open
- Extract task ID from issue title regex `\[TASK-[0-9.]+\]`
- Cross-reference against backlog task files — check status field
- Close issues for Done/Archived/missing tasks
- Remove MAX_ISSUES_PER_RUN cap
- Only create/update issues for non-Done tasks (skip Done tasks in the main loop)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Open GitHub issues for Done/Archived backlog tasks are automatically closed
- [ ] #2 Open GitHub issues for tasks that no longer exist in backlog are closed
- [ ] #3 MAX_ISSUES_PER_RUN cap removed
- [ ] #4 Active (non-Done) tasks always get a GitHub issue created/updated
- [ ] #5 Sync completes cleanly with 0 stale open issues after a full run
<!-- AC:END -->
