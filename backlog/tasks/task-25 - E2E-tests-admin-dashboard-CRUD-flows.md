---
id: TASK-25
title: 'E2E tests: admin dashboard CRUD flows'
status: In Progress
assignee:
  - '@tester'
created_date: '2026-03-14 22:13'
updated_date: '2026-03-14 22:22'
labels:
  - testing
  - frontend
dependencies: []
priority: high
---

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Admin login and /admin route access verified
- [ ] #2 Create conference form submits and new item appears in list
- [ ] #3 Edit session form pre-fills existing data and saves changes
- [ ] #4 Delete speaker shows confirmation dialog and removes item
- [ ] #5 Non-admin user cannot access /admin (redirect to login or 403)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Read existing e2e patterns (auth.spec.ts, sessions.spec.ts)
2. Explore admin UI components: AdminLayout, ConferenceAdminPage, SessionAdminPage, SpeakerAdminPage, form pages
3. Explore MySchedulePage for iCal export button logic
4. Write frontend/e2e/admin.spec.ts covering route protection, CRUD flows, and non-admin redirect
5. Write frontend/e2e/ical-export.spec.ts covering unauthenticated redirect, no-sessions state, download trigger
6. Run tests, verify pass/skip counts
7. Commit and push
<!-- SECTION:PLAN:END -->
