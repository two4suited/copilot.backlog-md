---
id: TASK-12
title: 'Design: backlog.md ↔ GitHub Issues sync schema'
status: To Do
assignee: []
created_date: '2026-03-14 21:46'
labels:
  - design
  - infrastructure
  - github
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Based on research findings (TASK-11), design the sync schema: which backlog fields map to which GitHub Issue fields, how task ID→issue number mapping is stored, how branch names become labels, what happens on update vs create, and how deletions/archiving are handled. Document the design in task notes.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Field mapping table defined: title, description, status, labels, assignee, priority → GitHub Issue fields
- [ ] #2 ID mapping storage approach chosen (frontmatter field or .github/backlog-issue-map.json)
- [ ] #3 Branch label format defined (e.g. branch:feature/my-feature)
- [ ] #4 Sync rules documented: create if no issue, update if changed, close if Done/archived
<!-- AC:END -->
