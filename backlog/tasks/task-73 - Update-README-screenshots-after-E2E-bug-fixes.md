---
id: TASK-73
title: Update README screenshots after E2E bug fixes
status: To Do
assignee: []
created_date: '2026-03-15 01:55'
updated_date: '2026-03-15 01:55'
labels:
  - docs
  - readme
dependencies:
  - TASK-69
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Once TASK-69 (full E2E run) is complete and all bugs are fixed, retake the README screenshots so they reflect the current state of the app (earth tone design, working schedule grid, correct timezone display, earth tone track colors, etc.)

Run the screenshot script against the live Aspire stack:
  APP_URL=http://localhost:<port> node scripts/take-screenshots.js

Update docs/screenshots/ with fresh captures and ensure README.md embeds them correctly.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All 7 README screenshots retaken against the fixed app
- [ ] #2 docs/screenshots/ updated with new images
- [ ] #3 README.md screenshot section reflects current UI
<!-- AC:END -->
