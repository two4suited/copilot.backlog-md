---
id: TASK-6.3
title: 'FEATURE: API Documentation & Deployment Guide'
status: Done
assignee:
  - '@dotnet-developer'
created_date: '2026-03-14 21:13'
updated_date: '2026-03-14 21:52'
labels:
  - feature
  - docs
dependencies: []
parent_task_id: TASK-6
priority: medium
github_issue: 119
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Swagger UI for API, README with architecture overview, and a step-by-step guide for local and production deployment.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Swagger UI accessible at /swagger in development
- [x] #2 All endpoints documented with request/response examples
- [x] #3 README covers prerequisites, setup steps, and architecture diagram
- [x] #4 Deployment guide covers Docker Compose and a cloud provider
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Swagger UI at /swagger with JWT Bearer auth. XML doc comments on Auth/Conferences/Sessions/Registrations controllers. docs/deployment.md with local dev, env vars, Azure, Docker, migrations, seed accounts.
<!-- SECTION:FINAL_SUMMARY:END -->
