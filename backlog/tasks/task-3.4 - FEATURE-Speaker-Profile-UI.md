---
id: TASK-3.4
title: 'FEATURE: Speaker Profile UI'
status: In Progress
assignee:
  - '@copilot'
created_date: '2026-03-14 21:12'
updated_date: '2026-03-14 21:56'
labels:
  - feature
  - frontend
  - react
dependencies: []
parent_task_id: TASK-3
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Speaker listing page and individual speaker profile pages showing bio, photo, and their sessions.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Speakers page lists all speakers with photo, name, company
- [ ] #2 Speaker detail page shows full bio and list of their sessions
- [ ] #3 Sessions on speaker page link to the schedule
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Review existing SpeakerDetailPage.tsx - found it mostly complete
2. Enhance avatar components to show actual photo when photoUrl is set (with initials fallback)
3. Verify types align with API response (SpeakerDetailDto includes sessions)
4. Run build to confirm no TypeScript errors
5. Mark ACs and close task
<!-- SECTION:PLAN:END -->
