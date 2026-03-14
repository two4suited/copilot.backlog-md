---
id: TASK-21
title: Search API and UI — full-text search across sessions and speakers
status: In Progress
assignee:
  - '@copilot'
created_date: '2026-03-14 22:05'
updated_date: '2026-03-14 22:08'
labels:
  - backend
  - frontend
  - api
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add a GET /api/search?q=term endpoint that searches sessions (title, description, speaker name) and speakers (name, bio, company). Frontend: search bar in the nav header that shows a dropdown of results as you type, with links to session/speaker detail pages.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 GET /api/search?q= returns sessions and speakers matching the query
- [x] #2 Search is case-insensitive and matches partial words
- [x] #3 Frontend search bar shows live dropdown results
- [x] #4 Clicking a result navigates to the correct detail page
<!-- AC:END -->
