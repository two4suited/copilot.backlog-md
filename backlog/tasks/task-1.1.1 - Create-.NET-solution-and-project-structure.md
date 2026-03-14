---
id: TASK-1.1.1
title: Create .NET solution and project structure
status: To Do
assignee: []
created_date: '2026-03-14 21:13'
updated_date: '2026-03-14 21:19'
labels:
  - task
  - infrastructure
  - aspire
dependencies: []
parent_task_id: TASK-1.1
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Scaffold the solution file and the three projects: ConferenceApp.AppHost, ConferenceApp.Api, ConferenceApp.Models. Add project references and Aspire NuGet packages.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Solution file contains all three projects
- [ ] #2 ConferenceApp.Api references ConferenceApp.Models
- [ ] #3 AppHost has Aspire.Hosting and Aspire.Hosting.PostgreSQL packages
- [ ] #4 dotnet build succeeds from solution root
<!-- AC:END -->
