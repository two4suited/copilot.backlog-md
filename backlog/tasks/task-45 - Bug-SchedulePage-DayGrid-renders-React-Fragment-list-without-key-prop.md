---
id: TASK-45
title: 'Bug: SchedulePage DayGrid renders React Fragment list without key prop'
status: To Do
assignee: []
created_date: '2026-03-15 00:44'
labels:
  - bug
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
On the /schedule page, the DayGrid component maps over timeSlots using a bare React Fragment (<>) as the list item wrapper (SchedulePage.tsx line 146). Because <> does not support the key prop, React cannot track list items, causing a console error: 'Each child in a list should have a unique key prop. Check the render method of div. It was passed a child from DayGrid.'

URL: /schedule
Action: Visit the schedule page with sessions loaded
Expected: No console errors; React can efficiently re-render the grid
Actual: Console error about missing key props fires on every schedule render

Fix: Replace <> with <Fragment key={time}> (importing Fragment from 'react')
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Console error about missing key prop is gone
- [ ] #2 Schedule page renders correctly with keyed fragments
- [ ] #3 No regression on schedule grid layout
<!-- AC:END -->
