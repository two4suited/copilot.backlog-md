---
id: TASK-35
title: 'E2E tests: navigation and routing'
status: In Progress
assignee:
  - '@tester'
created_date: '2026-03-14 22:26'
updated_date: '2026-03-14 22:26'
labels:
  - testing
  - frontend
dependencies: []
priority: high
---

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Home/landing page loads with nav links
- [ ] #2 All nav links navigate to correct pages
- [ ] #3 404 route shows not-found message or redirects home
- [ ] #4 Back button works after navigating to detail pages
- [ ] #5 Deep link to /sessions/:id works without prior navigation
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Check App.tsx for routes and 404 handling
2. Write navigation.spec.ts
3. Run tests
4. File bugs for failures
5. Mark done
<!-- SECTION:PLAN:END -->
