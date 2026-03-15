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
function cmdListAgents(params = {}) {
  const skillsOnly = params["skills-only"];
  const genericOnly = params["generic-only"];

  const skillAgents = ["react-developer", "dotnet-developer", "database-developer", "aspire-expert", "designer"];
  const genericAgents = ["explore", "task", "code-review", "general-purpose", "orchestrator"];

  const printAgent = ([type, profile]) => {
    console.log(`\x1b[1m${type}\x1b[0m`);
    console.log(`  Name:        ${profile.name}`);
    console.log(`  Description: ${profile.description}`);
    console.log(`  Complexity:  ${profile.complexity}`);
    console.log(`  Skill tags:  ${profile.skillLabels && profile.skillLabels.length ? profile.skillLabels.join(", ") : "—"}`);
    console.log(`  Specialties: ${profile.specialties.slice(0, 5).join(", ")}${profile.specialties.length > 5 ? "…" : ""}`);
    console.log();
  };

  if (!genericOnly) {
    console.log("\n━━━ Skill-Based Agents ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    Object.entries(AGENT_PROFILES)
      .filter(([t]) => skillAgents.includes(t))
      .forEach(printAgent);
  }

  if (!skillsOnly) {
    console.log("━━━ Generic Copilot Agents ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    Object.entries(AGENT_PROFILES)
      .filter(([t]) => genericAgents.includes(t))
      .forEach(printAgent);
  }
}

/**
 * Tag-and-assign: read all tasks, match labels to skill agents, assign
 */
function cmdTagTasks(params) {
  const dryRun = params["dry-run"] || false;
  const tasksDir = path.join(projectRoot, "backlog", "tasks");

  if (!fs.existsSync(tasksDir)) {
    console.error("No backlog/tasks directory found.");
    process.exit(1);
  }

  // Label → preferred skill agent mapping
  const labelToAgent = {
    "aspire": "aspire-expert",
    "infrastructure": "aspire-expert",
    "observability": "aspire-expert",
    "database": "database-developer",
    "frontend": "react-developer",
    "react": "react-developer",
    "design": "designer",
    "ui": "designer",
    "backend": "dotnet-developer",
    "api": "dotnet-developer",
    "auth": "dotnet-developer",
    "authentication": "dotnet-developer",
    "testing": "tester",
    "qa": "tester",
    "e2e": "tester",
    "devops": "aspire-expert",
  };

  const files = fs.readdirSync(tasksDir).filter(f => f.endsWith(".md"));
  let assigned = 0;

  console.log(`\n${dryRun ? "[DRY RUN] " : ""}Tagging ${files.length} tasks...\n`);

  files.forEach(file => {
    try {
      const content = fs.readFileSync(path.join(tasksDir, file), "utf8");
      const idMatch = file.match(/task-([\d.]+)/i);
      const taskId = idMatch ? idMatch[1] : null;
      if (!taskId) return;

      // Extract labels — handles both inline [a, b] and multiline YAML list
      let labels = [];
      const inlineLabels = content.match(/^labels:\s*\[([^\]]*)\]/m);
      if (inlineLabels) {
        labels = inlineLabels[1].split(",").map(l => l.trim().replace(/['"]/g, "").toLowerCase()).filter(Boolean);
      } else {
        // Multiline list: "labels:\n  - foo\n  - bar"
        const blockMatch = content.match(/^labels:\s*\n((?:\s+-\s+\S.*\n?)+)/m);
        if (blockMatch) {
          labels = blockMatch[1].split("\n")
            .map(l => l.replace(/^\s+-\s+/, "").trim().replace(/['"]/g, "").toLowerCase())
            .filter(Boolean);
        }
      }

      // Find first matching agent from labels (in priority order)
      let agent = null;
      for (const label of labels) {
        if (labelToAgent[label]) { agent = labelToAgent[label]; break; }
      }

      // Fall back to content-based analysis if no label match
      if (!agent) {
        const { Orchestrator: O } = require("./orchestrator");
        const orch = new O(projectRoot);
        const titleMatch = content.match(/^title:\s*(.+)/m);
        const analysis = orch.analyzeTask({ title: titleMatch?.[1] || "", labels });
        agent = analysis.agentType;
      }

      if (!agent) return;

      if (!dryRun) {
        orchestrator.assignTask(taskId, agent, "Auto-tagged by task labels");
      }
      console.log(`  ${dryRun ? "would assign" : "✓"} task-${taskId} → \x1b[36m${agent}\x1b[0m  (labels: [${labels.join(", ")}])`);
      assigned++;
    } catch (e) {
      // skip unparseable files
    }
  });

  console.log(`\n${dryRun ? "Would assign" : "Assigned"} ${assigned} tasks.`);
}

/**
 * Ralph loop — continuously scan backlog, assign ready tasks, and file bugs
 * Named after the continuous improvement loop concept.
 */
async function cmdRalph(params) {
  const intervalSec = parseInt(params.interval || "10", 10);
  const maxCycles = params.cycles ? parseInt(params.cycles, 10) : Infinity;
  const dryRun = !!params["dry-run"];

  const labelToAgent = {
    aspire: "aspire-expert",
    infrastructure: "github-actions-expert",
    observability: "aspire-expert",
    database: "database-developer",
    frontend: "react-developer",
    react: "react-developer",
    design: "designer",
    ui: "designer",
    backend: "dotnet-developer",
    api: "dotnet-developer",
    auth: "dotnet-developer",
    authentication: "dotnet-developer",
    testing: "tester",
    qa: "tester",
    e2e: "tester",
    devops: "github-actions-expert",
    "github-actions": "github-actions-expert",
    ci: "github-actions-expert",
    workflow: "github-actions-expert",
  };

  const tasksDir = path.join(projectRoot, "backlog", "tasks");
  const stateFile = path.join(projectRoot, "backlog", ".ralph-state.json");

  // Load prior state so we don't re-assign tasks we already handled
  let state = { assigned: {}, bugs: [] };
  if (fs.existsSync(stateFile)) {
    try { state = JSON.parse(fs.readFileSync(stateFile, "utf8")); } catch { /* fresh state */ }
  }

  const saveState = () => fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));

  const ts = () => new Date().toISOString().replace("T", " ").slice(0, 19);
  const log = (msg) => console.log(`\x1b[90m[${ts()}]\x1b[0m ${msg}`);
  const ok  = (msg) => console.log(`\x1b[32m[${ts()}] ✓\x1b[0m ${msg}`);
  const warn = (msg) => console.log(`\x1b[33m[${ts()}] ⚠\x1b[0m ${msg}`);
  const err  = (msg) => console.log(`\x1b[31m[${ts()}] ✗\x1b[0m ${msg}`);

  console.log(`\n\x1b[1m🔄 Ralph loop starting\x1b[0m  (interval: ${intervalSec}s, max cycles: ${maxCycles === Infinity ? "∞" : maxCycles}${dryRun ? ", DRY RUN" : ""})\n`);

  let cycle = 0;

  const runCycle = () => {
    cycle++;
    log(`--- Cycle ${cycle} ---`);

    if (!fs.existsSync(tasksDir)) {
      warn("No backlog/tasks directory. Skipping.");
      return;
    }

    const files = fs.readdirSync(tasksDir).filter(f => f.endsWith(".md"));
    let newAssignments = 0;
    let alreadyActive = 0;
    const issues = [];

    files.forEach(file => {
      try {
        const content = fs.readFileSync(path.join(tasksDir, file), "utf8");
        const idMatch = file.match(/task-([\d.]+)/i);
        const taskId = idMatch ? idMatch[1] : null;
        if (!taskId) return;

        const statusMatch = content.match(/^status:\s*(.+)/m);
        const status = statusMatch ? statusMatch[1].trim().replace(/['"]/g, "") : "To Do";
        const titleMatch = content.match(/^title:\s*(.+)/m);
        const title = titleMatch ? titleMatch[1].trim() : file;
        const assigneeMatch = content.match(/^assignee:\s*\[?([^\]\n]+)\]?/m);
        const assignee = assigneeMatch ? assigneeMatch[1].trim() : "";

        // ── Bug detection ──────────────────────────────────────────────────
        // Tasks stuck In Progress for more than one cycle without progress
        if (status === "In Progress") {
          alreadyActive++;
          const prevSeen = state.assigned[taskId]?.seenInProgress;
          if (prevSeen && (Date.now() - prevSeen) > 5 * 60 * 1000) {
            // Stuck > 5 min — flag it
            const bugMsg = `Task ${taskId} ("${title}") has been In Progress since ${new Date(prevSeen).toISOString()} with no status change.`;
            if (!state.bugs.find(b => b.taskId === taskId && b.type === "stuck")) {
              issues.push({ taskId, title, type: "stuck", message: bugMsg });
            }
          } else if (!prevSeen) {
            state.assigned[taskId] = { ...state.assigned[taskId], seenInProgress: Date.now() };
          }
          return;
        }

        // Clear stuck flag if task moved past In Progress
        if (state.assigned[taskId]?.seenInProgress && status !== "In Progress") {
          delete state.assigned[taskId].seenInProgress;
        }

        // ── Assignment ────────────────────────────────────────────────────
        if (status !== "To Do") return;  // Only assign To Do tasks
        if (state.assigned[taskId]?.assigned) return;  // Already handled

        // Extract labels
        let labels = [];
        const inlineLabels = content.match(/^labels:\s*\[([^\]]*)\]/m);
        if (inlineLabels) {
          labels = inlineLabels[1].split(",").map(l => l.trim().replace(/['"]/g, "").toLowerCase()).filter(Boolean);
        }

        // Find agent
        let agent = null;
        for (const label of labels) {
          if (labelToAgent[label]) { agent = labelToAgent[label]; break; }
        }
        if (!agent) {
          const analysis = orchestrator.analyzeTask({ title, labels });
          agent = analysis.agentType;
        }

        if (!dryRun) {
          orchestrator.assignTask(taskId, agent, `Ralph loop cycle ${cycle}`);
          state.assigned[taskId] = { agent, cycle, assignedAt: new Date().toISOString() };
        }

        ok(`Assigned task-${taskId} → \x1b[36m${agent}\x1b[0m  "${title}"`);
        newAssignments++;
      } catch (e) {
        err(`Failed to process ${file}: ${e.message}`);
      }
    });

    // ── File bugs for detected issues ─────────────────────────────────────
    issues.forEach(issue => {
      if (!dryRun) {
        try {
          const { execSync } = require("child_process");
          const bugTitle = `[BUG] Task ${issue.taskId} stuck in In Progress`;
          const bugDesc = issue.message + "\n\nAuto-filed by Ralph loop.";
          execSync(
            `cd "${projectRoot}" && backlog task create "${bugTitle}" --labels bug,ralph -d "${bugDesc.replace(/"/g, '\\"')}" --priority high`,
            { stdio: "pipe" }
          );
          state.bugs.push({ taskId: issue.taskId, type: issue.type, filedAt: new Date().toISOString() });
          warn(`Filed bug for stuck task-${issue.taskId}`);
        } catch (e) {
          err(`Could not file bug: ${e.message}`);
        }
      } else {
        warn(`[DRY RUN] Would file bug: ${issue.message}`);
      }
    });

    const summary = [];
    if (newAssignments) summary.push(`${newAssignments} assigned`);
    if (alreadyActive) summary.push(`${alreadyActive} active`);
    if (issues.length) summary.push(`${issues.length} bugs filed`);
    if (!summary.length) summary.push("nothing to do");
    log(`Cycle ${cycle} complete — ${summary.join(", ")}\n`);

    if (!dryRun) {
      saveState();
      // Auto-push if anything changed
      if (newAssignments > 0 || issues.length > 0) {
        gitPush(log);
      }
    }

    // ── CI monitoring — check GitHub Actions on every cycle ───────────────
    const ciBugs = checkCIAndFileBugs(state, saveState, log, ok, warn, err, dryRun);
    if (ciBugs > 0 && !dryRun) gitPush(log);
  };

  // Run first cycle immediately
  runCycle();
  if (cycle >= maxCycles) return;

  // Then loop
  const handle = setInterval(() => {
    runCycle();
    if (cycle >= maxCycles) {
      clearInterval(handle);
      log("Max cycles reached — Ralph loop stopping.");
    }
  }, intervalSec * 1000);

  // Graceful shutdown
  process.on("SIGINT", () => {
    clearInterval(handle);
    console.log("\n\x1b[1mRalph loop stopped.\x1b[0m");
    process.exit(0);
  });
}

/**
 * Check GitHub Actions for recent failures and file bug tasks.
 * Deduplication by run ID stored in ralph state.
 */
function checkCIAndFileBugs(state, saveState, log, ok, warn, err, dryRun) {
  const { execSync } = require("child_process");
  try {
    const runsJson = execSync(
      "gh run list --limit 10 --json databaseId,conclusion,name,headBranch,displayTitle,workflowName --repo $(gh repo view --json nameWithOwner -q .nameWithOwner)",
      { cwd: projectRoot, encoding: "utf8", stdio: ["pipe","pipe","pipe"] }
    );
    const runs = JSON.parse(runsJson);

    if (!state.ciChecked) state.ciChecked = {};

    let newBugs = 0;
    for (const run of runs) {
      if (run.conclusion !== "failure") continue;
      const runId = String(run.databaseId);
      if (state.ciChecked[runId]) continue;  // already filed

      // Sanitize title: strip special unicode chars that break shell quoting
      const safeDisplay = run.displayTitle.slice(0, 60)
        .replace(/[^\x20-\x7E]/g, '')   // strip non-ASCII (em-dash, ellipsis, etc.)
        .replace(/"/g, "'")
        .trim();
      const safeWorkflow = run.workflowName.replace(/[^\x20-\x7E]/g, '').replace(/"/g, "'");
      const bugTitle = `[BUG] CI failure: ${safeWorkflow} - ${safeDisplay}`;
      const bugDesc = `GitHub Actions run #${runId} failed. Workflow: ${safeWorkflow}. Branch: ${run.headBranch}. Run URL: https://github.com/two4suited/copilot.backlog-md/actions/runs/${runId}. Investigate with: gh run view ${runId} --log-failed. Auto-filed by Ralph loop.`;

      if (!dryRun) {
        try {
          execSync(
            `cd "${projectRoot}" && backlog task create "${bugTitle}" --labels bug,ci,infrastructure --priority high -d "${bugDesc.replace(/"/g, "'")}" --ac "CI job passes green" --ac "Root cause identified and fixed"`,
            { stdio: "pipe" }
          );
          state.ciChecked[runId] = { filedAt: new Date().toISOString(), title: bugTitle };
          saveState();
          warn(`Filed CI bug for run #${runId}: ${run.workflowName}`);
          newBugs++;
        } catch (e) {
          err(`Could not file CI bug for run #${runId}: ${e.message.split("\n")[0]}`);
        }
      } else {
        warn(`[DRY RUN] Would file CI bug for run #${runId}: ${run.workflowName}`);
        newBugs++;
      }
    }

    if (newBugs === 0) ok("CI check: all recent runs OK (or already filed)");
    return newBugs;
  } catch (e) {
    // gh CLI not available or not authed — skip silently
    warn(`CI check skipped: ${e.message.split("\n")[0]}`);
    return 0;
  }
}

/**
 * Push to remote — used by ralph loop and explicit push command
 */
function gitPush(logFn) {
  const log = logFn || ((msg) => console.log(msg));
  const { execSync } = require("child_process");
  try {
    const status = execSync("git status --porcelain", { cwd: projectRoot, encoding: "utf8" }).trim();
    if (status) {
      // Uncommitted changes — stage and commit backlog metadata before pushing
      execSync("git add backlog/", { cwd: projectRoot, stdio: "pipe" });
      const staged = execSync("git diff --cached --name-only", { cwd: projectRoot, encoding: "utf8" }).trim();
      if (staged) {
        execSync(
          'git commit -m "chore: sync backlog task metadata [ralph]\n\nCo-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"',
          { cwd: projectRoot, stdio: "pipe" }
        );
      }
    }
    execSync("git push", { cwd: projectRoot, stdio: "pipe" });
    log("\x1b[32m↑ Pushed to remote\x1b[0m");
  } catch (e) {
    log(`\x1b[33m⚠ Push failed: ${e.message.split("\n")[0]}\x1b[0m`);
  }
}

/**
 * Explicit push command
 */
function cmdPush() {
  gitPush();
}


/**
 * File a bug task manually
 */
function cmdBug(params) {
  const title = params._?.[0] || params.title;
  if (!title) {
    console.error("Usage: orchestrator bug <title> [--desc <description>] [--task <taskId>] [--priority high|medium|low]");
    process.exit(1);
  }

  const desc = params.desc || params.description || "Bug filed by orchestrator.";
  const priority = params.priority || "high";
  const relatedTask = params.task;

  const fullDesc = relatedTask
    ? `${desc}\n\nRelated task: ${relatedTask}`
    : desc;

  const { execSync } = require("child_process");
  try {
    const result = execSync(
      `cd "${projectRoot}" && backlog task create "${title}" --labels bug,ralph -d "${fullDesc.replace(/"/g, '\\"')}" --priority ${priority}`,
      { encoding: "utf8" }
    );
    console.log(`\n✓ Bug filed: ${title}`);
    if (result) console.log(result.trim());
  } catch (e) {
    console.error("Failed to file bug:", e.message);
    process.exit(1);
  }
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
  push                               Push to remote (commits staged backlog changes first)
  ralph [--interval <sec>] [--cycles <n>] [--dry-run]
                             Continuous loop: assign tasks, detect stuck work, file bugs
  bug <title> [--desc <d>] [--task <id>] [--priority high|medium|low]
                             Manually file a bug task
  assign <taskId> [--agent <type>]   Assign task to agent (auto-detect if no agent specified)
  bulk-assign [--status <status>]    Auto-assign all tasks with given status (default: "To Do")
  tag [--dry-run]                    Tag & assign all tasks by their backlog labels
  status                             Show orchestrator status and assignment history
  show <taskId>                      Show task analysis and scoring details
  agents [--skills-only|--generic-only]  List available agents and their specialties
  help                               Show this help message

SKILL-BASED AGENTS:
  react-developer      - React, TypeScript, Vite, Tailwind, React Query
  dotnet-developer     - ASP.NET Core, C#, EF Core, Web API, JWT
  database-developer   - PostgreSQL, EF Core, migrations, schema design
  aspire-expert        - Aspire AppHost, containers, service discovery, CI/CD
  tester               - Playwright e2e, API testing, bug filing, QA
  designer             - UI/UX, component design, accessibility, Tailwind

GENERIC AGENTS:
  explore              - Fast codebase exploration & research
  task                 - Build, test, execute commands
  code-review          - Code quality & security analysis
  general-purpose      - Complex multi-step work
  orchestrator         - Task coordination & delegation

RALPH LOOP:
  Continuously scans backlog every <interval> seconds.
  - Assigns all "To Do" tasks to their skill agent
  - Detects tasks stuck "In Progress" and auto-files bug reports
  - Persists state in backlog/.ralph-state.json
  - Press Ctrl+C to stop

EXAMPLES:
  orchestrator ralph                      # Run forever (10s interval)
  orchestrator ralph --interval 30        # Check every 30s
  orchestrator ralph --cycles 5 --dry-run # 5 dry-run cycles
  orchestrator bug "Login fails on mobile" --task 4.2 --priority high
  orchestrator tag                        # Assign all tasks by label
  orchestrator tag --dry-run              # Preview assignments without saving
  orchestrator assign 1.1.1               # Auto-detect best agent
  orchestrator assign 1.1.1 --agent aspire-expert
  orchestrator bulk-assign
  orchestrator status
  orchestrator show 1.2
  orchestrator agents --skills-only
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
    case "push":
      cmdPush();
      break;
    case "ralph":
      cmdRalph(params);
      break;
    case "bug":
      params._ = args.slice(1);
      cmdBug(params);
      break;
    case "assign":
      params._ = args.slice(1);
      cmdAssign(params);
      break;
    case "bulk-assign":
      cmdBulkAssign(params);
      break;
    case "tag":
      cmdTagTasks(params);
      break;
    case "status":
      cmdStatus();
      break;
    case "show":
      params._ = args.slice(1);
      cmdShow(params);
      break;
    case "agents":
      cmdListAgents(params);
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
