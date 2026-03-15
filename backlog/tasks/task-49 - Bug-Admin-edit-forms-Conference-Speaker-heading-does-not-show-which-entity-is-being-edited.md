---
id: TASK-49
title: >-
  Bug: Admin edit forms (Conference, Speaker) heading does not show which entity
  is being edited
status: Done
assignee:
  - '@agent-frontend'
created_date: '2026-03-15 00:45'
updated_date: '2026-03-15 00:54'
labels:
  - bug
  - ux
dependencies: []
priority: medium
github_issue: 105
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
When editing an existing conference or speaker through the admin interface, the page heading shows only 'Edit Conference' or 'Edit Speaker' with no mention of which specific item is being edited. A user who opens an edit form has no visible context about which entity they are modifying until the form fields load.

Affected pages:
- /admin/conferences/:id → h1 says 'Edit Conference' (no conference name)
- /admin/speakers/:id → h1 says 'Edit Speaker' (no speaker name)
(Note: /admin/sessions/:id also shows 'Edit Session' without session title)

Action: Navigate to /admin/conferences/<id> or /admin/speakers/<id> while logged in as admin
Expected: Page heading shows the entity name, e.g., 'Edit Conference: TechConf 2026'
Actual: Page heading shows only generic 'Edit Conference' / 'Edit Speaker'

Fix: Update the h1 heading in ConferenceFormPage, SpeakerFormPage, and SessionFormPage to include the entity name once data is loaded, e.g.: {isNew ? 'New Conference' : conference?.name ? `Edit Conference: ${conference.name}` : 'Edit Conference'}
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Admin conference edit page heading shows the conference name
- [x] #2 Admin speaker edit page heading shows the speaker name
- [x] #3 Admin session edit page heading shows the session title
- [x] #4 New entity pages still show 'New Conference' / 'New Speaker' / 'New Session'
<!-- AC:END -->
