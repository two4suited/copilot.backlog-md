---
id: TASK-13
title: 'Implement: GitHub Action to sync backlog.md tasks to GitHub Issues'
status: To Do
assignee: []
created_date: '2026-03-14 21:46'
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
