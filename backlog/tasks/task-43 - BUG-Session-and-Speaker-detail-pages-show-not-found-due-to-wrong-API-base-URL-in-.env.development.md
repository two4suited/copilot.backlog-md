---
id: TASK-43
title: >-
  [BUG] Session and Speaker detail pages show 'not found' due to wrong API base
  URL in .env.development
status: To Do
assignee: []
created_date: '2026-03-15 00:26'
labels:
  - bug
  - tester
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Steps to Reproduce
1. Start the app via Aspire (API on https://localhost:7133, Vite on :5174)
2. Navigate directly to /sessions/<valid-id> or /speakers/<valid-id>
3. Observe 'Session not found.' / 'Speaker not found.' error messages

## Root Cause
frontend/.env.development sets VITE_API_URL=http://localhost:5000
The axios client in src/services/api.ts uses this as an absolute baseURL:
  const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
This causes in-browser API requests to bypass the Vite proxy and go directly
to port 5000 (macOS Control Center, returns 403) instead of the real API.
The Vite proxy (vite.config.ts) correctly forwards /api/* to the Aspire API
but only intercepts relative-path requests, not absolute-URL requests.

## Expected
Session and speaker detail pages load data and display their title/name in h1.

## Actual
Pages show 'Session not found.' / 'Speaker not found.' because API calls return 403.

## Fix Suggestion
Change frontend/.env.development to VITE_API_URL= (empty) so axios uses relative
paths that the Vite proxy intercepts and forwards correctly to the real API.
Or remove VITE_API_URL from .env.development and update the fallback in api.ts
from 'http://localhost:5000' to '' (empty string).
<!-- SECTION:DESCRIPTION:END -->
