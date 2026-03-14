---
id: TASK-24
title: 'E2E tests: search, bookmarks, and real-time seat updates'
status: Done
assignee:
  - '@tester'
created_date: '2026-03-14 22:13'
updated_date: '2026-03-14 22:19'
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

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added three Playwright e2e spec files for search, bookmarks, and seat availability. search.spec.ts covers: search input visibility, 1-char no-dropdown rule, dropdown appearance with 2+ chars, session/speaker click navigation, and Escape-to-close. bookmarks.spec.ts covers: bookmark toggle, offline_bookmarks localStorage persistence (unauthenticated), reload persistence, and API registration sync (authenticated). seats.spec.ts covers: seat count display, numeric validation, register-button decrement, LIVE SignalR badge, and full-session disabled state. All API-dependent tests skip gracefully when backend is unavailable. 2 offline-safe tests pass, 16 skip correctly without backend.
<!-- SECTION:FINAL_SUMMARY:END -->
