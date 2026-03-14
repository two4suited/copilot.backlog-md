---
id: TASK-5.3
title: 'FEATURE: Real-Time Seat Availability'
status: In Progress
assignee:
  - '@copilot'
created_date: '2026-03-14 21:13'
updated_date: '2026-03-14 21:57'
labels:
  - feature
  - backend
  - frontend
dependencies: []
parent_task_id: TASK-5
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
SignalR hub pushes seat count updates to all connected clients when registrations change.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 SignalR hub added to API project
- [ ] #2 Registration changes broadcast updated seat count to hub group
- [ ] #3 Session cards update seat count in real-time without page refresh
<!-- AC:END -->
