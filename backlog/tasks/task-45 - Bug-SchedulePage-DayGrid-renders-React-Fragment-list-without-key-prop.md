---
id: TASK-45
title: 'Bug: SchedulePage DayGrid renders React Fragment list without key prop'
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
On the /schedule page, the DayGrid component maps over timeSlots using a bare React Fragment (<>) as the list item wrapper (SchedulePage.tsx line 146). Because <> does not support the key prop, React cannot track list items, causing a console error: 'Each child in a list should have a unique key prop. Check the render method of div. It was passed a child from DayGrid.'

URL: /schedule
Action: Visit the schedule page with sessions loaded
Expected: No console errors; React can efficiently re-render the grid
Actual: Console error about missing key props fires on every schedule render

Fix: Replace <> with <Fragment key={time}> (importing Fragment from 'react')
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Console error about missing key prop is gone
- [x] #2 Schedule page renders correctly with keyed fragments
- [x] #3 No regression on schedule grid layout
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Replaced bare <> Fragment with <Fragment key={time}> in SchedulePage DayGrid desktop grid time-slot rows. Added Fragment to the React import. This eliminates the 'Each child in a list should have a unique key prop' console error.
<!-- SECTION:FINAL_SUMMARY:END -->
