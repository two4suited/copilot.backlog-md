---
id: TASK-9
title: Update orchestrator to push to remote after every commit
status: Done
assignee:
  - '@dotnet-developer'
created_date: '2026-03-14 21:39'
updated_date: '2026-03-14 21:44'
labels:
  - infrastructure
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add git push to orchestrator-cli.js: auto-push in ralph loop after changes, add explicit 'orchestrator push' command, update all .github/agents/*.md instruction files to git push after their commits.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 gitPush() helper added to orchestrator-cli.js
- [x] #2 Ralph loop auto-pushes when tasks assigned or bugs filed
- [x] #3 'orchestrator push' command available
- [x] #4 All agent instruction files include git push step
<!-- AC:END -->
