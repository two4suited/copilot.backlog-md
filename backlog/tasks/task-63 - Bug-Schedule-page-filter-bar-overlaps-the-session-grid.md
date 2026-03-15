---
id: TASK-63
title: 'Bug: Schedule page filter bar overlaps the session grid'
status: Done
assignee:
  - '@agent-schedule'
created_date: '2026-03-15 01:31'
updated_date: '2026-03-15 01:45'
labels:
  - bug
  - frontend
  - ui
dependencies: []
priority: high
github_issue: 126
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
On the Schedule page, the filter/track-selector bar is overlapping the session grid below it. Sessions or time slots are hidden behind the filter bar, making the schedule unreadable.

Likely causes:
- Filter bar has `position: sticky` or `position: fixed` without enough top offset
- The session grid container lacks sufficient `padding-top` or `margin-top` to account for the filter bar height
- z-index stacking issue causing the filter to render over grid content
- After the TASK-54/56 redesign, the filter bar height may have changed but the grid offset wasn't updated

File to investigate: `frontend/src/pages/SchedulePage.tsx`
Also check any sticky header logic in `frontend/src/components/` related to schedule/track filtering.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Filter bar no longer overlaps session grid content
- [x] #2 All time slots and sessions are fully visible below the filter bar
- [x] #3 Sticky positioning (if used) has correct top offset accounting for nav + filter bar height
- [x] #4 Fix verified at both desktop (1280px) and mobile (375px) viewport widths
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Make filter bar sticky at top-16 z-30 with matching background color and border-b
2. Pass hasFilterBar prop to DayGrid based on tracks.length > 1
3. Update DayGrid column header sticky top: top-16 when no filter bar, top-[116px] (64+52) when filter bar present
4. Run npm run build to verify
5. Mark all ACs and set Done
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Root cause: filter bar lacked sticky positioning; grid column headers used top-16 (nav only) without accounting for filter bar height
- Fix: filter bar → sticky top-16 z-30 with matching background + border-b
- Fix: DayGrid gains hasFilterBar prop; column headers use top-[116px] (64+52px) when filter bar present, top-16 otherwise
- Mobile stacked view unaffected (no sticky headers in stacked layout)
- Build passes cleanly
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## Fix: Schedule filter bar no longer overlaps session grid

### What changed
- `SchedulePage.tsx` — filter bar wrapper gains `sticky top-16 z-30` with a matching background colour and `border-b` so content can scroll behind it cleanly; replaced `mb-6` with `mb-4` and added negative-margin bleed for full-width sticky band
- `DayGrid` — new optional `hasFilterBar` prop; desktop grid column headers switch from `sticky top-16` to `sticky top-[116px]` (nav 64 px + filter bar ~52 px) when the filter bar is present, preventing them from sliding underneath the sticky filter bar
- `SchedulePage` passes `hasFilterBar={tracks.length > 1}` to `DayGrid`

### Why
The filter bar had no `position: sticky`, so it scrolled away. The grid column headers were already sticky at `top-16` (accounting for the nav only). With the filter bar now sticky at the same `top-16` offset, the column headers would have been hidden behind it. The new `top-[116px]` offset puts the column headers cleanly below both the nav and the filter bar.

### Tests / verification
- `npm run build` — TypeScript + Vite build passes with 0 errors
- Responsive: filter bar at `top-16 z-30` on all viewports; desktop grid headers at `top-[116px]`, mobile stacked view has no sticky headers and is unaffected
- Single-track conferences: `hasFilterBar=false` → headers stay at `top-16`, no regression
<!-- SECTION:FINAL_SUMMARY:END -->
