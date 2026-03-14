---
id: TASK-5.3
title: 'FEATURE: Real-Time Seat Availability'
status: Done
assignee:
  - '@copilot'
created_date: '2026-03-14 21:13'
updated_date: '2026-03-14 22:02'
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
- [x] #1 SignalR hub added to API project
- [x] #2 Registration changes broadcast updated seat count to hub group
- [x] #3 Session cards update seat count in real-time without page refresh
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
SignalR hub (SessionHub) with JoinSession/LeaveSession groups. RegistrationsController broadcasts SeatsUpdated after register/cancel. Frontend useSessionSeats hook connects to /hubs/session, returns seatsAvailable + isConnected. SessionDetailPage shows pulsing LIVE badge when connected. Vite /hubs proxy with ws:true for dev.
<!-- SECTION:FINAL_SUMMARY:END -->
