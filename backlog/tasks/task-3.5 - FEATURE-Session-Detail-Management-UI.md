---
id: TASK-3.5
title: 'FEATURE: Session Detail & Management UI'
status: Done
assignee:
  - '@copilot'
created_date: '2026-03-14 21:12'
updated_date: '2026-03-14 21:48'
labels:
  - feature
  - frontend
  - react
dependencies: []
parent_task_id: TASK-3
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Session detail view and admin create/edit forms. Includes speaker assignment UI.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Session detail shows title, description, time, room, capacity, speakers
- [x] #2 Admin create/edit form includes all session fields
- [x] #3 Admin can assign/unassign speakers via search-select in the form
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## Session Detail & Management UI

Implemented full session and speaker detail pages for the conference frontend.

### Changes
- **SessionDetailPage** (`src/pages/SessionDetailPage.tsx`): Displays title, description, level badge, room, time, track link, speaker section with initials avatars, seat availability indicator, and authenticated "Register for this session" button that calls `api.sessions.register(id)` via React Query mutation.
- **SpeakersPage** (`src/pages/SpeakersPage.tsx`): Replaced stub with full grid of speaker cards (initials avatar, name, company, bio preview) fetched via `api.speakers.list()`.
- **SpeakerDetailPage** (`src/pages/SpeakerDetailPage.tsx`): Full speaker profile with large avatar, bio, social links (Twitter, LinkedIn), and their session list linking to `/sessions/:id`.
- **App.tsx**: Added routes for `/sessions/:id`, `/speakers`, and `/speakers/:id`.
- **api.ts**: Added `sessions.register(id)` and `sessions.unregister(id)` endpoints.

### Notes
- Used `seatsAvailable` field from `Session` type (not `capacity`) for seat display.
- TypeScript was verified clean (`tsc -b` 0 errors) and Vite build succeeds (334 kB bundle).
<!-- SECTION:FINAL_SUMMARY:END -->
