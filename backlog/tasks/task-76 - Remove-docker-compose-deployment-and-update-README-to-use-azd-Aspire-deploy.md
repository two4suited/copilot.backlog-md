---
id: TASK-76
title: Remove docker-compose deployment and update README to use azd/Aspire deploy
status: In Progress
assignee:
  - '@agent-cleanup'
created_date: '2026-03-15 03:04'
updated_date: '2026-03-15 03:05'
labels:
  - docs
  - cleanup
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Production deployment for Sessionize uses `azd up` (Azure Developer CLI + .NET Aspire), NOT docker-compose. Several files need cleanup:

## Files to remove
- `docker-compose.yml` — not needed for production (Aspire handles orchestration locally; azd handles cloud)
- `Dockerfile.api` — Aspire/azd builds containers automatically, no manual Dockerfiles needed
- `Dockerfile.frontend` — same as above
- `docs/deployment.md` — references Docker Compose workflow, replace with azd instructions

## README.md changes
- Remove the entire 'Production Deployment' section that references docker-compose
- Replace with a clean 'Deploy to Azure' section explaining azd workflow:
  1. `azd auth login`
  2. `azd up` (provisions Azure Container Apps + PostgreSQL + ACR)
  3. `azd deploy` for subsequent deploys
- Remove Docker Desktop from the prerequisites table (not needed for dev, Aspire manages its own containers)
- Keep the local dev section (Aspire run) unchanged

## docs/deployment.md
- Rewrite entirely to cover only the azd deployment flow
- Remove all Docker Compose references
- Cover: prerequisites (azd CLI, Azure subscription), first-time setup, ongoing deploys, teardown
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 docker-compose.yml removed from repo
- [ ] #2 Dockerfile.api and Dockerfile.frontend removed
- [ ] #3 README Production Deployment section updated to azd workflow, no docker-compose
- [ ] #4 docs/deployment.md rewritten for azd only
- [ ] #5 No docker-compose references remain in README or docs
<!-- AC:END -->
