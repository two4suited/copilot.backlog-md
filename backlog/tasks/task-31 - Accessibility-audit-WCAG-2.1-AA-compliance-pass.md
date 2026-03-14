---
id: TASK-31
title: 'Accessibility audit: WCAG 2.1 AA compliance pass'
status: To Do
assignee: []
created_date: '2026-03-14 22:23'
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
