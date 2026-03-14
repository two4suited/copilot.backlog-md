---
id: TASK-13
title: 'Implement: GitHub Action to sync backlog.md tasks to GitHub Issues'
status: In Progress
assignee:
  - '@copilot'
created_date: '2026-03-14 21:46'
updated_date: '2026-03-14 21:55'
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
- [ ] #1 Workflow file .github/workflows/sync-backlog-issues.yml created, triggers on push (all branches)
- [ ] #2 Script reads changed backlog task files and creates/updates GitHub Issues
- [ ] #3 Issues labelled with branch name (e.g. branch:main, branch:feature/auth)
- [ ] #4 Issue open/closed state mirrors task status (Done/archived → closed)
- [ ] #5 Task frontmatter updated with github_issue: <number> after creation
- [ ] #6 Workflow uses GITHUB_TOKEN — no extra secrets needed
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
