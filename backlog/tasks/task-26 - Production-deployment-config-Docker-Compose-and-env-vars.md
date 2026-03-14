---
id: TASK-26
title: 'Production deployment config: Docker Compose and env vars'
status: Done
assignee:
  - '@devops'
created_date: '2026-03-14 22:13'
updated_date: '2026-03-14 22:16'
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
- [x] #1 docker-compose up starts all services without error
- [x] #2 .env.example documents all required environment variables
- [x] #3 README deployment section updated with docker-compose instructions
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Full production Docker Compose stack delivered.

- Dockerfile.api: multi-stage sdk:10.0→aspnet:10.0, port 8080
- Dockerfile.frontend: node:20-alpine build → nginx:alpine, SPA fallback + /api /hubs proxy with WebSocket upgrade
- docker-compose.yml: postgres:16 + api + frontend, health checks, named volume
- .env.example: all required vars documented (POSTGRES_*, ConnectionStrings__conferencedb, Jwt__Key/Issuer/Audience)
- README updated with Production Deployment section
- .gitignore: .env entry added

docker compose config validates cleanly.
<!-- SECTION:FINAL_SUMMARY:END -->
