---
id: TASK-24
title: 'E2E tests: search, bookmarks, and real-time seat updates'
status: In Progress
assignee:
  - '@tester'
created_date: '2026-03-14 22:13'
updated_date: '2026-03-14 22:14'
labels:
  - testing
  - frontend
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Playwright e2e specs for the three newest features: (1) nav search bar with debounce and result navigation, (2) bookmark toggle on session cards persisting across page reloads, (3) SignalR seat count updating live when another user registers. Log any bugs found as new backlog tasks.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Search bar spec: type query, assert dropdown items appear, click result navigates to detail page
- [ ] #2 Bookmarks spec: toggle bookmark on session card, reload page, verify bookmark persists
- [ ] #3 Seat availability spec: register for session, assert seat count decreases in UI
- [ ] #4 Any bugs discovered are filed as new backlog tasks with label bug
<!-- AC:END -->
