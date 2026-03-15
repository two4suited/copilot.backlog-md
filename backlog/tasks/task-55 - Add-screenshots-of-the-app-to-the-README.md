---
id: TASK-55
title: Add screenshots of the app to the README
status: To Do
assignee: []
created_date: '2026-03-15 00:50'
labels:
  - documentation
  - readme
dependencies:
  - TASK-53
  - TASK-54
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
After TASK-54 (redesign) is complete, capture screenshots of key pages and embed them in README.md to give visitors a quick visual overview of the app. Screenshots should use the production-quality seed data from TASK-53.

Pages to screenshot:
- Home page (conference listing)
- Schedule page (full grid with sessions)
- Session detail page
- Speakers list page
- Admin dashboard

Store screenshots under docs/screenshots/. Use descriptive filenames like home.png, schedule.png, etc.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Screenshots captured for Home, Schedule, Session Detail, Speakers, and Admin pages
- [ ] #2 Screenshots stored in docs/screenshots/ with descriptive filenames
- [ ] #3 README.md embeds screenshots with captions using Markdown image syntax
- [ ] #4 Screenshots reflect the TASK-54 redesign and TASK-53 seed data
<!-- AC:END -->
