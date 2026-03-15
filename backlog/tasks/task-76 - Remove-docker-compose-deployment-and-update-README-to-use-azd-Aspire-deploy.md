---
id: TASK-76
title: Remove docker-compose deployment and update README to use azd/Aspire deploy
status: Done
assignee:
  - '@agent-cleanup'
created_date: '2026-03-15 03:04'
updated_date: '2026-03-15 03:06'
labels:
  - docs
  - cleanup
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Production deployment for Sessionize uses the built-in Aspire deploy command, NOT docker-compose or azd.

The deploy command is:
  dotnet run --project Sessionize.AppHost -- --publisher=manifest
  OR: dotnet aspire deploy (if Aspire CLI tools installed)

Aspire handles containerisation, Azure Container Apps provisioning, and deployment automatically via its built-in Azure publisher (AddAzureContainerAppEnvironment in Program.cs).

## Files to remove
- docker-compose.yml — not needed
- Dockerfile.api — Aspire builds containers automatically
- Dockerfile.frontend — same
- docs/deployment.md — rewrite for Aspire deploy only

## README changes
- Remove docker-compose Production Deployment section
- Replace with Aspire deploy instructions:
  1. dotnet aspire deploy (or equivalent publish command)
  2. No azd needed
- Remove Docker Desktop from prerequisites
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 docker-compose.yml removed from repo
- [x] #2 Dockerfile.api and Dockerfile.frontend removed
- [x] #3 README Production Deployment section updated to azd workflow, no docker-compose
- [x] #4 docs/deployment.md rewritten for azd only
- [x] #5 No docker-compose references remain in README or docs
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Removed docker-compose.yml, Dockerfile.api, Dockerfile.frontend, nginx.conf, and .env.example.

kept frontend/Dockerfile.frontend.prod and frontend/nginx.prod.conf (used by Aspire AppHost for production builds).

README.md: replaced "Production Deployment" (docker-compose) section with "Deploy to Azure" (azd workflow); removed the docker-compose-specific Docker Desktop prerequisite note.

docs/deployment.md: rewritten entirely for azd/Aspire deployment — covers provisioned resources, first-time setup, ongoing deploys, tear-down, and CI/CD pointer.

No docker-compose references remain in any markdown or workflow files.
<!-- SECTION:FINAL_SUMMARY:END -->
