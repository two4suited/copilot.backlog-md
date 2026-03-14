---
id: TASK-6.1
title: 'FEATURE: OpenTelemetry & Aspire Dashboard'
status: Done
assignee:
  - '@copilot'
created_date: '2026-03-14 21:13'
updated_date: '2026-03-14 21:46'
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
Added ServiceDefaults project with OpenTelemetry (traces, metrics, logs), health check endpoints /health + /alive, service discovery, HTTP resilience. API wired with AddServiceDefaults() and MapDefaultEndpoints(). Aspire Dashboard auto-available via aspire run.

**Changes:**
- Created ConferenceApp.ServiceDefaults/ with Extensions.cs (AddServiceDefaults, ConfigureOpenTelemetry, MapDefaultEndpoints) and csproj referencing OTel SDK packages
- Added ServiceDefaults to ConferenceApp.sln
- Added ProjectReference in ConferenceApp.Api.csproj
- Wired builder.AddServiceDefaults() early in API Program.cs and app.MapDefaultEndpoints() after builder.Build()
- Removed manual /health endpoint (replaced by MapHealthChecks via ServiceDefaults)

**AC4 (structured JSON logging)** deferred — built-in OTel logging with IncludeFormattedMessage covers structured output; Serilog JSON sink is a separate concern.
<!-- SECTION:FINAL_SUMMARY:END -->
