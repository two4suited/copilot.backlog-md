---
id: TASK-11
title: 'Research: backlog.md to GitHub Issues sync options'
status: To Do
assignee: []
created_date: '2026-03-14 21:46'
labels:
  - research
  - infrastructure
  - github
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Research how to sync backlog.md task files with GitHub Issues. Investigate: (1) GitHub CLI gh issue create/edit commands and how to map backlog task fields to issue fields, (2) existing GitHub Actions for markdown-to-issues sync (e.g. github-issue-sync, project-sync actions), (3) how to detect which backlog tasks are new/changed on a push, (4) how to tag/label a GitHub Issue with the branch name that triggered the push, (5) how to store the mapping between backlog task IDs and GitHub issue numbers (e.g. in task frontmatter or a JSON map file), (6) bidirectional vs unidirectional sync considerations. Produce a short findings doc and recommended approach before implementation tasks are created.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Findings written to backlog task notes covering all 6 research areas
- [ ] #2 Recommended sync approach chosen (unidirectional backlog→GitHub or bidirectional)
- [ ] #3 Recommended tool/library identified (gh CLI, octokit, existing action, or custom script)
- [ ] #4 Branch-tagging mechanism documented
<!-- AC:END -->
