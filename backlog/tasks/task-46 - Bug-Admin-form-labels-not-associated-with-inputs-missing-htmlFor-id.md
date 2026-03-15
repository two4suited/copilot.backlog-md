---
id: TASK-46
title: 'Bug: Admin form labels not associated with inputs (missing htmlFor/id)'
status: To Do
assignee: []
created_date: '2026-03-15 00:44'
labels:
  - bug
  - accessibility
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
All three admin form pages (ConferenceFormPage, SessionFormPage, SpeakerFormPage) render <label> elements without htmlFor attributes, and all <input>/<select>/<textarea> elements lack id attributes. This breaks the accessible label–input association.

Affected pages:
- /admin/conferences/new and /admin/conferences/:id (ConferenceFormPage.tsx)
- /admin/sessions/new and /admin/sessions/:id (SessionFormPage.tsx)
- /admin/speakers/new and /admin/speakers/:id (SpeakerFormPage.tsx)

Action: Visit any admin form page and inspect the DOM
Expected: Each label has htmlFor='fieldId' and its matching input has id='fieldId'
Actual: All labels have htmlFor='' and all inputs have id=''

Impact:
- Screen readers cannot associate labels with inputs
- Clicking the label does not focus the input
- playwright getByLabel() fails (causes test failures)

Fix: Add unique id attributes to each form field and matching htmlFor on the labels.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All admin form labels have htmlFor matching a corresponding input id
- [ ] #2 Clicking a label focuses the associated input
- [ ] #3 Playwright getByLabel() can locate each field
- [ ] #4 No regression on form submission or validation
<!-- AC:END -->
