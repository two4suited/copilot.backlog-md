---
id: TASK-35
title: 'E2E tests: navigation and routing'
status: In Progress
assignee:
  - '@aspire-expert'
created_date: '2026-03-14 22:26'
updated_date: '2026-03-14 23:48'
labels:
  - testing
  - frontend
dependencies: []
priority: high
github_issue: 91
---

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Home/landing page loads with nav links
- [x] #2 All nav links navigate to correct pages
- [x] #3 404 route shows not-found message or redirects home
- [x] #4 Back button works after navigating to detail pages
- [x] #5 Deep link to /sessions/:id works without prior navigation
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Check App.tsx for routes and 404 handling
2. Write navigation.spec.ts
3. Run tests
4. File bugs for failures
5. Mark done
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Run 1: 8 passed, 3 skipped (API unavailable). All nav, 404, back-button tests pass without backend.

Re-run with live API (via local config pointing to port 5174): 8 passed, 3 skipped.
Fixed hardcoded localhost:5173 URL patterns → now accept 5173 or 5174.
Fixed API URL to use Vite proxy (http://localhost:5174/api/...) instead of dead localhost:5000.
3 remaining skips caused by TASK-41 (GET /api/sessions → 500 AmbiguousMatchException).
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Wrote frontend/e2e/navigation.spec.ts with 11 tests. Covers home page, all nav links, 404 page, Go Home link, back button, and deep links. 8 passed, 3 skipped (API-dependent), 0 failed.
<!-- SECTION:FINAL_SUMMARY:END -->
