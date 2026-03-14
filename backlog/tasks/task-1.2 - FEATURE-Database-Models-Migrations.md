---
id: TASK-1.2
title: 'FEATURE: Database Models & Migrations'
status: To Do
assignee: []
created_date: '2026-03-14 21:11'
updated_date: '2026-03-14 21:19'
labels:
  - feature
  - database
  - backend
dependencies: []
parent_task_id: TASK-1
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Define all EF Core entity models, configure relationships in DbContext, generate initial migration, and add seed data so the app starts with demo content.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Models created: Conference, Track, Session, Speaker, User, Registration, SessionSpeaker (join)
- [ ] #2 ConferenceDbContext configured with all DbSets and relationships
- [ ] #3 Initial migration generated and applied on startup
- [ ] #4 Seed data includes at least 1 conference, 2 tracks, 4 sessions, 2 speakers
<!-- AC:END -->
