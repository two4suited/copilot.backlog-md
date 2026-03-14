---
id: TASK-2.3
title: 'FEATURE: Track API'
status: Done
assignee: []
created_date: '2026-03-14 21:12'
updated_date: '2026-03-14 21:33'
labels:
  - feature
  - backend
  - api
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
- [x] #1 GET /api/conferences/{conferenceId}/tracks returns track list
- [x] #2 POST/PUT/DELETE track endpoints work correctly
- [x] #3 Track is validated to belong to the correct conference
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implemented TracksController nested under /api/conferences/{conferenceId:guid}/tracks with GET list (ordered by SortOrder, session count), GET/{id} (with sessions as SessionSummaryDto), POST, PUT, and soft-delete DELETE. Conference existence validated on list/create; conference membership validated on GET detail/PUT/DELETE. Removed conflicting minimal-API track route from Program.cs.
<!-- SECTION:FINAL_SUMMARY:END -->
