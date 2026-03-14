---
id: TASK-15
title: >-
  [BUG] CI build-frontend fails — unused BookMarked import in Layout.tsx
  (TS6133)
status: To Do
assignee: []
created_date: '2026-03-14 21:50'
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
- [ ] #1 frontend npm run build passes with 0 errors
<!-- AC:END -->
