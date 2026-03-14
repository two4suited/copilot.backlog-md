---
id: TASK-32
title: >-
  [BUG] ConfirmDialog missing role=dialog — not accessible to screen readers or
  Playwright getByRole
status: To Do
assignee: []
created_date: '2026-03-14 22:25'
labels:
  - bug
  - frontend
dependencies: []
priority: medium
github_issue: 88
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
ConfirmDialog component in frontend/src/components/ConfirmDialog.tsx has no role="dialog" or aria-modal attribute. This means screen readers cannot identify it as a dialog, and Playwright tests cannot find it via getByRole('dialog'). Fix: add role="dialog" aria-modal="true" aria-labelledby pointing to the heading.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 ConfirmDialog has role="dialog" and aria-modal="true"
- [ ] #2 ConfirmDialog has aria-labelledby referencing its heading id
- [ ] #3 Playwright getByRole('dialog') successfully finds the component
<!-- AC:END -->
