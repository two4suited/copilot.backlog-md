---
id: TASK-69
title: Run full Playwright E2E suite and file bugs for every failure
status: To Do
assignee:
  - '@agent-tester'
created_date: '2026-03-15 01:47'
updated_date: '2026-03-15 01:53'
labels:
  - testing
  - e2e
  - qa
dependencies:
  - TASK-66
  - TASK-67
  - TASK-68
  - TASK-70
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Before taking README screenshots (TASK-55), run the complete Playwright E2E test suite against the live Aspire stack. File a separate backlog bug task for every failure or broken page found.

## Steps

1. Find the current Vite frontend port:
   lsof -i TCP -P -n | grep LISTEN | grep node | head -3

2. Run the full suite:
   cd frontend
   APP_URL=http://localhost:<port> npx playwright test --config playwright.local.config.ts 2>&1 | tee /tmp/playwright-results.txt

3. Also run the comprehensive audit spec specifically:
   APP_URL=http://localhost:<port> npx playwright test e2e/comprehensive-audit.spec.ts --config playwright.local.config.ts --reporter=list 2>&1 | tee /tmp/playwright-audit.txt

4. For every failing test, investigate the root cause by:
   - Running with --headed or inspecting the error message
   - Checking if it is a real bug in the app or a test issue

5. File a backlog bug task for each real app bug found:
   backlog task create "Bug: <page> — <what is broken>" -d "<details>" --ac "<criteria>" -l bug,frontend --priority high

6. Fix test-only issues (wrong selectors, hardcoded ports, stale assertions) directly in the spec files

7. Commit and push all bug tasks and test fixes:
   git add -A && git commit -m "test: E2E run — fix test issues, file app bugs" && git push origin main

8. Report final summary: X passed / Y failed / Z bugs filed

## Admin credentials
- admin@conference.dev / Admin123!
- Test users: user1@test.dev / Test123!

## Key pages to verify
Home, Conferences list, Conference detail, Schedule, Session detail, Speakers list, Speaker detail, Login, Register, My Schedule, Admin dashboard, Admin conferences/speakers/sessions CRUD
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Full Playwright suite executed against live Aspire stack
- [ ] #2 Every real app bug from test failures has a filed backlog task
- [ ] #3 Test-only issues (wrong selectors etc.) fixed in spec files
- [ ] #4 Final pass/fail/skip counts reported in task final summary
- [ ] #5 All bug tasks committed and pushed to main
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Full suite run: 107 passed, 15 failed, 12 skipped

Failure categories:
- 10 tests: sticky column header in schedule grid intercepts session card clicks (real app bug → TASK-72)
- 1 test: navigation.spec.ts looking for stale heading text (test fix applied)
- 1 test: comprehensive-audit.spec.ts hardcoded TechConf 2026 renamed by admin.spec.ts (test fix applied)
- 1 test: ical-export.spec.ts strict mode violation with 2 matching empty-state elements (test fix applied)
- admin.spec.ts: rename test pollutes shared data; refactored to use disposable conference
<!-- SECTION:NOTES:END -->
