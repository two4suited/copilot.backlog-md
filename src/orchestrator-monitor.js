/**
 * Orchestrator Monitoring Module
 * 
 * Tracks task progress and suggests reassignments based on task status changes.
 * Provides insights into agent performance and task flow.
 */

const fs = require("fs");
const path = require("path");
const { Orchestrator } = require("./orchestrator");

/**
 * Monitor class for tracking task progress and agent performance
 */
class OrchestratorMonitor {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.orchestrator = new Orchestrator(projectRoot);
    this.backlogDir = path.join(projectRoot, "backlog");
    this.monitorStateFile = path.join(this.backlogDir, ".orchestrator-monitor.json");
    this.state = this.loadState();
  }

  /**
   * Load monitoring state
   */
  loadState() {
    try {
      if (fs.existsSync(this.monitorStateFile)) {
        return JSON.parse(fs.readFileSync(this.monitorStateFile, "utf8"));
      }
    } catch (error) {
      console.warn(`Warning: Could not load monitor state: ${error.message}`);
    }

    return {
      taskProgress: {}, // taskId -> {lastStatus, lastStatusChange, agent}
      agentMetrics: {}, // agent -> {tasksCompleted, tasksAssigned, avgCompletionTime}
      stalledTasks: [], // Tasks not progressing
      reassignmentSuggestions: [], // {taskId, reason, suggestedAgent}
    };
  }

  /**
   * Save monitoring state
   */
  saveState() {
    try {
      fs.writeFileSync(this.monitorStateFile, JSON.stringify(this.state, null, 2), "utf8");
    } catch (error) {
      console.error(`Error saving monitor state: ${error.message}`);
    }
  }

  /**
   * Scan all tasks and check for status changes and stalled tasks
   */
  scanTasks() {
    const tasksDir = path.join(this.projectRoot, "backlog", "tasks");
    const completedDir = path.join(this.projectRoot, "backlog", "completed");

    const tasks = [];
    const reportedIssues = [];

    // Scan active tasks
    if (fs.existsSync(tasksDir)) {
      const files = fs.readdirSync(tasksDir);
      files.forEach((file) => {
        const task = this.parseTaskFile(path.join(tasksDir, file), file);
        if (task) {
          tasks.push({ ...task, location: "active" });
        }
      });
    }

    // Scan completed tasks
    if (fs.existsSync(completedDir)) {
      const files = fs.readdirSync(completedDir);
      files.forEach((file) => {
        const task = this.parseTaskFile(path.join(completedDir, file), file);
        if (task) {
          tasks.push({ ...task, location: "completed" });
        }
      });
    }

    // Update progress tracking and detect changes
    tasks.forEach((task) => {
      const taskId = task.id;
      const previousState = this.state.taskProgress[taskId];

      // Detect status change
      if (previousState && previousState.lastStatus !== task.status) {
        const agent = this.orchestrator.getAssignment(taskId);
        reportedIssues.push({
          type: "status_change",
          taskId,
          oldStatus: previousState.lastStatus,
          newStatus: task.status,
          agent,
          timestamp: new Date().toISOString(),
        });

        // Task moved to Done - update agent metrics
        if (task.status === "Done" && previousState.lastStatus !== "Done") {
          this.recordTaskCompletion(taskId, agent);
        }
      }

      // Update progress state
      this.state.taskProgress[taskId] = {
        lastStatus: task.status,
        lastStatusChange: previousState?.lastStatusChange || new Date().toISOString(),
        agent: this.orchestrator.getAssignment(taskId),
        updatedAt: new Date().toISOString(),
      };
    });

    // Detect stalled tasks (no status change in >24h while "In Progress")
    const now = Date.now();
    const stallThreshold = 24 * 60 * 60 * 1000; // 24 hours

    tasks.forEach((task) => {
      if (task.status === "In Progress") {
        const progressState = this.state.taskProgress[task.id];
        const lastChangeTime = new Date(progressState.lastStatusChange).getTime();
        const timeSinceChange = now - lastChangeTime;

        if (timeSinceChange > stallThreshold) {
          const agent = this.orchestrator.getAssignment(task.id);
          if (!this.state.stalledTasks.includes(task.id)) {
            this.state.stalledTasks.push(task.id);
            reportedIssues.push({
              type: "stalled_task",
              taskId: task.id,
              stalledFor: Math.round(timeSinceChange / (60 * 60 * 1000)) + " hours",
              agent,
              suggestedAction: "Consider reassigning to different agent or removing blockers",
            });
          }
        }
      } else {
        // Remove from stalled list if status changed
        const stalledIndex = this.state.stalledTasks.indexOf(task.id);
        if (stalledIndex > -1) {
          this.state.stalledTasks.splice(stalledIndex, 1);
        }
      }
    });

    // Check for blocked tasks and suggest reassignment
    tasks.forEach((task) => {
      if (task.status === "Blocked") {
        const agent = this.orchestrator.getAssignment(task.id);
        // Suggest escalation to general-purpose for complex unblocking
        if (agent !== "general-purpose") {
          reportedIssues.push({
            type: "reassignment_suggestion",
            taskId: task.id,
            reason: "Task is blocked - may need general-purpose agent for complex resolution",
            currentAgent: agent,
            suggestedAgent: "general-purpose",
          });
        }
      }
    });

    this.saveState();

    return {
      tasksScanned: tasks.length,
      issuesDetected: reportedIssues,
      state: this.getMetrics(),
    };
  }

  /**
   * Parse task file and extract metadata
   */
  parseTaskFile(filePath, fileName) {
    try {
      const content = fs.readFileSync(filePath, "utf8");

      // Extract frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!frontmatterMatch) return null;

      const taskId = fileName.match(/task-(\d+)/)?.[1];
      if (!taskId) return null;

      // Parse frontmatter
      let status = "To Do";
      let title = "Unknown";

      frontmatterMatch[1].split("\n").forEach((line) => {
        if (line.startsWith("status:")) {
          status = line.substring("status:".length).trim();
          // Remove quotes if present
          if ((status.startsWith('"') && status.endsWith('"')) ||
              (status.startsWith("'") && status.endsWith("'"))) {
            status = status.slice(1, -1);
          }
        }
        if (line.startsWith("title:")) {
          title = line.substring("title:".length).trim();
          if ((title.startsWith('"') && title.endsWith('"')) ||
              (title.startsWith("'") && title.endsWith("'"))) {
            title = title.slice(1, -1);
          }
        }
      });

      return {
        id: taskId,
        title,
        status,
        filePath,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Record task completion for metrics
   */
  recordTaskCompletion(taskId, agent) {
    if (!agent) return;

    if (!this.state.agentMetrics[agent]) {
      this.state.agentMetrics[agent] = {
        tasksCompleted: 0,
        tasksAssigned: 0,
        avgCompletionTime: 0,
      };
    }

    this.state.agentMetrics[agent].tasksCompleted++;
  }

  /**
   * Get agent performance metrics
   */
  getAgentMetrics() {
    const metrics = {};

    Object.entries(this.state.agentMetrics).forEach(([agent, data]) => {
      const completionRate = data.tasksAssigned > 0
        ? (data.tasksCompleted / data.tasksAssigned * 100).toFixed(1)
        : 0;

      metrics[agent] = {
        tasksCompleted: data.tasksCompleted,
        tasksAssigned: data.tasksAssigned,
        completionRate: `${completionRate}%`,
      };
    });

    return metrics;
  }

  /**
   * Get stalled tasks report
   */
  getStalledTasksReport() {
    const stalledReport = [];

    this.state.stalledTasks.forEach((taskId) => {
      const progressState = this.state.taskProgress[taskId];
      const agent = progressState?.agent || "unassigned";
      const timeSinceChange = Date.now() - new Date(progressState.lastStatusChange).getTime();
      const hours = Math.round(timeSinceChange / (60 * 60 * 1000));

      stalledReport.push({
        taskId,
        agent,
        stalledFor: `${hours}h`,
        lastStatusChange: progressState.lastStatusChange,
      });
    });

    return stalledReport;
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    return {
      totalTrackedTasks: Object.keys(this.state.taskProgress).length,
      stalledTasks: this.state.stalledTasks.length,
      agentMetrics: this.getAgentMetrics(),
      stalledTasksList: this.getStalledTasksReport(),
    };
  }

  /**
   * Suggest reassignments for stalled or blocked tasks
   */
  getReassignmentSuggestions() {
    const suggestions = [];

    // Check stalled tasks
    this.state.stalledTasks.forEach((taskId) => {
      const agent = this.orchestrator.getAssignment(taskId);
      suggestions.push({
        taskId,
        reason: "Task stalled for 24+ hours",
        currentAgent: agent,
        suggestedAgent: "general-purpose",
        action: `orchestrator assign ${taskId} --agent general-purpose`,
      });
    });

    return suggestions;
  }
}

module.exports = {
  OrchestratorMonitor,
};
