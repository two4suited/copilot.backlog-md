---
id: TASK-28
title: 'Email notifications: registration confirmation and session reminders'
status: Done
assignee:
  - '@dotnet-developer'
created_date: '2026-03-14 22:17'
updated_date: '2026-03-14 22:23'
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
Email notifications implemented with MailKit.

New files: IEmailService, EmailService (MailKit, Smtp__ config, dev no-op when host empty), SessionReminderService (BackgroundService polls every 5min for sessions starting in 55-65min, sets ReminderSent=true), NoOpEmailService test double.

Changes: Registration.cs + ReminderSent bool, EF migration AddReminderSentToRegistration, Program.cs DI registration, RegistrationsController fire-and-forget confirmation on POST, appsettings.json Smtp section with empty dev defaults.

Build: 0 errors.
<!-- SECTION:FINAL_SUMMARY:END -->
