---
id: TASK-2.3
title: 'FEATURE: Track API'
status: To Do
assignee: []
created_date: '2026-03-14 21:12'
labels:
  - feature
  - backend
dependencies: []
parent_task_id: TASK-2
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
REST endpoints for Track CRUD, nested under a conference. Admin-only writes.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 GET /api/conferences/{conferenceId}/tracks returns track list
- [ ] #2 POST/PUT/DELETE track endpoints work correctly
- [ ] #3 Track is validated to belong to the correct conference
<!-- AC:END -->
