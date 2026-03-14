---
id: TASK-30
title: 'E2E tests: email notification flows and reminder service'
status: To Do
assignee: []
created_date: '2026-03-14 22:23'
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
<!-- AC:END -->
