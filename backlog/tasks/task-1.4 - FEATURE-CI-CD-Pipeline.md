---
id: TASK-1.4
title: 'FEATURE: CI/CD Pipeline'
status: To Do
assignee: []
created_date: '2026-03-14 21:12'
labels:
  - feature
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
- [ ] #1 CI workflow triggers on push and PR to main
- [ ] #2 dotnet build and dotnet test run in CI
- [ ] #3 npm install and npm run build run in CI
- [ ] #4 Build fails if tests fail
<!-- AC:END -->
