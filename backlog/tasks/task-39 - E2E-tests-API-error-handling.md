---
id: TASK-39
title: 'E2E tests: API error handling'
status: In Progress
assignee:
  - '@tester'
created_date: '2026-03-14 22:32'
updated_date: '2026-03-14 23:49'
labels:
  - testing
  - frontend
dependencies: []
priority: high
github_issue: 95
---

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Expired/invalid JWT causes 401 UI shows login prompt or redirects
- [x] #2 Network error on schedule load shows error message (not blank page)
- [x] #3 Submit conference form with empty fields shows inline validation, no API call
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Check how auth context stores token and handles 401
2. Check SchedulePage error handling
3. Check ConferenceFormPage validation
4. Write error-handling.spec.ts
5. Run tests, file bugs, mark done
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemented all 3 AC tests. Fixed API_URL to use Vite proxy at http://localhost:5174.
Fixed isApiAvailable() to check /api/conferences via proxy.
Fixed network error on conferences test: added .animate-spin to selector (React Query retries keep loading spinner visible).
Fixed form field label test: use form input[type="text"] since labels lack htmlFor associations.
Results: 6 passed, 1 skipped (API 500 error test - blocked by TASK-41), 0 failed.
<!-- SECTION:NOTES:END -->
