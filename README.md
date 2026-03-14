# copilot.backlog-md

Backlog.md project with integrated Orchestrator agent for intelligent task assignment to Copilot CLI agents.

## Quick Start

### Using the Orchestrator

```bash
# Analyze a task and get agent recommendation
orchestrator assign 7

# Auto-assign all pending tasks
orchestrator bulk-assign

# Check assignment status
orchestrator status

# Monitor task progress
orchestrator-monitor scan
orchestrator-monitor stalled

# View agent performance
orchestrator-monitor metrics
```

### Learn More

- **Full Documentation:** See [ORCHESTRATOR.md](./ORCHESTRATOR.md)
- **Agent Instructions:** See [.github/ORCHESTRATOR.md](./.github/ORCHESTRATOR.md)
- **Backlog.md CLI:** See [.github/copilot-instructions.md](./.github/copilot-instructions.md)

## What's Included

- 🧠 **Intelligent Assignment:** Analyzes task properties to recommend best-fit agent
- 🎯 **CLI Tools:** `orchestrator` and `orchestrator-monitor` commands
- 📊 **Progress Tracking:** Detects stalled tasks and suggests reassignments
- 📈 **Metrics:** Agent performance tracking and completion rates
- 📚 **Integration:** Works seamlessly with backlog.md CLI

## Project Structure

```
src/
├── orchestrator.js              # Core logic & assignment engine
├── orchestrator-cli.js          # Task assignment CLI
├── orchestrator-monitor.js      # Progress tracking
└── orchestrator-monitor-cli.js  # Monitor CLI

backlog/
├── tasks/                       # Task files
├── .orchestrator-metadata.json  # Assignment storage
└── .orchestrator-monitor.json   # Progress tracking

.github/
├── ORCHESTRATOR.md              # Agent instructions
└── copilot-instructions.md      # Backlog.md usage guide
```

## Commands

### Assignment
- `orchestrator assign <taskId>` - Assign task with recommendation
- `orchestrator assign <taskId> --agent <type>` - Assign to specific agent
- `orchestrator bulk-assign` - Auto-assign all pending tasks
- `orchestrator status` - Show assignments and history
- `orchestrator show <taskId>` - Detailed task analysis
- `orchestrator agents` - List available agents

### Monitoring
- `orchestrator-monitor scan` - Scan for status changes & stalled tasks
- `orchestrator-monitor metrics` - Agent performance metrics
- `orchestrator-monitor stalled` - Find tasks stalled 24+ hours
- `orchestrator-monitor suggest` - Reassignment suggestions

## Integration with Backlog.md

Use alongside backlog.md CLI for complete project management:

```bash
# Create task
backlog task create "Feature title" -d "Description" --label feature

# Orchestrator recommends agent
orchestrator assign 1

# Work on task
backlog task edit 1 -s "In Progress" -a @myself

# Track progress
orchestrator-monitor scan

# Complete task
backlog task edit 1 -s Done
backlog task edit 1 --final-summary "PR description"
```

## Learn More

- [Full Orchestrator Documentation](./ORCHESTRATOR.md)
- [Agent Instructions](./.github/ORCHESTRATOR.md)
- [Backlog.md CLI Reference](./.github/copilot-instructions.md)
- [Agent Types and Specialties](./ORCHESTRATOR.md#agent-selection-guide)

