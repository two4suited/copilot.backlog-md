---
id: TASK-1.1.1
title: Create .NET solution and project structure
status: Done
assignee:
  - '@aspire-expert'
created_date: '2026-03-14 21:13'
updated_date: '2026-03-14 21:26'
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
- [x] #1 Solution file contains all three projects
- [x] #2 ConferenceApp.Api references ConferenceApp.Models
- [x] #3 AppHost has Aspire.Hosting and Aspire.Hosting.PostgreSQL packages
- [x] #4 dotnet build succeeds from solution root
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Solution contains all 3 projects (AppHost, Api, Models). Api references Models via ProjectReference. AppHost has Aspire.Hosting, Aspire.Hosting.PostgreSQL, and Aspire.Hosting.NodeJs packages. Fixed Registration.cs/Conference.cs/Speaker.cs model mismatches so dotnet build passes cleanly from solution root.
<!-- SECTION:FINAL_SUMMARY:END -->
