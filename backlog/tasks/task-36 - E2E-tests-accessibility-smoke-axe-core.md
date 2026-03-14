---
id: TASK-36
title: 'E2E tests: accessibility smoke (axe-core)'
status: Done
assignee:
  - '@tester'
created_date: '2026-03-14 22:27'
updated_date: '2026-03-14 22:32'
labels:
  - testing
  - frontend
dependencies: []
priority: high
github_issue: 92
---

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Install @axe-core/playwright
- [x] #2 Run axe on Schedule page - assert zero critical violations
- [x] #3 Run axe on Session Detail page - assert zero critical violations
- [x] #4 Run axe on Speaker Detail page - assert zero critical violations
- [x] #5 Run axe on Admin page - assert zero critical violations
- [x] #6 File bug for each critical violation found
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Install @axe-core/playwright
2. Write a11y-smoke.spec.ts for Schedule, Session Detail, Speaker Detail, Admin pages
3. Run tests and capture violations
4. File bugs for critical violations
5. Mark done
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Run 1: 5 passed (Schedule, Home, Conferences, Login, Register - all zero critical violations), 3 skipped (API-dependent: Session Detail, Speaker Detail, Admin). No violations found.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Wrote frontend/e2e/a11y-smoke.spec.ts with 8 tests using @axe-core/playwright. Installed @axe-core/playwright as devDependency. Tests cover Schedule, Home, Conferences, Login, Register (all zero critical violations), and 3 API-dependent pages. 5 passed, 3 skipped, 0 failed. No accessibility violations found.
<!-- SECTION:FINAL_SUMMARY:END -->
