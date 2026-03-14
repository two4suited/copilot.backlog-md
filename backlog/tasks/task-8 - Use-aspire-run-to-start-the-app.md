---
id: TASK-8
title: Use aspire run to start the app
status: In Progress
assignee:
  - '@aspire-expert'
created_date: '2026-03-14 21:39'
updated_date: '2026-03-14 21:41'
labels:
  - infrastructure
  - aspire
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Replace all references to 'dotnet run --project ConferenceApp.AppHost' and 'npm run dev' with 'aspire run'. Update README, QUICK_START.md, agent instruction files, and any other docs. Aspire CLI handles launching API, frontend, and PostgreSQL together.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 README updated — only 'aspire run' in quick start
- [ ] #2 All agent .md files updated to use aspire run
- [ ] #3 QUICK_START.md updated
- [ ] #4 npm/dotnet run instructions removed from all docs
<!-- AC:END -->
