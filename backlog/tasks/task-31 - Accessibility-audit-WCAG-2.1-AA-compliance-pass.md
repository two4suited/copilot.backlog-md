---
id: TASK-31
title: 'Accessibility audit: WCAG 2.1 AA compliance pass'
status: In Progress
assignee:
  - '@accessibility-expert'
created_date: '2026-03-14 22:23'
updated_date: '2026-03-15 00:22'
labels:
  - frontend
  - testing
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Run axe-core accessibility audit across all main pages. Fix any critical/serious violations. Focus on: color contrast, ARIA labels on buttons/icons, keyboard navigation, focus indicators, screen reader landmarks.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 axe-core reports zero critical violations on Schedule, Session Detail, Speaker pages
- [ ] #2 All icon-only buttons have aria-label
- [ ] #3 Search bar and bookmark button are keyboard accessible
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Fix Toast close button (icon-only, missing aria-label)
2. Fix SearchBar: add aria-label to input, add ARIA combobox pattern, add keyboard nav for dropdown
3. Fix SchedulePage conference select (missing aria-label)
4. Re-run a11y smoke tests
5. Mark ACs and finalize task
<!-- SECTION:PLAN:END -->
