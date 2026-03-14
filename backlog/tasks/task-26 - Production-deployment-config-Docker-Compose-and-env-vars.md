---
id: TASK-26
title: 'Production deployment config: Docker Compose and env vars'
status: In Progress
assignee:
  - '@devops'
created_date: '2026-03-14 22:13'
updated_date: '2026-03-14 22:14'
labels:
  - infrastructure
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add a docker-compose.yml at repo root that runs the full stack: postgres, .NET API, React frontend (via nginx). Include .env.example with all required env vars. Update README deployment section.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 docker-compose up starts all services without error
- [ ] #2 .env.example documents all required environment variables
- [ ] #3 README deployment section updated with docker-compose instructions
<!-- AC:END -->
