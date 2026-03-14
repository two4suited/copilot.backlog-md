---
id: TASK-17
title: Add GitHub Actions expert agent and CI-monitor to orchestrator ralph loop
status: Done
assignee:
  - '@copilot'
created_date: '2026-03-14 21:55'
updated_date: '2026-03-14 21:59'
labels:
  - infrastructure
  - orchestrator
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create a .github/agents/github-actions-expert.md agent definition and extend the orchestrator ralph loop to poll gh run list, detect failures, file bug tasks, and auto-assign them to the github-actions-expert agent.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 github-actions-expert.md agent file created with full skill set
- [x] #2 Ralph loop polls CI on each cycle (gh run list)
- [x] #3 Failed runs create a bug task and assign to github-actions-expert
- [x] #4 Same run ID is not filed twice (dedup by run ID)
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Created .github/agents/github-actions-expert.md with full CI/CD skill set. Orchestrator ralph loop now calls checkCIAndFileBugs() each cycle — polls gh run list, deduplicates by run ID, auto-files bug tasks labeled bug,ci,infrastructure and assigned to github-actions-expert.
<!-- SECTION:FINAL_SUMMARY:END -->
