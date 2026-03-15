---
id: TASK-32
title: >-
  [BUG] ConfirmDialog missing role=dialog — not accessible to screen readers or
  Playwright getByRole
status: Done
assignee: []
created_date: '2026-03-14 22:25'
updated_date: '2026-03-15 00:13'
labels:
  - bug
  - frontend
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
ConfirmDialog component in frontend/src/components/ConfirmDialog.tsx has no role="dialog" or aria-modal attribute. This means screen readers cannot identify it as a dialog, and Playwright tests cannot find it via getByRole('dialog'). Fix: add role="dialog" aria-modal="true" aria-labelledby pointing to the heading.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 ConfirmDialog has role="dialog" and aria-modal="true"
- [x] #2 ConfirmDialog has aria-labelledby referencing its heading id
- [x] #3 Playwright getByRole('dialog') successfully finds the component
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added role="dialog" aria-modal="true" aria-labelledby to dialog container. Added id to h2 heading. Playwright getByRole('dialog') now works; screen readers correctly identify as dialog.
<!-- SECTION:FINAL_SUMMARY:END -->
