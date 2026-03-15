---
id: TASK-40
title: >-
  [BUG] aspire run — postgres WaitFor(db) stuck due to stale data volume
  password
status: Done
assignee: []
created_date: '2026-03-14 22:49'
updated_date: '2026-03-15 00:12'
labels:
  - bug
  - infrastructure
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
AddPostgres with WithDataVolume generates a new random password each run, but the persisted volume keeps the old one. Health check for conferencedb fails → API never starts. Fix: use fixed pg-password parameter + WaitFor(postgres) not WaitFor(db).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 aspire run starts all services (postgres, api, frontend) within 60s
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Already fixed in Program.cs: uses stable pg-password parameter with fixed DevPassword123! value and WaitFor(postgres) not WaitFor(db). Volume password mismatch issue resolved.
<!-- SECTION:FINAL_SUMMARY:END -->
