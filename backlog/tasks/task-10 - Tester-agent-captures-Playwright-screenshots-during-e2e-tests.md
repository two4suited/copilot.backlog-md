---
id: TASK-10
title: Tester agent captures Playwright screenshots during e2e tests
status: Done
assignee:
  - '@tester'
created_date: '2026-03-14 21:42'
updated_date: '2026-03-14 21:42'
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
- [x] #1 Playwright config enables screenshot: 'only-on-failure' at minimum
- [x] #2 Playwright config sets outputDir for screenshots/traces
- [x] #3 Tester agent .md instructions include guidance on manual page.screenshot() at key steps
- [x] #4 Bug tasks filed by tester include path to relevant screenshot
- [x] #5 Screenshots directory is gitignored (test-results/)
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Updated tester agent with Playwright screenshot support:
- screenshot: "on" in config (captures on all tests, not just failures)
- video: "on-first-retry" for full failure reproduction
- outputDir: test-results/ with dedicated screenshots/ subfolder
- Naming convention: <feature>-<scenario>-<step>.png
- Manual page.screenshot() guidance at key assertion points
- Bug filing template updated to include screenshot and trace paths
- webServer updated to use aspire run
- test-results/ and playwright-report/ added to .gitignore
<!-- SECTION:FINAL_SUMMARY:END -->
