---
id: TASK-65
title: Remove automatic trigger from Azure Container Apps deploy workflow
status: To Do
assignee: []
created_date: '2026-03-15 01:44'
labels:
  - infrastructure
  - github-actions
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The deploy-aca.yml workflow currently triggers automatically on every push to main. This is dangerous without Azure credentials configured and too aggressive for a workflow that costs money to run.

Change the workflow so it ONLY runs on manual workflow_dispatch — remove the push trigger entirely. The workflow has already been disabled via 'gh workflow disable' as a temporary measure, but the code-level change should be made so the intent is clear and a future 'gh workflow enable' doesn't accidentally re-enable auto-deploy.

File to change: .github/workflows/deploy-aca.yml

Current on: block:
  on:
    push:
      branches: [main]
    workflow_dispatch:

Target:
  on:
    workflow_dispatch:
      inputs:
        environment:
          description: 'Target environment (e.g. production)'
          required: false
          default: 'production'
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 deploy-aca.yml push trigger removed — only workflow_dispatch remains
- [ ] #2 workflow_dispatch has an optional environment input for targeting different environments
- [ ] #3 Workflow file committed and pushed
<!-- AC:END -->
