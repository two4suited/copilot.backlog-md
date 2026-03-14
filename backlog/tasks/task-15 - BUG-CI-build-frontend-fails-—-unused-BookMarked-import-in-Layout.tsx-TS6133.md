---
id: TASK-15
title: >-
  [BUG] CI build-frontend fails — unused BookMarked import in Layout.tsx
  (TS6133)
status: Done
assignee: []
created_date: '2026-03-14 21:50'
updated_date: '2026-03-14 21:51'
labels:
  - bug
  - frontend
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**Error:** `src/components/Layout.tsx(2,49): error TS6133: BookMarked is declared but its value is never read`

**Cause:** Agent that updated Layout.tsx for auth added a BookMarked import that was never used in JSX.

**Fix:** Remove BookMarked from the lucide-react import in Layout.tsx.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 frontend npm run build passes with 0 errors
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
False positive — BookMarked IS used at line 50 in Layout.tsx for the My Schedule nav link. Error only appeared in the transitional TASK-3.5 commit before auth UI was merged. Current build: 1861 modules, 0 errors.
<!-- SECTION:FINAL_SUMMARY:END -->
