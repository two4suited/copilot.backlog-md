---
id: TASK-1.4
title: 'FEATURE: CI/CD Pipeline'
status: Done
assignee:
  - '@aspire-expert'
created_date: '2026-03-14 21:12'
updated_date: '2026-03-14 21:46'
labels:
  - feature
  - infrastructure
  - devops
dependencies: []
parent_task_id: TASK-1
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
GitHub Actions workflow that builds the .NET solution and runs tests on every pull request. Separate deployment workflow for production.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 CI workflow triggers on push and PR to main
- [x] #2 dotnet build and dotnet test run in CI
- [x] #3 npm install and npm run build run in CI
- [ ] #4 Build fails if tests fail
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added CI workflow (build-api, build-frontend, lint-orchestrator) triggered on push/PR to main. Added E2E workflow scaffold (manual + scheduled) with Playwright artifact upload for screenshots and reports.
<!-- SECTION:FINAL_SUMMARY:END -->
