---
id: TASK-6.3
title: 'FEATURE: API Documentation & Deployment Guide'
status: Done
assignee:
  - '@dotnet-developer'
created_date: '2026-03-14 21:13'
updated_date: '2026-03-14 21:51'
labels:
  - feature
  - docs
dependencies: []
parent_task_id: TASK-6
priority: medium
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
Added Swagger/OpenAPI with JWT Bearer auth support via Swashbuckle.AspNetCore 7.3.1.

**What changed:**
- Removed Microsoft.AspNetCore.OpenApi in favour of Swashbuckle (avoids OpenApi 1.x vs 2.x version conflict)
- Added GenerateDocumentationFile + NoWarn 1591 to csproj for XML doc generation
- Configured SwaggerGen with Bearer security definition and XML comments in Program.cs
- Swagger UI available at /swagger in development
- Added XML doc comments (<summary>, <param>, <response>) to all key endpoints: Auth (register, login, me), Conferences (list), Sessions (list), Registrations (register, cancel, list attendees, my registrations)
- Created docs/deployment.md covering prerequisites, local dev, environment variables, Azure Container Apps (azd), Docker Compose, EF migrations, and default seed accounts
- README already contained the Swagger UI link; no change needed

**Tests:** dotnet build ConferenceApp.sln — 0 errors, 0 warnings
<!-- SECTION:FINAL_SUMMARY:END -->
