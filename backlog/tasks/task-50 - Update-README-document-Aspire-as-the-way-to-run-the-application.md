---
id: TASK-50
title: 'Update README: document Aspire as the way to run the application'
status: In Progress
assignee:
  - '@agent-docs'
created_date: '2026-03-15 00:46'
updated_date: '2026-03-15 01:12'
labels:
  - docs
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The README currently does not clearly explain that .NET Aspire is the primary way to run the full ConferenceApp stack locally. It should explain: how to start the app with 'dotnet run' in ConferenceApp.AppHost, how to find the Aspire dashboard URL and login token, how to discover the dynamic Vite frontend port, the seeded admin credentials, and how to run E2E tests against the live stack.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 README has a 'Getting Started' section that leads with 'dotnet run' in ConferenceApp.AppHost
- [x] #2 README explains how to find the Aspire dashboard URL and login token from console output
- [x] #3 README documents how to find the Vite frontend port (lsof or Aspire dashboard → frontend resource → Endpoints)
- [x] #4 README includes E2E test run command with APP_URL env var
- [x] #5 Old docker-compose or manual setup instructions removed or clearly marked as legacy
<!-- AC:END -->
