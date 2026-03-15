---
id: TASK-48
title: 'Bug: Vite /hubs proxy missing secure:false causes SignalR connection failure'
status: In Progress
assignee:
  - '@agent-frontend'
created_date: '2026-03-15 00:44'
updated_date: '2026-03-15 00:53'
labels:
  - bug
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The Vite dev server proxies /hubs to the .NET API (https://localhost:7133) which uses a self-signed development certificate. The /api proxy has secure: false set (to bypass SSL verification) but the /hubs proxy does not. This causes the SignalR WebSocket connection to fail during negotiation with the error:

'Error: Failed to start the connection: Error: The connection was stopped during negotiation.'

Observed in: browser console when visiting /sessions/:id
Affected feature: Real-time seat availability updates via useSessionSeats hook

vite.config.ts current config:
  '/api': { target: apiTarget, changeOrigin: true, secure: false }   ← has secure: false
  '/hubs': { target: apiTarget, changeOrigin: true, ws: true }       ← MISSING secure: false

Fix: Add secure: false to the /hubs proxy entry in vite.config.ts.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 No SignalR connection error in browser console on session detail page
- [x] #2 isConnected state in useSessionSeats becomes true
- [x] #3 Real-time seat updates work when another user registers
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added secure: false to the /hubs proxy entry in vite.config.ts. The /api proxy already had this; /hubs was missing it, causing SignalR WebSocket negotiation to fail against the self-signed dev certificate. Now both proxy entries have secure: false and /hubs retains ws: true for WebSocket upgrade.
<!-- SECTION:FINAL_SUMMARY:END -->
