---
id: TASK-30
title: 'E2E tests: registration flows'
status: In Progress
assignee:
  - '@tester'
created_date: '2026-03-14 22:23'
updated_date: '2026-03-14 22:24'
labels:
  - testing
  - backend
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Playwright/xUnit tests for email features: (1) Playwright — register for a session, assert confirmation email sent (mock SMTP or check logs). (2) xUnit — unit test SessionReminderService finds correct sessions in 55-65min window and sets ReminderSent=true. (3) xUnit — EmailService skips when Smtp__Host is empty.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 xUnit: ReminderService sends email for sessions in 55-65min window
- [ ] #2 xUnit: ReminderService skips sessions where ReminderSent=true
- [ ] #3 xUnit: EmailService returns early without throwing when Smtp__Host is empty
- [ ] #4 Register for a session (skip if API unavailable)
- [ ] #5 Cancel a registration
- [ ] #6 Cannot register twice for same session (409 conflict)
- [ ] #7 Cannot register when session is full
- [ ] #8 My Schedule page shows registered sessions
<!-- AC:END -->
