---
id: TASK-6.1
title: 'FEATURE: OpenTelemetry & Aspire Dashboard'
status: To Do
assignee: []
created_date: '2026-03-14 21:13'
updated_date: '2026-03-14 21:19'
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
- [ ] #1 API exports traces and metrics via OpenTelemetry SDK
- [ ] #2 Aspire Dashboard shows live traces for API requests
- [ ] #3 Health check endpoint at /health returns 200 with component statuses
- [ ] #4 Structured logging (Serilog or built-in) outputs JSON in production
<!-- AC:END -->
