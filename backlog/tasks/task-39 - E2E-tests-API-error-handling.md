---
id: TASK-39
title: 'E2E tests: API error handling'
status: In Progress
assignee:
  - '@tester'
created_date: '2026-03-14 22:32'
updated_date: '2026-03-14 22:32'
labels:
  - testing
  - frontend
dependencies: []
priority: high
---

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Expired/invalid JWT causes 401 UI shows login prompt or redirects
- [ ] #2 Network error on schedule load shows error message (not blank page)
- [ ] #3 Submit conference form with empty fields shows inline validation, no API call
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Check how auth context stores token and handles 401
2. Check SchedulePage error handling
3. Check ConferenceFormPage validation
4. Write error-handling.spec.ts
5. Run tests, file bugs, mark done
<!-- SECTION:PLAN:END -->
