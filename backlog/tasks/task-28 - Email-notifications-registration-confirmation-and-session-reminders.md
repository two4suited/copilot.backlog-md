---
id: TASK-28
title: 'Email notifications: registration confirmation and session reminders'
status: To Do
assignee: []
created_date: '2026-03-14 22:17'
labels:
  - backend
  - feature
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Send transactional emails using MailKit/SMTP. (1) Confirmation email when user registers for a session. (2) Reminder email 1 hour before session start. Use a background IHostedService for reminders. Config via appsettings: Smtp__Host, Smtp__Port, Smtp__User, Smtp__Password, Smtp__From. In development use MailHog or log to console if SMTP not configured.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 POST /api/registrations sends confirmation email to registered user
- [ ] #2 Background service sends reminder emails 1h before session start time
- [ ] #3 Email config via Smtp__ appsettings; gracefully skips if not configured
- [ ] #4 Email templates include session title, time, location, and a cancel link
<!-- AC:END -->
