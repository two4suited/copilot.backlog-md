---
id: TASK-71
title: >-
  Bug: GitHub Issues sync uses GraphQL — aborts when GraphQL rate limit
  exhausted
status: Done
assignee: []
created_date: '2026-03-15 01:52'
labels:
  - bug
  - ci
  - github-actions
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The sync script (scripts/sync-backlog-issues.sh) was using GraphQL in multiple places:

1. Pre-flight check: `gh api rate_limit --jq '.resources.graphql.remaining'` — aborts if GraphQL quota < 100, but the actual issue create/edit operations use REST, not GraphQL. A depleted GraphQL quota was blocking all syncs unnecessarily.

2. `gh label list --json name` — uses GraphQL
3. `gh issue list --json ... --jq` — uses GraphQL  
4. `gh issue view --json state` — uses GraphQL

When the GraphQL rate limit hits 0 (5000/hr limit, resets hourly), the entire sync was dead even though the REST core limit (5000/hr) had plenty of capacity.

Fixed in this commit:
- Pre-flight checks `core.remaining` instead of `graphql.remaining`
- `ensure_label` uses `gh api GET /repos/.../labels/{name}` + `gh api POST`
- Issue lookup uses `gh api GET /repos/.../issues?labels=...`
- Title search uses `gh api GET /search/issues?q=...`  
- State check uses `gh api GET /repos/.../issues/{number}`
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Sync completes successfully when GraphQL limit is 0 but REST core limit is healthy
- [ ] #2 No gh issue list --json or gh issue view --json calls remain in sync script
- [ ] #3 Pre-flight check uses core.remaining
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Fixed sync script to use REST API exclusively. Replaced all gh issue list --json, gh issue view --json, and gh label list --json calls with gh api REST equivalents. Pre-flight rate limit check now uses core.remaining instead of graphql.remaining. Also manually synced: closed 5 stale open issues for Done tasks, created 5 new issues for TASK-66..70, wrote github_issue fields back to all task files that were missing them.
<!-- SECTION:FINAL_SUMMARY:END -->
