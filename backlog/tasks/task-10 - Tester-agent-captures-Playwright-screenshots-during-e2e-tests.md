---
id: TASK-10
title: Tester agent captures Playwright screenshots during e2e tests
status: To Do
assignee: []
created_date: '2026-03-14 21:42'
labels:
  - testing
  - qa
  - e2e
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Update the tester agent instructions and Playwright config so that screenshots are automatically captured during test runs. Screenshots should be taken on test failure (automatic), at key assertion points (manual page.screenshot calls), and saved to a dedicated directory. Screenshots should be attached to bug reports filed in backlog.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Playwright config enables screenshot: 'only-on-failure' at minimum
- [ ] #2 Playwright config sets outputDir for screenshots/traces
- [ ] #3 Tester agent .md instructions include guidance on manual page.screenshot() at key steps
- [ ] #4 Bug tasks filed by tester include path to relevant screenshot
- [ ] #5 Screenshots directory is gitignored (test-results/)
<!-- AC:END -->
