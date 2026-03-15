---
id: TASK-72
title: >-
  Bug: Schedule page — sticky column headers intercept pointer events on session
  cards
status: Done
assignee: []
created_date: '2026-03-15 01:52'
updated_date: '2026-03-15 01:55'
labels:
  - bug
  - frontend
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The schedule grid at /schedule uses sticky column headers (track names) with z-20 and no pointer-events handling. When Playwright (and users on smaller viewports or after scrolling) tries to click the first visible session card link, the sticky header div is visually positioned on top of the card and intercepts the click event, making session cards in the first visible row unclickable.\n\nSteps to reproduce:\n1. Navigate to /schedule\n2. Attempt to click the first session card in the grid (the card directly below the sticky track-name header)\n3. Click is intercepted by the sticky header div ('sticky top-[116px] z-20 ... text-center')\n\nAffects 10 E2E tests: sessions.spec.ts (can click through to session detail, register button), seats.spec.ts (seat count, register decrements, full state), registration.spec.ts (all 5 registration tests), a11y-smoke.spec.ts (session detail a11y), comprehensive-audit.spec.ts (back navigation).\n\nRoot cause: SchedulePage.tsx line 137 — the sticky header cells span full column width/height and sit at z-20, but the session cells immediately below start at the same Y position. Because the sticky element never leaves the viewport top edge (it is always 'stuck'), it physically overlaps the first row of session cards.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Session card links in the schedule grid are clickable even in the first visible row below the sticky track header
- [ ] #2 Playwright test 'can click through to a session detail page' passes without timeouts
- [ ] #3 Clicking a session from /schedule navigates to /sessions/:id in both headed and headless browser
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Duplicate of TASK-70 which is already fixed in commit 3d16ca6. TASK-70 removed the sticky positioning from column headers, fixing both the visual overlap and pointer-event interception issue.
<!-- SECTION:NOTES:END -->
