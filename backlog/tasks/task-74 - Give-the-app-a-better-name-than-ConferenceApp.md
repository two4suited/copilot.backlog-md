---
id: TASK-74
title: Give the app a better name than 'ConferenceApp'
status: In Progress
assignee:
  - '@agent-rename'
created_date: '2026-03-15 01:57'
updated_date: '2026-03-15 02:15'
labels:
  - enhancement
  - branding
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The app is currently named 'ConferenceApp' everywhere — project folders, solution file, namespaces, page titles, README, Docker images, etc. Come up with a more memorable product name and apply it consistently.

Suggested names to consider (pick the best or propose alternatives):
- **Sessionize** — sessions + organize
- **Confab** — informal word for conference/chat
- **Stagewise** — stage + schedule
- **Convene** — to gather/assemble
- **Summitly** — summit + ly

## Scope of changes
- Solution/project names: ConferenceApp.Api → <Name>.Api, ConferenceApp.AppHost → <Name>.AppHost, etc.
- C# namespaces across all .cs files
- frontend/package.json name and title
- frontend/index.html `<title>`
- Layout.tsx navbar brand text
- README.md title and references
- docker-compose.yml service names
- azure.yaml app name
- .github/workflows job names
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 A product name is chosen and documented in the task notes
- [x] #2 All project/solution files renamed to use the new name
- [x] #3 All C# namespaces updated
- [x] #4 Frontend package.json, index.html title, and navbar brand updated
- [x] #5 README, docker-compose, azure.yaml updated
- [x] #6 App builds and runs successfully after rename
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Name chosen: Sessionize
<!-- SECTION:NOTES:END -->
