---
id: TASK-44
title: >-
  Bug: newly created speaker does not appear in session speaker assignment
  dropdown
status: To Do
assignee: []
created_date: '2026-03-15 00:42'
labels:
  - bug
  - admin
  - sessions
  - speakers
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
When a new speaker is created via the admin UI (/admin/speakers/new), the speaker is saved successfully but does not appear as an option when assigning speakers to a session in the session form (/admin/sessions/:id or /admin/sessions/new). The speaker list in the session form appears stale or uses a different query/cache that does not include newly created speakers.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Reproduce: create a new speaker, then open a session form — new speaker is missing from the speaker picker
- [ ] #2 Root cause identified (stale query cache, wrong endpoint, or missing speaker in API response)
- [ ] #3 Session form speaker picker shows all speakers including newly created ones
- [ ] #4 Selecting and saving a speaker on a session persists correctly
<!-- AC:END -->
