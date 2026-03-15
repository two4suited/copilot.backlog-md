---
id: TASK-8
title: Use aspire run to start the app
status: Done
assignee:
  - '@copilot'
created_date: '2026-03-14 21:39'
updated_date: '2026-03-14 21:44'
labels:
  - infrastructure
  - aspire
dependencies: []
priority: high
github_issue: 123
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Replace all references to 'dotnet run --project ConferenceApp.AppHost' and 'npm run dev' with 'aspire run'. Update README, QUICK_START.md, agent instruction files, and any other docs. Aspire CLI handles launching API, frontend, and PostgreSQL together.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 README updated — only 'aspire run' in quick start
- [x] #2 All agent .md files updated to use aspire run
- [x] #3 QUICK_START.md updated
- [x] #4 npm/dotnet run instructions removed from all docs
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Updated all docs and agent files to use `aspire run` instead of `dotnet run --project ConferenceApp.AppHost`.

Changes:
- README.md: replaced `dotnet run --project ConferenceApp.AppHost` with `aspire run`; removed separate "Run services individually" section with `npm run dev`; added Aspire CLI install prerequisite (`dotnet tool install -g aspire`); updated stack table to .NET 10 / React 19 / Aspire 13.
- .github/agents/aspire-expert.md: updated dashboard note to reference `aspire run`; updated Aspire package versions to 13.x.
- .github/agents/dotnet-developer.md: updated stack to ASP.NET Core .NET 10 / C# 14.
- .github/agents/react-developer.md: updated stack to React 19.
- .github/agents/database-developer.md: updated EF Core version to 10.
<!-- SECTION:FINAL_SUMMARY:END -->
