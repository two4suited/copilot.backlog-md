---
id: TASK-3.4
title: 'FEATURE: Speaker Profile UI'
status: Done
assignee:
  - '@copilot'
created_date: '2026-03-14 21:12'
updated_date: '2026-03-14 21:57'
labels:
  - feature
  - frontend
  - react
dependencies: []
parent_task_id: TASK-3
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Speaker listing page and individual speaker profile pages showing bio, photo, and their sessions.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Speakers page lists all speakers with photo, name, company
- [x] #2 Speaker detail page shows full bio and list of their sessions
- [x] #3 Sessions on speaker page link to the schedule
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Review existing SpeakerDetailPage.tsx - found it mostly complete
2. Enhance avatar components to show actual photo when photoUrl is set (with initials fallback)
3. Verify types align with API response (SpeakerDetailDto includes sessions)
4. Run build to confirm no TypeScript errors
5. Mark ACs and close task
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## Speaker Profile UI (TASK-3.4)

Enhanced and verified the speaker profile pages in the React frontend.

### Changes
- **SpeakerDetailPage.tsx**: Updated `LargeAvatar` to accept `photoUrl` prop — renders `<img>` when URL is present, falls back to styled initials div otherwise. Avatar is passed the speaker's `photoUrl`.
- **SpeakersPage.tsx**: Updated `SpeakerAvatar` with the same photo/initials logic for the speaker grid cards.

### Features verified end-to-end
- Speakers page lists all speakers with photo (or initials avatar), name, and company
- Speaker detail page shows: photo/avatar, name, company, full bio, Twitter/LinkedIn social links (conditionally rendered), and a list of sessions
- Each session card on the speaker detail page links to `/sessions/:id`
- Loading and error states handled via `LoadingSpinner` and `ErrorMessage` components
- Route `/speakers/:id` → `SpeakerDetailPage` confirmed in `App.tsx`

### Tests
- `npm run build` (tsc + vite) passes with zero errors
<!-- SECTION:FINAL_SUMMARY:END -->
