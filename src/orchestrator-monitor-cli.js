#!/usr/bin/env node

/**
 * Orchestrator Monitor CLI - Task Progress Tracking
 * 
 * Monitors task progress and provides insights into agent performance
 */

const path = require("path");
const { OrchestratorMonitor } = require("./orchestrator-monitor");

const projectRoot = process.cwd();
const monitor = new OrchestratorMonitor(projectRoot);

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
 * Scan command - check for status changes and stalled tasks
 */
function cmdScan() {
  console.log("\n=== Scanning Tasks ===\n");
  const result = monitor.scanTasks();

  console.log(`Tasks scanned: ${result.tasksScanned}`);
  console.log(`Issues detected: ${result.issuesDetected.length}`);

  if (result.issuesDetected.length > 0) {
    console.log("\n--- Detected Issues ---\n");
    result.issuesDetected.forEach((issue) => {
      if (issue.type === "status_change") {
        console.log(
          `✓ task-${issue.taskId} status changed: ${issue.oldStatus} → ${issue.newStatus}`
        );
        console.log(`  Agent: ${issue.agent || "unassigned"}`);
      } else if (issue.type === "stalled_task") {
        console.log(`⚠ task-${issue.taskId} stalled for ${issue.stalledFor}`);
        console.log(`  Agent: ${issue.agent}`);
        console.log(`  Action: ${issue.suggestedAction}`);
      } else if (issue.type === "reassignment_suggestion") {
        console.log(`💡 task-${issue.taskId} - ${issue.reason}`);
        console.log(`  Current: ${issue.currentAgent}`);
        console.log(`  Suggested: ${issue.suggestedAgent}`);
      }
    });
  }

  console.log("\n--- Current Metrics ---\n");
  const metrics = result.state;
  console.log(`Total tracked tasks: ${metrics.totalTrackedTasks}`);
  console.log(`Stalled tasks: ${metrics.stalledTasks}`);

  if (metrics.stalledTasksList.length > 0) {
    console.log("\nStalled tasks details:");
    metrics.stalledTasksList.forEach((task) => {
      console.log(
        `  - task-${task.taskId} (${task.agent}) stalled for ${task.stalledFor}`
      );
    });
  }
}

/**
 * Metrics command - show agent performance
 */
function cmdMetrics() {
  console.log("\n=== Agent Performance Metrics ===\n");
  monitor.scanTasks();
  const metrics = monitor.getMetrics();

  if (Object.keys(metrics.agentMetrics).length === 0) {
    console.log("No agent metrics available yet. Run `orchestrator scan` first.");
    return;
  }

  console.log("Agent Completion Rates:");
  Object.entries(metrics.agentMetrics).forEach(([agent, data]) => {
    console.log(`\n${agent.toUpperCase()}`);
    console.log(`  Completed: ${data.tasksCompleted}`);
    console.log(`  Assigned: ${data.tasksAssigned}`);
    console.log(`  Completion Rate: ${data.completionRate}`);
  });
}

/**
 * Stalled command - show and manage stalled tasks
 */
function cmdStalled() {
  console.log("\n=== Stalled Tasks Report ===\n");
  monitor.scanTasks();
  const stalledReport = monitor.getStalledTasksReport();

  if (stalledReport.length === 0) {
    console.log("No stalled tasks detected. Tasks are progressing normally.");
    return;
  }

  console.log(`Found ${stalledReport.length} stalled task(s):\n`);
  stalledReport.forEach((task) => {
    console.log(`task-${task.taskId}`);
    console.log(`  Agent: ${task.agent}`);
    console.log(`  Stalled for: ${task.stalledFor}`);
    console.log(`  Last status change: ${task.lastStatusChange}`);
    console.log(`  Suggested action: orchestrator assign ${task.taskId} --agent general-purpose`);
    console.log();
  });
}

/**
 * Suggest command - get reassignment suggestions
 */
function cmdSuggest() {
  console.log("\n=== Reassignment Suggestions ===\n");
  monitor.scanTasks();
  const suggestions = monitor.getReassignmentSuggestions();

  if (suggestions.length === 0) {
    console.log("No reassignment suggestions at this time.");
    return;
  }

  console.log(`Found ${suggestions.length} suggestion(s):\n`);
  suggestions.forEach((suggestion) => {
    console.log(`task-${suggestion.taskId}`);
    console.log(`  Reason: ${suggestion.reason}`);
    console.log(`  Current agent: ${suggestion.currentAgent}`);
    console.log(`  Suggested agent: ${suggestion.suggestedAgent}`);
    console.log(`  Run: ${suggestion.action}`);
    console.log();
  });
}

/**
 * Help command
 */
function cmdHelp() {
  console.log(`
Orchestrator Monitor CLI - Task Progress Tracking

USAGE:
  orchestrator-monitor <command> [options]

COMMANDS:
  scan                  Scan all tasks and report status changes/stalled tasks
  metrics               Show agent performance metrics
  stalled               Show tasks stalled for 24+ hours
  suggest               Get reassignment suggestions for stalled/blocked tasks
  help                  Show this help message

EXAMPLES:
  orchestrator-monitor scan
  orchestrator-monitor metrics
  orchestrator-monitor stalled
  orchestrator-monitor suggest
`);
}

// Main entry point
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    cmdHelp();
    return;
  }

  const { cmd } = parseArgs(args);

  switch (cmd) {
    case "scan":
      cmdScan();
      break;
    case "metrics":
      cmdMetrics();
      break;
    case "stalled":
      cmdStalled();
      break;
    case "suggest":
      cmdSuggest();
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
