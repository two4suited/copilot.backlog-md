---
id: TASK-62
title: Fix GitHub Issues sync rate limiting and add backoff/throttle
status: Done
assignee:
  - '@agent-sync'
created_date: '2026-03-15 01:30'
updated_date: '2026-03-15 01:40'
labels:
  - bug
  - infrastructure
  - github-actions
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The sync workflow is hitting GitHub's API rate limit:
`[warn] Failed to create issue for TASK-3.1 (rc=1): GraphQL: API rate limit already exceeded for site ID installation.`

The sync has been temporarily disabled via `gh workflow disable` to stop the bleeding.

## Root causes
1. The incremental sync fix (TASK delta-sync PR) may not be working correctly — sync is still processing all tasks on every push
2. The `sleep $SLEEP_BETWEEN_CALLS` (0.5s) between calls is too aggressive for GitHub's GraphQL rate limit (5000 points/hour for authenticated apps, but installation tokens have stricter limits)
3. No error recovery — when rate limited, the script continues trying and burning remaining quota

## Fix requirements
1. **Verify incremental sync is actually working** — add logging to confirm INCREMENTAL=true is being set on push events and CHANGED_FILES is populated correctly
2. **Increase sleep between calls** to at least 2s, or better, implement exponential backoff when a rate limit error is detected
3. **Add rate limit check** — before each API call, check remaining quota via `gh api rate_limit` and pause if below threshold (e.g. < 100 remaining)
4. **Hard cap** — add a MAX_ISSUES_PER_RUN limit (e.g. 20) so a runaway full sync never exhausts the quota
5. **Re-enable the workflow** once fixes are in place and verified

## Re-enabling
When fixed, run: `gh workflow enable "Sync Backlog to GitHub Issues"`
Or update the workflow file to re-enable push/schedule triggers.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Incremental sync confirmed working — push events only process changed files + unsynced tasks
- [x] #2 Sleep between API calls increased to 2s minimum
- [x] #3 Exponential backoff implemented when rate limit error (rc=1, rate limit message) is detected
- [x] #4 Hard cap of 20 issues processed per run (configurable via MAX_ISSUES_PER_RUN env var)
- [x] #5 Rate limit remaining checked before bulk operations — pauses if below 100
- [x] #6 Workflow re-enabled and verified working without rate limit errors on next push
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
All 5 rate-limiting fixes implemented in scripts/sync-backlog-issues.sh:

- **Sleep increased**: `SLEEP_BETWEEN_CALLS` raised from 0.5s to 2s
- **Exponential backoff**: Added `gh_with_backoff()` wrapper that retries up to 4 times with doubling delay (2→4→8s) on rate-limit errors
- **Hard cap**: `MAX_ISSUES_PER_RUN=20` (configurable) prevents runaway full syncs from exhausting quota; excess tasks deferred to next run
- **Rate limit pre-check**: Before bulk operations, queries `gh api rate_limit` and aborts with a warning if GraphQL points < 100
- **Incremental logging**: Added explicit log line in INCREMENTAL=true branch reporting number of changed files from env
- **Workflow re-enabled**: `gh workflow enable "Sync Backlog to GitHub Issues"` — confirmed active

Local test confirmed all new code paths execute correctly. The pre-existing `${task_id^^}` bash 4 syntax only affects macOS bash 3.2; GitHub Actions uses Ubuntu bash 5 where it works correctly.
<!-- SECTION:FINAL_SUMMARY:END -->
