---
id: TASK-5.3
title: 'FEATURE: Real-Time Seat Availability'
status: In Progress
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
## Real-Time Seat Availability via SignalR (TASK-5.3)

### What changed
- **Backend**: Added `ConferenceApp.Api/Hubs/SessionHub.cs` — a SignalR hub with `JoinSession`/`LeaveSession` group methods.
- **Backend**: Registered `AddSignalR()` and mapped `MapHub<SessionHub>("/hubs/session")` in `Program.cs`. CORS updated with `AllowCredentials()` to support WebSocket negotiation.
- **Backend**: `RegistrationsController` now injects `IHubContext<SessionHub>` and broadcasts a `SeatsUpdated` event (with `sessionId` + `seatsAvailable`) to the session group after every register and cancel operation.
- **Frontend**: Installed `@microsoft/signalr` npm package.
- **Frontend**: Created `src/hooks/useSessionSeats.ts` — connects to `/hubs/session`, joins the session group on mount, updates `seatsAvailable` state on `SeatsUpdated` events, and cleans up on unmount.
- **Frontend**: `SessionDetailPage` uses `useSessionSeats` hook (called before conditional returns, honouring rules of hooks). Shows a pulsing indigo dot + "LIVE" badge next to the seat count when connected.
- **Frontend**: `vite.config.ts` proxy extended to forward `/hubs` with `ws: true` for dev server WebSocket support.

### Tests
- `dotnet build ConferenceApp.sln -c Release` — 0 errors, 0 warnings
- `cd frontend && npm run build` — 0 errors (TypeScript + Vite)

### User impact
Registered/cancelled seat counts update instantly for all viewers of a session detail page without requiring a page refresh.
<!-- SECTION:FINAL_SUMMARY:END -->
