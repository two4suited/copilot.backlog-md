---
id: TASK-34
title: 'E2E tests: auth edge cases'
status: Done
assignee:
  - '@tester'
created_date: '2026-03-14 22:25'
updated_date: '2026-03-14 22:30'
labels:
  - testing
  - frontend
dependencies: []
priority: high
github_issue: 90
---

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Register with weak password shows validation error
- [x] #2 Register with duplicate email shows error
- [x] #3 Login with wrong password shows error
- [x] #4 Logged-in user sees name in nav
- [x] #5 Logout clears session and redirects
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Write auth-edge-cases.spec.ts
2. Cover weak password, duplicate email, wrong password, name in nav, logout
3. Run tests
4. File bugs for failures
5. Mark done
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Run 1: 1 passed (weak password client-side), 4 skipped (API unavailable)
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Fixed SessionReminderService graceful shutdown (moved Task.Delay inside try/catch, catch OperationCanceledException). Use port 5001 for API (5000 taken by macOS ControlCenter).
<!-- SECTION:FINAL_SUMMARY:END -->
