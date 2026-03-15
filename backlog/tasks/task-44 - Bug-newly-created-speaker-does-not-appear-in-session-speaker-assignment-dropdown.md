---
id: TASK-44
title: >-
  Bug: newly created speaker does not appear in session speaker assignment
  dropdown
status: Done
assignee: []
created_date: '2026-03-15 00:42'
updated_date: '2026-03-15 00:43'
labels:
  - bug
  - admin
  - sessions
  - speakers
dependencies: []
priority: high
github_issue: 100
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

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Root cause: SpeakerFormPage and SpeakerAdminPage invalidated ['admin','speakers'] but SessionFormPage caches speakers under ['speakers']. Fixed by also invalidating ['speakers'] in both admin pages on save/delete.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Fixed stale speaker list in session form by adding invalidateQueries for the ['speakers'] cache key in SpeakerFormPage.tsx and SpeakerAdminPage.tsx. Previously only ['admin','speakers'] was invalidated, so the session speaker picker never refreshed after creating or deleting a speaker.
<!-- SECTION:FINAL_SUMMARY:END -->
