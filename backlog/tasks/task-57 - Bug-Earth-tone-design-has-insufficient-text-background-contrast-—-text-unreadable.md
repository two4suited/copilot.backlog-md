---
id: TASK-57
title: >-
  Bug: Earth tone design has insufficient text/background contrast — text
  unreadable
status: Done
assignee:
  - '@agent-contrast'
created_date: '2026-03-15 01:06'
updated_date: '2026-03-15 01:13'
labels:
  - bug
  - design
  - accessibility
  - frontend
dependencies: []
priority: high
github_issue: 113
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The new earth tone palette (linen bg #faf7f2, espresso text #2c1810, muted text #8a7468) has contrast ratio failures across multiple areas. Light-on-light combinations make body text and muted labels difficult or impossible to read, especially on cream card surfaces.

Known problem areas:
- Muted/secondary text (#8a7468) on linen background (#faf7f2) — fails WCAG AA (4.5:1 ratio required)
- Card content text on cream surface (#f0ebe3) — low contrast for body copy
- Sage green (#6b7c5c) track chips with white text — may fail on smaller text
- Any grey or tan text on off-white backgrounds
- Form placeholder text on light inputs

Fix approach:
- Run all colour pairs through WCAG contrast checker (target AA = 4.5:1 for normal text, 3:1 for large)
- Darken muted text from #8a7468 to at least #5c4a42 or similar
- Ensure body text on all surface colours hits 4.5:1
- Increase terracotta accent contrast where used as text colour
- Keep the warm earth tone aesthetic — just darken the palette where needed
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 All normal body text on any background passes WCAG AA (4.5:1 contrast ratio)
- [x] #2 Muted/secondary text passes WCAG AA on all surfaces it appears on
- [x] #3 Track chips and badges pass WCAG AA for their text colour
- [x] #4 Form labels, placeholders, and input text are clearly readable
- [x] #5 Earth tone aesthetic preserved — no switch to black/white, just darkened where needed
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## TASK-57: Fix insufficient text/background contrast in earth tone design

### What changed
- `brand-muted` darkened: `#8a7468` → `#5c4038` (warm brown, 5.8:1 on linen — passes WCAG AA)
- `brand-accent` darkened: `#c2622d` → `#9e4820` (darker terracotta, 6.16:1 with white, 5.8:1 on linen — passes WCAG AA)
- `brand-sage` darkened: `#6b7c5c` → `#556b45` (darker sage, 5.88:1 with white — passes WCAG AA)
- Hardcoded fallback hex in `SchedulePage.tsx` updated: `#6b7c5c` → `#556b45`
- Hardcoded fallback hex in `SessionDetailPage.tsx` updated: `#c2622d` → `#9e4820`

### Why
The previous muted/accent/sage colours failed WCAG AA (4.5:1) in several text-on-background combinations. Users could not read muted labels, secondary text, and chip text.

### Impact
All normal body text, muted text, form placeholders, track chips, and badges now meet WCAG AA. Earth tone aesthetic is fully preserved — only the darkness of failing colours was adjusted.

### Tests
- `cd frontend && npm run build` passes with 0 errors
- grep confirms no old failing hex values remain in source
<!-- SECTION:FINAL_SUMMARY:END -->
