---
id: TASK-67
title: >-
  Bug: Schedule track chip colors are bright/random — should use earth tone
  palette
status: In Progress
assignee:
  - '@agent-fix67'
created_date: '2026-03-15 01:46'
updated_date: '2026-03-15 01:55'
labels:
  - bug
  - design
  - data
  - frontend
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Screenshot shows the filter bar track chips and grid track labels use vivid random colors (blue, orange, red, hot pink, green, purple) that clash with the warm earth tone design.

The track colors come from the seed data (each track has a hex color). The seed data was seeded with vivid colors before the earth tone redesign. Two fixes needed:

1. DbSeeder.cs — update track hex colors to earth tone compatible values:
   - Backend & APIs: #9e4820 (terracotta)
   - Data & AI: #556b45 (sage)  
   - Security: #7a5c3a (warm brown)
   - DevOps & Cloud: #8a6a3a (golden brown)
   - Platform Engineering: #5c7a6b (muted teal-brown)
   - Frontend & UX: #7a4a5c (dusty mauve)
   Apply same pattern for all conferences' tracks.

2. Reset DB so new colors are seeded (or UPDATE tracks directly)

File: ConferenceApp.Api/Data/DbSeeder.cs
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 All track chips in filter bar use earth tone compatible hex colors
- [x] #2 Track labels in session grid use the updated colors
- [x] #3 DB updated with new track colors (direct SQL or seeder reset)
<!-- AC:END -->
