---
id: TASK-62
title: Fix GitHub Issues sync rate limiting and add backoff/throttle
status: In Progress
assignee:
  - '@agent-sync'
created_date: '2026-03-15 01:30'
updated_date: '2026-03-15 01:37'
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
- [ ] #1 Incremental sync confirmed working — push events only process changed files + unsynced tasks
- [ ] #2 Sleep between API calls increased to 2s minimum
- [ ] #3 Exponential backoff implemented when rate limit error (rc=1, rate limit message) is detected
- [ ] #4 Hard cap of 20 issues processed per run (configurable via MAX_ISSUES_PER_RUN env var)
- [ ] #5 Rate limit remaining checked before bulk operations — pauses if below 100
- [ ] #6 Workflow re-enabled and verified working without rate limit errors on next push
<!-- AC:END -->
