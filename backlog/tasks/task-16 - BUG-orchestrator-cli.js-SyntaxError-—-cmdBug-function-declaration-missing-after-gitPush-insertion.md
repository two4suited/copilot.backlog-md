---
id: TASK-16
title: >-
  [BUG] orchestrator-cli.js SyntaxError — cmdBug function declaration missing
  after gitPush insertion
status: To Do
assignee: []
created_date: '2026-03-14 21:53'
labels:
  - bug
  - infrastructure
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
SyntaxError: Unexpected token } at line 633 in orchestrator-cli.js. Root cause: when gitPush() and cmdPush() were inserted above cmdBug, the "function cmdBug(params) {" declaration line was accidentally dropped, leaving the function body as bare code. Fix: restore the function declaration.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 node --check src/orchestrator-cli.js passes
- [ ] #2 CI lint-orchestrator job passes green
<!-- AC:END -->
