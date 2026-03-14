# Orchestrator Agent - Quick Start Guide

## Installation ✅

Already installed! The orchestrator is integrated into this project.

## Basic Commands

### Assignment
```bash
# Show recommendation for a task
orchestrator assign 1

# Assign to specific agent
orchestrator assign 1 --agent code-review

# Auto-assign all "To Do" tasks
orchestrator bulk-assign

# Check status
orchestrator status

# See available agents
orchestrator agents
```

### Monitoring
```bash
# Scan for issues
orchestrator-monitor scan

# View agent performance
orchestrator-monitor metrics

# Find stalled tasks
orchestrator-monitor stalled

# Get suggestions
orchestrator-monitor suggest
```

## Agent Quick Reference

| Agent | Best For | Keywords |
|-------|----------|----------|
| **explore** | Research, understanding | understand, analyze, investigate |
| **task** | Building, testing, deployment | build, test, deploy, run |
| **code-review** | Quality, security, validation | review, security, audit, validate |
| **general-purpose** | Complex, multi-step work | refactor, architect, redesign |

## Workflow Example

```bash
# 1. Create task in backlog.md
backlog task create "Fix authentication bug" -d "JWT token expiration handling" --label bug

# 2. Get agent recommendation
orchestrator assign 1
# → Recommends code-review agent

# 3. Start work
backlog task edit 1 -s "In Progress" -a @myself

# 4. Monitor progress
orchestrator-monitor scan

# 5. Complete task
backlog task edit 1 -s Done
backlog task edit 1 --final-summary "Fixed token expiration handling"
```

## Tips

- **Clear titles** → Better analysis
  - ✓ "Fix memory leak in WebSocket handler"
  - ✗ "Fix bug"

- **Use labels** → Guide assignment
  - research → explore
  - build, test → task
  - security → code-review
  - refactor → general-purpose

- **Review recommendations** before bulk-assigning
  ```bash
  orchestrator show 7  # Check scoring
  orchestrator bulk-assign  # Then auto-assign all
  ```

- **Monitor stalled tasks** regularly
  ```bash
  orchestrator-monitor stalled
  orchestrator-monitor suggest
  ```

## Full Documentation

See [ORCHESTRATOR.md](./ORCHESTRATOR.md) for complete reference.

## Troubleshooting

**Wrong agent assigned?**
```bash
orchestrator show 7        # Check scoring details
orchestrator assign 7 --agent code-review  # Override
```

**Task not recognized?**
```bash
backlog task list --plain  # Check task exists
orchestrator agents        # See what keywords agents look for
```

**Need more help?**
```bash
orchestrator help
orchestrator-monitor help
```
