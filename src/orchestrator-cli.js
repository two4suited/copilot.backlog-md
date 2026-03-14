#!/usr/bin/env node

/**
 * Orchestrator CLI - Backlog.md Task Assignment Command
 * 
 * Provides CLI interface to orchestrator agent functionality
 */

const path = require("path");
const fs = require("fs");
const { Orchestrator, AGENT_TYPES, AGENT_PROFILES } = require("./orchestrator");

const projectRoot = process.cwd();
const orchestrator = new Orchestrator(projectRoot);

/**
 * Parse command line arguments
 */
function parseArgs(args) {
  const cmd = args[0];
  const params = {};

  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].substring(2);
      params[key] = args[i + 1] || true;
      if (args[i + 1] && !args[i + 1].startsWith("--")) {
        i++;
      }
    }
  }

  return { cmd, params };
}

/**
 * Load task by ID from backlog.md
 */
function loadTask(taskId) {
  try {
    // Try to find task file
    const tasksDir = path.join(projectRoot, "backlog", "tasks");
    const files = fs.readdirSync(tasksDir);
    const taskFile = files.find((f) =>
      f.toLowerCase().includes(`task-${taskId.toLowerCase()}`)
    );

    if (!taskFile) {
      console.error(`Error: Task ${taskId} not found`);
      process.exit(1);
    }

    const content = fs.readFileSync(path.join(tasksDir, taskFile), "utf8");

    // Parse YAML frontmatter (simple parser)
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      console.error(`Error: Invalid task format for ${taskId}`);
      process.exit(1);
    }

    const frontmatter = {};
    frontmatterMatch[1].split("\n").forEach((line) => {
      const [key, ...valueParts] = line.split(":");
      if (key && valueParts.length > 0) {
        let value = valueParts.join(":").trim();
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        frontmatter[key.trim()] = value;
      }
    });

    return {
      id: frontmatter.id || `task-${taskId}`,
      title: frontmatter.title || "Unknown",
      description: frontmatter.description || "",
      status: frontmatter.status || "To Do",
      labels: frontmatter.labels ? frontmatter.labels.split(",").map((l) => l.trim()) : [],
      filePath: path.join(tasksDir, taskFile),
      content: content,
    };
  } catch (error) {
    console.error(`Error loading task: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Assign task command
 */
function cmdAssign(params) {
  const taskId = params._?.[0];
  if (!taskId) {
    console.error("Usage: orchestrator assign <taskId> [--agent <agentType>]");
    process.exit(1);
  }

  const task = loadTask(taskId);
  let agentType = params.agent;

  if (!agentType) {
    // Use intelligent matching
    const analysis = orchestrator.analyzeTask(task);
    agentType = analysis.agentType;

    console.log(
      `\nAnalyzing task: ${task.title}`
    );
    console.log(`\nRecommended Agent: ${agentType.toUpperCase()}`);
    console.log(`Confidence: ${analysis.confidence}/100`);
    console.log(`Rationale: ${analysis.rationale}`);

    if (analysis.alternativeAgents.length > 0) {
      console.log("\nAlternative options:");
      analysis.alternativeAgents.forEach((alt) => {
        console.log(`  - ${alt.agent} (${alt.score}/100)`);
      });
    }
  }

  // Validate agent type
  if (!Object.values(AGENT_TYPES).includes(agentType)) {
    console.error(`Invalid agent type: ${agentType}`);
    console.error(`Valid types: ${Object.values(AGENT_TYPES).join(", ")}`);
    process.exit(1);
  }

  const result = orchestrator.assignTask(taskId, agentType, "User assignment via CLI");
  console.log(`\n✓ Task ${taskId} assigned to ${agentType} agent`);
}

/**
 * Bulk assign command
 */
function cmdBulkAssign(params) {
  const status = params.status || "To Do";
  console.log(`Analyzing all tasks with status: ${status}...`);

  const tasksDir = path.join(projectRoot, "backlog", "tasks");
  const files = fs.readdirSync(tasksDir);

  let assigned = 0;
  files.forEach((file) => {
    try {
      const content = fs.readFileSync(path.join(tasksDir, file), "utf8");
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

      if (!frontmatterMatch) return;

      const taskStatus = content.match(/status:\s*(.+)/)?.[1]?.trim() || "To Do";
      if (taskStatus !== status) return;

      const titleMatch = content.match(/title:\s*(.+)/)?.[1]?.trim() || "";
      const idMatch = file.match(/task-(\d+)/);
      const taskId = idMatch ? idMatch[1] : null;

      if (!taskId) return;

      const task = {
        id: taskId,
        title: titleMatch,
        status: taskStatus,
        labels: [],
      };

      const analysis = orchestrator.analyzeTask(task);
      orchestrator.assignTask(taskId, analysis.agentType, "Auto-assigned via bulk-assign");
      assigned++;

      console.log(`  ✓ task-${taskId} → ${analysis.agentType}`);
    } catch (error) {
      // Skip files with parsing errors
    }
  });

  console.log(`\n✓ Assigned ${assigned} tasks`);
}

/**
 * Status command
 */
function cmdStatus() {
  const status = orchestrator.getStatus();
  console.log("\n=== Orchestrator Status ===\n");
  console.log(`Total Assigned Tasks: ${status.totalTasks}`);

  if (status.totalTasks > 0) {
    console.log("\nCurrent Assignments:");
    Object.entries(status.assignments).forEach(([taskId, agent]) => {
      console.log(`  - task-${taskId}: ${agent}`);
    });
  }

  if (status.recentHistory.length > 0) {
    console.log("\nRecent Assignment History:");
    status.recentHistory.slice(-5).forEach((entry) => {
      const oldAgent = entry.oldAgent || "unassigned";
      console.log(
        `  - task-${entry.taskId}: ${oldAgent} → ${entry.newAgent} (${entry.reason})`
      );
    });
  }
}

/**
 * Show command
 */
function cmdShow(params) {
  const taskId = params._?.[0];
  if (!taskId) {
    console.error("Usage: orchestrator show <taskId>");
    process.exit(1);
  }

  const task = loadTask(taskId);
  const assignment = orchestrator.getAssignment(taskId);

  console.log(`\n=== Task Analysis: ${task.title} ===\n`);
  console.log(`ID: ${task.id}`);
  console.log(`Status: ${task.status}`);
  console.log(`Labels: ${task.labels.join(", ") || "none"}`);

  if (assignment) {
    console.log(`Assigned Agent: ${assignment}`);
  } else {
    console.log("Assigned Agent: unassigned");
  }

  // Run analysis
  const analysis = orchestrator.analyzeTask(task);
  console.log(`\nRecommendation: ${analysis.agentType}`);
  console.log(`Confidence: ${analysis.confidence}/100`);
  console.log(`Rationale: ${analysis.rationale}`);

  console.log("\nDetailed Scoring:");
  const reasoning = analysis.reasoning;
  console.log(`  Keywords: ${reasoning.keywords.matches}/${reasoning.keywords.possible} (${Math.round(reasoning.keywords.score)} pts)`);
  console.log(
    `  Specialties: ${reasoning.specialties.matches}/${reasoning.specialties.possible} (${Math.round(reasoning.specialties.score)} pts)`
  );
  console.log(
    `  Task Type: ${reasoning.taskType.inferred} (${reasoning.taskType.score} pts)`
  );
  console.log(
    `  Complexity: ${reasoning.complexity.profileComplexity} (${reasoning.complexity.score} pts)`
  );

  if (analysis.alternativeAgents.length > 0) {
    console.log("\nAlternative Agents:");
    analysis.alternativeAgents.forEach((alt) => {
      console.log(`  - ${alt.agent} (${alt.score}/100)`);
    });
  }
}

/**
 * List agents command
 */
function cmdListAgents() {
  console.log("\n=== Available Agents ===\n");

  Object.entries(AGENT_PROFILES).forEach(([type, profile]) => {
    console.log(`${type.toUpperCase()}`);
    console.log(`  Name: ${profile.name}`);
    console.log(`  Description: ${profile.description}`);
    console.log(`  Complexity: ${profile.complexity}`);
    console.log(`  Specialties: ${profile.specialties.join(", ")}`);
    console.log();
  });
}

/**
 * Help command
 */
function cmdHelp() {
  console.log(`
Orchestrator CLI - Intelligent Task Assignment

USAGE:
  orchestrator <command> [options]

COMMANDS:
  assign <taskId> [--agent <type>]   Assign task to agent (auto-detect if no agent specified)
  bulk-assign [--status <status>]    Auto-assign all tasks with given status (default: "To Do")
  status                              Show orchestrator status and assignment history
  show <taskId>                        Show task analysis and scoring details
  agents                               List available agents and their specialties
  help                                 Show this help message

AGENT TYPES:
  explore               - Fast exploration & research
  task                  - Build, test, execute
  code-review           - Code quality & security
  general-purpose       - Complex multi-step work
  orchestrator          - Task coordination

EXAMPLES:
  orchestrator assign 1
  orchestrator assign 7 --agent task
  orchestrator bulk-assign
  orchestrator bulk-assign --status "In Progress"
  orchestrator status
  orchestrator show 3
  orchestrator agents
`);
}

// Main entry point
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    cmdHelp();
    return;
  }

  const { cmd, params } = parseArgs(args);

  switch (cmd) {
    case "assign":
      params._ = args.slice(1);
      cmdAssign(params);
      break;
    case "bulk-assign":
      cmdBulkAssign(params);
      break;
    case "status":
      cmdStatus();
      break;
    case "show":
      params._ = args.slice(1);
      cmdShow(params);
      break;
    case "agents":
      cmdListAgents();
      break;
    case "help":
      cmdHelp();
      break;
    default:
      console.error(`Unknown command: ${cmd}\n`);
      cmdHelp();
      process.exit(1);
  }
}

main();
