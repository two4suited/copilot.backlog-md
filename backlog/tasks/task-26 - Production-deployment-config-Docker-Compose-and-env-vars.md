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
Added Docker Compose production deployment configuration.

## Changes
- `Dockerfile.api`: Multi-stage .NET 10 build → aspnet:10.0 runtime, exposes port 8080
- `Dockerfile.frontend`: Multi-stage node:20-alpine build → nginx:alpine runtime on port 80
- `nginx.conf`: Serves React SPA with `/api/` and `/hubs/` proxied to the backend; SPA fallback to `index.html`
- `docker-compose.yml`: Orchestrates postgres:16-alpine (with health check + named volume), api, and frontend services; api depends on healthy postgres
- `.env.example`: Documents all required environment variables (PostgreSQL creds, connection string, JWT key/issuer/audience)
- `README.md`: Added "Production Deployment" section with prerequisites, steps, URL table, env var reference, and cleanup commands
- `.gitignore`: Added explicit `.env` entry alongside existing `*.env`

## Notes
- JWT env vars aligned with actual config keys in `Program.cs` (`Jwt__Key`, `Jwt__Issuer`, `Jwt__Audience`)
- YAML validated with `docker compose config -q` ✅
- Frontend proxies `/api/` and `/hubs/` so the browser sees same-origin in production (no CORS issues)
<!-- SECTION:FINAL_SUMMARY:END -->
