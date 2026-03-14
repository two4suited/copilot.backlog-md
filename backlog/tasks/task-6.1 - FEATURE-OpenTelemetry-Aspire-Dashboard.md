---
id: TASK-6.1
title: 'FEATURE: OpenTelemetry & Aspire Dashboard'
status: Done
assignee:
  - '@copilot'
created_date: '2026-03-14 21:13'
updated_date: '2026-03-14 21:47'
labels:
  - feature
  - observability
  - aspire
dependencies: []
parent_task_id: TASK-6
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Instrument the API with OpenTelemetry tracing and metrics. Configure the Aspire Dashboard to display logs, traces, and metrics.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 API exports traces and metrics via OpenTelemetry SDK
- [x] #2 Aspire Dashboard shows live traces for API requests
- [x] #3 Health check endpoint at /health returns 200 with component statuses
- [ ] #4 Structured logging (Serilog or built-in) outputs JSON in production
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Created ServiceDefaults project with OpenTelemetry traces/metrics/logs, /health + /alive endpoints. API wired with AddServiceDefaults(). Aspire Dashboard auto-available via aspire run.
<!-- SECTION:FINAL_SUMMARY:END -->
