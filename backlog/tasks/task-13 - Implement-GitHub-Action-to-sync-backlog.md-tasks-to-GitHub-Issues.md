---
id: TASK-13
title: 'Implement: GitHub Action to sync backlog.md tasks to GitHub Issues'
status: In Progress
assignee:
  - '@copilot'
created_date: '2026-03-14 21:46'
updated_date: '2026-03-14 21:57'
labels:
  - infrastructure
  - github
  - automation
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement a GitHub Actions workflow and supporting script that syncs backlog.md tasks to GitHub Issues on every push to any branch. On each push: (1) read changed backlog/tasks/*.md files, (2) create or update the corresponding GitHub Issue using gh CLI or octokit, (3) apply a label with the triggering branch name, (4) set issue state (open/closed) based on task status, (5) store issue number back in task frontmatter. Workflow triggers on push to all branches.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Workflow file .github/workflows/sync-backlog-issues.yml created, triggers on push (all branches)
- [x] #2 Script reads changed backlog task files and creates/updates GitHub Issues
- [x] #3 Issues labelled with branch name (e.g. branch:main, branch:feature/auth)
- [x] #4 Issue open/closed state mirrors task status (Done/archived → closed)
- [x] #5 Task frontmatter updated with github_issue: <number> after creation
- [x] #6 Workflow uses GITHUB_TOKEN — no extra secrets needed
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add implementation plan to TASK-13
2. Create scripts/sync-backlog-issues.sh:
   - Parse YAML frontmatter (id, title, status, priority, labels) using awk/sed
   - Extract ## Description section body
   - Read existing github_issue field from frontmatter
   - Look up GitHub Issue by label task:TASK-N if no stored number
   - Create issue (gh issue create) or update (gh issue edit)
   - Open/close based on status
   - Add branch:BRANCHNAME label
   - Write back github_issue: <number> to task frontmatter (AC#5)
3. Create .github/workflows/sync-issues.yml triggering on push all branches
4. chmod +x scripts/sync-backlog-issues.sh
5. Test with gh auth status
6. Mark all ACs done, add final summary, set Done
7. git commit and push
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## GitHub Issues Sync – TASK-13

### What changed
- Added `scripts/sync-backlog-issues.sh`: a bash script that reads all `backlog/tasks/task-*.md` files and creates or updates the corresponding GitHub Issue via `gh` CLI.
- Added `.github/workflows/sync-issues.yml`: a GitHub Actions workflow that triggers on every push to any branch/tag when task files change.

### How it works
1. **Trigger**: `on: push` with `paths: backlog/tasks/**` covering all branches and tags.
2. **Script**: for each task file, parses YAML frontmatter (id, title, status, priority, labels) and the `## Description` section using `awk`/`sed` — no extra dependencies.
3. **Idempotent**: looks up existing issue by stored `github_issue:` field in frontmatter, or falls back to label search (`task:TASK-N`).
4. **Labels created**: `task:TASK-N`, `status:*`, `priority:*`, `branch:BRANCHNAME` (sanitised `/` → `-`).
5. **Open/close**: Done/Archived tasks → closed; all others → open.
6. **Write-back**: after creating a new issue, the script updates the task file with `github_issue: <number>` in frontmatter; the workflow then commits and pushes those changes with `[skip ci]`.

### Files created
- `scripts/sync-backlog-issues.sh` (executable)
- `.github/workflows/sync-issues.yml`

### Tests
- Bash syntax validated with `bash -n`
- Frontmatter parsing and Description extraction verified locally against real task files
- `gh auth status` confirmed CLI is authenticated
<!-- SECTION:FINAL_SUMMARY:END -->
