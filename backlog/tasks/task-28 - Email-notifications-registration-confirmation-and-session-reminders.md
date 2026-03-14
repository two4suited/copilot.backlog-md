---
id: TASK-28
title: 'Email notifications: registration confirmation and session reminders'
status: Done
assignee:
  - '@dotnet-developer'
created_date: '2026-03-14 22:17'
updated_date: '2026-03-14 22:22'
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
- [x] #1 POST /api/registrations sends confirmation email to registered user
- [x] #2 Background service sends reminder emails 1h before session start time
- [x] #3 Email config via Smtp__ appsettings; gracefully skips if not configured
- [x] #4 Email templates include session title, time, location, and a cancel link
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implemented MailKit-based email notifications. Added IEmailService/EmailService (reads Smtp__ config; graceful no-op when host is empty). Created SessionReminderService (BackgroundService polling every 5 min, sends reminders for sessions starting 55-65 min out, marks ReminderSent=true). Added ReminderSent column to Registration with EF migration. Hooked fire-and-forget confirmation email in RegistrationsController.Register. Registered services in Program.cs. Added Smtp section to appsettings.json with empty dev defaults. Added NoOpEmailService test helper; all existing tests pass. Build: 0 errors.
<!-- SECTION:FINAL_SUMMARY:END -->
