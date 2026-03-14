# Orchestrator Agent Instructions

## Overview

The **Orchestrator Agent** is responsible for intelligently managing task assignments in backlog.md and coordinating work across other specialized agents (explore, task, code-review, general-purpose).

Think of the Orchestrator as a project manager that:
- Analyzes task properties and assigns them to the most suitable agent type
- Monitors task progress and suggests reassignments when needed
- Manages complex multi-agent workflows
- Maintains a complete audit trail of all assignments

## Core Responsibilities

### 1. Task Analysis & Intelligent Assignment

When assigning a task, analyze:
- **Task Type Inference**: Research, Execution, Validation, Architecture, Bugfix, Feature, or General
- **Keywords & Specialties**: Match task description against agent specialty keywords
- **Complexity Level**: Match task complexity (low-to-medium, medium, high) with agent capabilities
- **Labels & Indicators**: Strong labels that indicate best-fit agent
- **Confidence Score**: Provide confidence rating (0-100) for each recommendation

### 2. Agent Selection Rules

Use these rules to determine best-fit agent:

#### **Explore Agent** (Research & Understanding)
- **Best for**: Codebase questions, research, understanding existing patterns, investigation
- **Triggers**: Keywords like "understand", "analyze", "research", "explore", "investigate", "how does"
- **Example tasks**:
  - "Understand how the authentication flow works"
  - "Research best practices for error handling"
  - "Document the API architecture"

#### **Task Agent** (Build & Execute)
- **Best for**: Building, testing, linting, deployments, single-file changes
- **Triggers**: Keywords like "build", "test", "lint", "deploy", "run", "execute", "install"
- **Example tasks**:
  - "Run the test suite and fix failures"
  - "Deploy to staging environment"
  - "Update dependencies and ensure tests pass"

#### **Code Review Agent** (Quality & Security)
- **Best for**: Code quality analysis, security review, logic validation, performance audit
- **Triggers**: Keywords like "review", "security", "audit", "validate", "verify", "quality"
- **Example tasks**:
  - "Security audit of authentication module"
  - "Code review for XSS vulnerabilities"
  - "Performance analysis of database queries"

#### **General Purpose Agent** (Complex Workflows)
- **Best for**: Complex multi-step tasks, refactoring, architectural changes, coordination
- **Triggers**: Keywords like "refactor", "redesign", "architect", "complex", "multi-step"
- **Example tasks**:
  - "Refactor authentication system to use OAuth"
  - "Migrate from REST to GraphQL"
  - "Restructure codebase for better modularity"

### 3. Workflow: Assigning a Task

When you assign a task:

```bash
orchestrator assign <taskId> [--agent <type>]
```

**Process**:
1. Load task metadata (title, description, labels, status)
2. Infer task type from content
3. Score all available agents against task properties
4. Return top match + alternatives
5. Store assignment in `.orchestrator-metadata.json`
6. Log to assignment history

**Output includes**:
- Selected agent type
- Confidence score (0-100)
- Rationale explaining why this agent was chosen
- Alternative agent recommendations

### 4. Bulk Assignment Workflow

For assigning multiple tasks:

```bash
orchestrator bulk-assign [--status "To Do"]
```

- Scans all tasks with given status
- Auto-assigns each to best-fit agent
- Generates summary report
- Stores all assignments in metadata

### 5. Assignment Metadata Storage

Assignments are stored in two places:

**Primary**: `.orchestrator-metadata.json` (in backlog folder)
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
  ]
}
```

**Optional**: Task markdown sections (for transparency)
- `## Assigned Agent` section shows assigned agent
- `## Agent Instructions` section provides context-specific instructions

### 6. Monitoring & Reassignment

Check assignment status:

```bash
orchestrator status
```

Shows:
- Total assigned tasks
- Current agent assignments
- Recent assignment history
- Last 5 changes

**Suggest reassignments when**:
- Task status becomes "Blocked" (might need different agent)
- Task hasn't progressed in >1 hour (original agent might be stuck)
- New information suggests better-fit agent

### 7. Task Analysis Deep Dive

View detailed scoring for a specific task:

```bash
orchestrator show <taskId>
```

Output includes:
- Task metadata (title, status, labels)
- Current assignment
- Top recommendation + confidence score
- Detailed scoring breakdown:
  - Keyword matches
  - Specialty matches
  - Task type inference
  - Complexity assessment
- Alternative recommendations

## Integration with Backlog.md CLI

### Reading Tasks

```bash
# Load task with orchestrator info
backlog task 7 --plain

# Search for tasks assigned to specific agent
backlog search "assigned_agent:explore"  # (future feature)
```

### Assigning Tasks

Currently, assignments are managed via orchestrator CLI. Future integration will allow:

```bash
# (Future) Assign via backlog task command
backlog task edit 7 --assign-agent explore

# (Future) View assignment in task output
backlog task 7 --plain  # Will show "Assigned Agent: explore"
```

### Task Workflow Integration

When working on a task:

1. **Start**: `backlog task edit <id> -s "In Progress" -a @myself`
2. **Work**: Execute the task (orchestrator recommends best agent)
3. **Check-in**: `backlog task edit <id> --append-notes "Progress update"`
4. **Complete**: `backlog task edit <id> --final-summary "PR description"`

## Implementation Details

### Scoring Algorithm

Each agent is scored on multiple dimensions:

1. **Keyword Matching** (30 points max)
   - Count keyword matches in title/description
   - Each agent has specialization keywords
   - Score = (matches / total_keywords) * 30

2. **Specialty Matching** (25 points max)
   - Count specialty area mentions
   - Each agent has 4-6 specialties
   - Score = (matches / total_specialties) * 25

3. **Task Type Matching** (40 points max)
   - Infer task type (research, execution, validation, etc.)
   - Pre-defined scoring per agent type
   - Direct score based on task type

4. **Complexity Matching** (15 points max)
   - Match task complexity with agent complexity level
   - Rewards well-matched complexity pairs

5. **Strong Indicators** (Variable)
   - Labels like "security", "build", "refactor" strongly indicate agent type
   - Each strong match = +10 points for that agent

### Configuration

Orchestrator behavior can be customized in `backlog.json`:

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

## Agent Selection Examples

### Example 1: Bug Fix Task
```
Title: "Fix memory leak in WebSocket handler"
Description: "Investigate and fix memory leak causing node process to crash after 24h"
Labels: ["bug", "performance", "critical"]

Analysis:
- Task Type: bugfix
- Keywords: bug, fix, memory (matches task agent keywords)
- Suggested: code-review (80/100) - high score for validation
- Alternative: general-purpose (75/100) - for complex architecture changes
- Alternative: explore (45/100) - investigation phase if needed
```

### Example 2: Documentation Task
```
Title: "Document API authentication flow"
Description: "Write comprehensive docs explaining how API authentication works"
Labels: ["documentation", "api"]

Analysis:
- Task Type: research
- Keywords: document (matches explore keywords)
- Suggested: explore (82/100) - strong match for research
- Alternative: general-purpose (35/100)
- Alternative: task (20/100)
```

### Example 3: Refactoring Task
```
Title: "Migrate from Redux to Zustand state management"
Description: "Complete refactor of state management layer, update all stores and components"
Labels: ["refactor", "architecture"]

Analysis:
- Task Type: architecture
- Keywords: migrate, refactor (matches general-purpose keywords)
- Suggested: general-purpose (85/100) - complex multi-step work
- Alternative: code-review (50/100) - for review phase
- Alternative: task (40/100) - for individual store updates
```

## Command Reference

```bash
# Show help
orchestrator help

# Assign task (auto-detect)
orchestrator assign 1
orchestrator assign 1  # Shows recommendation + alternatives

# Assign to specific agent
orchestrator assign 1 --agent task

# Bulk assign all "To Do" tasks
orchestrator bulk-assign
orchestrator bulk-assign --status "In Progress"

# Check status
orchestrator status

# Analyze specific task
orchestrator show 1

# List all agents
orchestrator agents
```

## Troubleshooting

### Task Gets Wrong Agent

If a task is frequently reassigned to different agents:
1. Run `orchestrator show <taskId>` to see scoring details
2. Check if task title/description is clear and specific
3. Add explicit labels to guide assignment (e.g., "security", "refactor", "test")
4. Manually override with `orchestrator assign <taskId> --agent <type>`

### No Assignments Generated

Possible causes:
1. Task title/description is too vague
2. No keyword matches found
3. Check `orchestrator agents` to see specialization keywords
4. Add more descriptive labels to task

### Assignment History Seems Wrong

- Check `orchestrator status` to see recent changes
- View `.orchestrator-metadata.json` for complete history
- Look at timestamps to understand reassignment flow

## Best Practices

1. **Clear Task Titles**: Use specific, descriptive titles for better analysis
   - ✓ "Fix authentication token expiration bug in WebSocket handler"
   - ✗ "Fix bug"

2. **Use Labels**: Add labels that hint at task type
   - "research", "understand", "document" → explore
   - "build", "test", "deploy" → task
   - "security", "review", "audit" → code-review
   - "refactor", "architect" → general-purpose

3. **Review Assignments**: Always check recommendations before auto-assigning bulk tasks

4. **Provide Feedback**: If orchestrator makes poor choices, manually override and check `orchestrator show` to understand scoring

5. **Keep Descriptions Updated**: As task understanding evolves, update description to guide orchestrator

## Future Enhancements

- ML-based agent selection (learn from past assignments)
- Agent performance metrics (track which agents complete tasks fastest)
- Task dependency orchestration (coordinate agent handoff for dependent tasks)
- Slack/GitHub integration (notify agents of new assignments)
- Per-agent concurrency limits (prevent overloading specific agents)
- Custom agent profiles (teams can define their own agent types)
