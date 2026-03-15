---
id: TASK-37
title: >-
  [BUG] SessionReminderService crashes on shutdown — Task.Delay outside
  try/catch
status: Done
assignee: []
created_date: '2026-03-14 22:30'
updated_date: '2026-03-15 00:12'
labels:
  - bug
  - backend
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Task.Delay(Interval, stoppingToken) was outside the try/catch in ExecuteAsync. On app shutdown the cancellation token fires, Task.Delay throws OperationCanceledException which propagates as unhandled, triggering StopHost behavior. Fixed by moving Task.Delay inside try/catch and catching OperationCanceledException to break cleanly.
<!-- SECTION:DESCRIPTION:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
SessionReminderService already correctly wraps Task.Delay inside the try/catch block with OperationCanceledException caught to break cleanly on shutdown. No code change needed — closing as already fixed.
<!-- SECTION:FINAL_SUMMARY:END -->
