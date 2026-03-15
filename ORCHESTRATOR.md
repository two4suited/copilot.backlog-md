# Orchestrator Agent for Backlog.md

Intelligent task assignment system that coordinates work across Copilot CLI agents (explore, task, code-review, general-purpose).

## ⚠️ Rules for All Agents

### Rule 1 — Create a Backlog Task Before Doing Any Work

**When a user asks you to do something, always create a backlog task first. Never start implementation without a task.**

```bash
# User says "add dark mode support" — do this FIRST:
backlog task create "Add dark mode support" \
  -d "Why and what the feature is" \
  --ac "Toggle in nav switches between light and dark" \
  --ac "Preference persisted to localStorage" \
  -l frontend,react

# THEN move to In Progress and start implementing
backlog task edit <new-id> -s "In Progress" -a @yourself
```

This ensures all work is tracked, reviewable, and part of the project history.

---

### Rule 2 — Push to GitHub After Every Task or Issue Creation

**Whenever you create a backlog task OR file a GitHub issue, immediately commit and push so the change is visible to everyone.**

```bash
# After creating a task or filing a bug:
git add -A
git commit -m "backlog: add TASK-<id> <short title>

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
git push origin main
```

**This rule applies to:**
- `backlog task create ...` — any new task, story, feature, or epic
- `backlog task edit ...` — status changes, final summaries, marking Done
- `gh issue create ...` — any GitHub issue filed manually or by a script
- Any batch operations (bulk-assign, sync, etc.) that modify backlog files

**Never leave backlog changes uncommitted.** The backlog lives in `backlog/tasks/` as markdown files — they are source code and must be in git.

---

### Rule 3 — Task Hierarchy: EPIC → Feature → Story → Task

All backlog work uses a four-level hierarchy. Choose the right level for what you're creating:

| Level | ID pattern | What it is | Example |
|-------|-----------|------------|---------|
| **EPIC** | `TASK-N` | Large theme of work, weeks/months | "Conference & Track Management" |
| **Feature** | `TASK-N.N` | Shippable capability, days/week | "Conference CRUD API" |
| **Story** | `TASK-N.N.N` | User-facing slice of a feature, hours/day | "Paginated conference list endpoint" |
| **Task** | `TASK-N.N.N.N` | Concrete implementation step, < 1 day | "Add index on Conference.StartDate" |

**When to create each level:**
- **EPIC**: User requests a major new domain (e.g., "add payment processing")
- **Feature**: A distinct, deployable piece within an EPIC (e.g., "Stripe integration API")
- **Story**: A user-visible slice within a Feature (e.g., "Checkout page")
- **Task**: A single technical step too small for a Story on its own

**Parent task convention:** Use `-p <parentId>` to link subtasks:
```bash
backlog task create "Add Stripe webhook handler" -p 7.2  # Story under Feature 7.2
```

---

## What is the Orchestrator?

The Orchestrator analyzes task properties and automatically recommends the best-suited agent for each task. It manages assignments, tracks progress, and suggests reassignments when tasks become stalled or blocked.

**Key capabilities:**
- 🧠 **Intelligent Analysis**: Scores tasks against agent specialties, keywords, and complexity
- 📋 **Assignment Management**: Assign individual tasks or bulk-assign all pending tasks
- 📊 **Progress Tracking**: Monitor task flow and detect stalled work
- 🔄 **Reassignment Suggestions**: Recommend agent changes for blocked/stalled tasks
- 📈 **Performance Metrics**: Track agent completion rates and effectiveness
- 🎯 **Transparent Scoring**: Detailed breakdown of why each agent was recommended

## Quick Start

### Installation

The Orchestrator is already integrated into this backlog.md project. Two CLIs are available:

```bash
# Main orchestrator CLI for task assignment
orchestrator --help

# Monitoring CLI for progress tracking
orchestrator-monitor --help
```

### Common Commands

```bash
# Analyze a task and get agent recommendation
orchestrator assign 7

# Assign to specific agent (override auto-detection)
orchestrator assign 7 --agent code-review

# Auto-assign all "To Do" tasks
orchestrator bulk-assign

# Check assignment status
orchestrator status

# Show detailed task analysis
orchestrator show 7

# List available agents
orchestrator agents

# Scan tasks for status changes and stalled work
orchestrator-monitor scan

# View agent performance metrics
orchestrator-monitor metrics

# Find tasks stalled for 24+ hours
orchestrator-monitor stalled

# Get reassignment suggestions
orchestrator-monitor suggest
```

## Orchestrator CLI Reference

### `orchestrator assign <taskId> [--agent <type>]`

Assign a task to an agent. If `--agent` is omitted, intelligently recommends the best agent.

```bash
# Show recommendation
$ orchestrator assign 1
Analyzing task: Test task for understanding structure

Recommended Agent: EXPLORE
Confidence: 53/100
Rationale: Explore Agent - matches 1 keywords from task title/description; specializes in 1 relevant areas; well-suited for research tasks (score: 35)

Alternative options:
  - general-purpose (20/100)
  - task (19/100)

✓ Task 1 assigned to explore agent
```

**Options:**
- `--agent <type>` - Manually specify agent type (explore, task, code-review, general-purpose)

### `orchestrator bulk-assign [--status <status>]`

Auto-assign all tasks with a given status.

```bash
$ orchestrator bulk-assign
Analyzing all tasks with status: To Do...
  ✓ task-1 → explore
  ✓ task-2 → task
  ✓ task-3 → code-review

✓ Assigned 3 tasks
```

**Options:**
- `--status <status>` - Filter by status (default: "To Do")

### `orchestrator status`

Show current assignments and recent assignment history.

```bash
$ orchestrator status

=== Orchestrator Status ===

Total Assigned Tasks: 3

Current Assignments:
  - task-1: explore
  - task-2: task
  - task-3: code-review

Recent Assignment History:
  - task-1: unassigned → explore (User assignment via CLI)
  - task-2: unassigned → task (Auto-assigned via bulk-assign)
  - task-3: unassigned → code-review (Auto-assigned via bulk-assign)
```

### `orchestrator show <taskId>`

Show detailed task analysis with scoring breakdown.

```bash
$ orchestrator show 7

=== Task Analysis: Fix memory leak in WebSocket handler ===

ID: TASK-7
Status: In Progress
Labels: bug, performance, critical
Assigned Agent: code-review

Recommendation: code-review
Confidence: 80/100
Rationale: Code Review Agent - matches 2 keywords from task title/description; specializes in 2 relevant areas; well-suited for validation tasks (score: 40)

Detailed Scoring:
  Keywords: 2/10 (6 pts)
  Specialties: 2/5 (10 pts)
  Task Type: bugfix (20 pts)
  Complexity: medium (10 pts)

Alternative Agents:
  - general-purpose (65/100)
  - explore (45/100)
```

### `orchestrator agents`

List all available agents and their specialties.

```bash
$ orchestrator agents

=== Available Agents ===

EXPLORE
  Name: Explore Agent
  Description: Fast agent for codebase exploration and understanding
  Complexity: low-to-medium
  Specialties: research, understanding, analysis, codebase questions, investigation

TASK
  Name: Task Agent
  Description: Verbose execution agent for builds, tests, deployments
  Complexity: medium
  Specialties: building, testing, linting, execution, deployments, single-file changes

CODE-REVIEW
  Name: Code Review Agent
  Description: High signal-to-noise code quality and security analysis
  Complexity: medium
  Specialties: code quality, security, logic errors, performance, validation

GENERAL-PURPOSE
  Name: General Purpose Agent
  Description: Full-capability agent for complex multi-step tasks
  Complexity: high
  Specialties: complex workflows, coordination, multi-file changes, refactoring, architecture
```

## Monitor CLI Reference

### `orchestrator-monitor scan`

Scan all tasks and detect status changes, stalled work, and issues.

```bash
$ orchestrator-monitor scan

=== Scanning Tasks ===

Tasks scanned: 15
Issues detected: 2

--- Detected Issues ---

✓ task-5 status changed: To Do → In Progress
  Agent: explore

⚠ task-8 stalled for 36 hours
  Agent: task
  Action: Consider reassigning to different agent or removing blockers

--- Current Metrics ---

Total tracked tasks: 15
Stalled tasks: 1
```

### `orchestrator-monitor metrics`

Show agent performance metrics (completion rates, task counts).

```bash
$ orchestrator-monitor metrics

=== Agent Performance Metrics ===

Agent Completion Rates:

EXPLORE
  Completed: 5
  Assigned: 8
  Completion Rate: 62.5%

TASK
  Completed: 10
  Assigned: 12
  Completion Rate: 83.3%

CODE-REVIEW
  Completed: 3
  Assigned: 5
  Completion Rate: 60.0%

GENERAL-PURPOSE
  Completed: 2
  Assigned: 3
  Completion Rate: 66.7%
```

### `orchestrator-monitor stalled`

Show tasks that haven't progressed in 24+ hours.

```bash
$ orchestrator-monitor stalled

=== Stalled Tasks Report ===

Found 2 stalled task(s):

task-5
  Agent: explore
  Stalled for: 36h
  Last status change: 2026-03-13T20:00:00Z
  Suggested action: orchestrator assign 5 --agent general-purpose

task-8
  Agent: task
  Stalled for: 24h
  Last status change: 2026-03-14T15:30:00Z
  Suggested action: orchestrator assign 8 --agent general-purpose
```

### `orchestrator-monitor suggest`

Get reassignment suggestions for stalled or blocked tasks.

```bash
$ orchestrator-monitor suggest

=== Reassignment Suggestions ===

Found 2 suggestion(s):

task-5
  Reason: Task stalled for 24+ hours
  Current agent: explore
  Suggested agent: general-purpose
  Run: orchestrator assign 5 --agent general-purpose

task-8
  Reason: Task stalled for 24+ hours
  Current agent: task
  Suggested agent: general-purpose
  Run: orchestrator assign 8 --agent general-purpose
```

## Agent Selection Guide

### When to Use Each Agent

#### **Explore Agent**
**Best for:** Research, understanding, investigation, documentation

**Keywords:** understand, analyze, research, explore, investigate, find, search

**Example tasks:**
- "Understand how the authentication flow works"
- "Research best practices for error handling"
- "Document the API architecture"
- "Investigate performance bottlenecks"

#### **Task Agent**
**Best for:** Building, testing, execution, deployments, single-file changes

**Keywords:** build, test, lint, deploy, run, execute, install, compile

**Example tasks:**
- "Run the test suite and fix failures"
- "Deploy to staging environment"
- "Update dependencies and ensure tests pass"
- "Build and publish Docker image"

#### **Code Review Agent**
**Best for:** Code quality, security validation, logic analysis, performance audit

**Keywords:** review, security, audit, validate, verify, quality, vulnerability

**Example tasks:**
- "Security audit of authentication module"
- "Code review for XSS vulnerabilities"
- "Performance analysis of database queries"
- "Validate API endpoint responses"

#### **General Purpose Agent**
**Best for:** Complex multi-step tasks, refactoring, architectural changes, coordination

**Keywords:** refactor, redesign, architect, complex, multi-step, coordinate, integrate

**Example tasks:**
- "Refactor authentication system to use OAuth"
- "Migrate from REST to GraphQL"
- "Restructure codebase for modularity"
- "Coordinate integration between multiple services"

## Scoring Algorithm

The Orchestrator scores each agent on these dimensions:

### 1. **Keyword Matching** (30 pts max)
Counts keyword matches in task title and description against agent specialization keywords.

### 2. **Specialty Matching** (25 pts max)
Checks if task mentions areas the agent specializes in.

### 3. **Task Type Inference** (40 pts max)
Infers task type (research, execution, validation, architecture, bugfix, feature, general) and scores accordingly.

### 4. **Complexity Matching** (15 pts max)
Matches task complexity with agent complexity level.

### 5. **Strong Indicators** (+10 pts each)
Labels like "security", "refactor", "build" strongly indicate specific agents.

**Total possible score: 100+ points**

## Best Practices

### 1. Write Clear Task Titles
Better task analysis depends on clear, specific descriptions:
- ✓ "Fix memory leak in WebSocket handler causing process crash"
- ✗ "Fix bug"

### 2. Use Strategic Labels
Add labels that hint at task type to guide assignment:
- **Research tasks:** Add "research", "understand", "document"
- **Execution tasks:** Add "build", "test", "deploy"
- **Security/Quality:** Add "security", "review", "audit"
- **Architecture:** Add "refactor", "architect", "complex"

### 3. Review Before Auto-Assigning
Always check recommendations, especially for bulk assignments:
```bash
orchestrator show 7  # Review scoring before auto-assigning
orchestrator bulk-assign --status "To Do"  # Check a few samples
```

### 4. Monitor Stalled Tasks
Regularly check for stuck work:
```bash
orchestrator-monitor stalled
orchestrator-monitor suggest  # Get recommendations
```

### 5. Provide Feedback
If orchestrator makes consistently poor choices:
1. Run `orchestrator show <taskId>` to understand scoring
2. Check if task description is clear
3. Add more specific labels
4. Manually override if needed: `orchestrator assign <taskId> --agent <type>`

## Assignment Metadata Storage

Assignments are stored in `.orchestrator-metadata.json` (gitignored):

```json
{
  "assignments": {
    "1": "explore",
    "2": "task",
    "7": "code-review"
  },
  "history": [
    {
      "taskId": "1",
      "oldAgent": null,
      "newAgent": "explore",
      "timestamp": "2026-03-14T19:55:00Z",
      "reason": "User assignment via CLI"
    }
  ],
  "config": {
    "autoReassign": true,
    "reassignThresholdMs": 3600000
  }
}
```

Task progress is tracked in `.orchestrator-monitor.json`:

```json
{
  "taskProgress": {
    "1": {
      "lastStatus": "To Do",
      "lastStatusChange": "2026-03-14T19:55:00Z",
      "agent": "explore",
      "updatedAt": "2026-03-14T20:00:00Z"
    }
  },
  "agentMetrics": {
    "explore": {
      "tasksCompleted": 5,
      "tasksAssigned": 8,
      "avgCompletionTime": 3600000
    }
  },
  "stalledTasks": []
}
```

## Integration with Backlog.md

The Orchestrator works alongside backlog.md CLI:

```bash
# Create task
backlog task create "Fix memory leak" -d "WebSocket handler" --label bug

# Orchestrator assigns agent
orchestrator assign 1
# → Recommends code-review agent

# Work on task
backlog task edit 1 -s "In Progress" -a @myself
backlog task edit 1 --append-notes "Found leak in connection pooling"

# Monitor progress
orchestrator-monitor scan

# Complete task
backlog task edit 1 -s Done --final-summary "Fixed connection leak"
backlog task edit 1 --check-dod 1 --check-dod 2

# View metrics
orchestrator-monitor metrics
```

## Troubleshooting

### Task Gets Wrong Agent

1. **Check detailed scoring:**
   ```bash
   orchestrator show <taskId>
   ```

2. **Improve task description:** Make title/description more specific

3. **Add labels:** Use targeted labels to guide assignment
   ```bash
   backlog task edit <taskId> --label security,audit
   ```

4. **Manual override:** Assign to correct agent explicitly
   ```bash
   orchestrator assign <taskId> --agent code-review
   ```

### No Assignments Generated

- Task title/description is too vague
- No keyword matches found
- Check `orchestrator agents` to see specialization keywords
- Add more descriptive labels to task

### Monitor Shows No Data

- Monitor needs at least one `orchestrator-monitor scan` to initialize
- Run `orchestrator-monitor scan` first
- Then use `orchestrator-monitor metrics` or `orchestrator-monitor stalled`

## Configuration

Edit `backlog.json` to customize orchestrator behavior:

```json
{
  "orchestrator": {
    "autoReassign": true,
    "reassignThresholdMs": 3600000,
    "minimumConfidenceForAutoAssign": 60,
    "enableMonitoring": true
  }
}
```

**Options:**
- `autoReassign`: Auto-suggest reassignments for stalled tasks
- `reassignThresholdMs`: How long (ms) before a task is considered stalled (default: 1 hour)
- `minimumConfidenceForAutoAssign`: Only auto-assign if confidence ≥ this score (0-100)
- `enableMonitoring`: Enable automated progress tracking

## File Structure

```
backlog.md/
├── src/
│   ├── orchestrator.js              # Core orchestrator logic
│   ├── orchestrator-cli.js          # Assignment CLI
│   ├── orchestrator-monitor.js      # Progress tracking
│   └── orchestrator-monitor-cli.js  # Monitor CLI
├── .github/
│   └── ORCHESTRATOR.md              # Detailed agent instructions
├── backlog/
│   ├── tasks/                       # Task files
│   ├── .orchestrator-metadata.json  # Assignment storage
│   └── .orchestrator-monitor.json   # Progress tracking
└── package.json                     # CLI configuration
```

## API Reference (for integrations)

```javascript
const { Orchestrator } = require('./src/orchestrator');

const orch = new Orchestrator();

// Analyze task
const analysis = orch.analyzeTask({
  title: "Fix memory leak",
  description: "WebSocket handler",
  labels: ["bug", "performance"]
});
// → {agentType, confidence, rationale, alternativeAgents}

// Assign task
orch.assignTask("7", "code-review", "Manual assignment");

// Get status
orch.getStatus();
// → {totalTasks, assignments, recentHistory, config}

// Get history
orch.getHistory(50);
```

## Future Enhancements

- ML-based agent selection (learn from past assignments)
- Agent availability/capacity tracking
- Task dependency orchestration (handle agent handoff for dependent tasks)
- Slack/GitHub notifications for assignments
- Per-agent concurrency limits
- Custom agent profile definitions
- Web dashboard for assignment visualization
- Integration with GitHub Actions for automatic assignment

## Contributing

To extend the Orchestrator:

1. **Add new agent type:** Update `AGENT_PROFILES` in `src/orchestrator.js`
2. **Improve scoring algorithm:** Modify `scoreAgent()` method
3. **Add new CLI commands:** Update `src/orchestrator-cli.js`
4. **Enhance monitoring:** Extend `src/orchestrator-monitor.js`

## License

MIT
