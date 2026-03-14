---
id: TASK-36
title: 'E2E tests: accessibility smoke (axe-core)'
status: In Progress
assignee:
  - '@tester'
created_date: '2026-03-14 22:27'
updated_date: '2026-03-14 22:27'
labels:
  - testing
  - frontend
dependencies: []
priority: high
---

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Install @axe-core/playwright
- [ ] #2 Run axe on Schedule page - assert zero critical violations
- [ ] #3 Run axe on Session Detail page - assert zero critical violations
- [ ] #4 Run axe on Speaker Detail page - assert zero critical violations
- [ ] #5 Run axe on Admin page - assert zero critical violations
- [ ] #6 File bug for each critical violation found
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Install @axe-core/playwright
2. Write a11y-smoke.spec.ts for Schedule, Session Detail, Speaker Detail, Admin pages
3. Run tests and capture violations
4. File bugs for critical violations
5. Mark done
<!-- SECTION:PLAN:END -->
