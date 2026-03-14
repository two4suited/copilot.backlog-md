/**
 * Orchestrator Agent Module
 * 
 * Intelligently assigns tasks to Copilot CLI agents based on task properties.
 * Manages agent assignment metadata and tracks multi-agent workflows.
 */

const fs = require("fs");
const path = require("path");

/**
 * Agent type definitions
 */
const AGENT_TYPES = {
  EXPLORE: "explore",
  TASK: "task",
  CODE_REVIEW: "code-review",
  GENERAL_PURPOSE: "general-purpose",
  ORCHESTRATOR: "orchestrator",
  TESTER: "tester",
  // Skill-based agents
  REACT_DEVELOPER: "react-developer",
  DOTNET_DEVELOPER: "dotnet-developer",
  DATABASE_DEVELOPER: "database-developer",
  ASPIRE_EXPERT: "aspire-expert",
  DESIGNER: "designer",
};

/**
 * Agent matching rules and metadata
 */
const AGENT_PROFILES = {
  explore: {
    name: "Explore Agent",
    description: "Fast agent for codebase exploration and understanding",
    specialties: ["research", "understanding", "analysis", "codebase questions", "investigation"],
    keywords: ["understand", "analyze", "research", "explore", "find", "search", "investigate", "how does", "what is", "where is"],
    complexity: "low-to-medium",
    timelinessRequired: false,
    capabilities: ["grep", "glob", "view", "bash"],
    skillLabels: [],
  },
  task: {
    name: "Task Agent",
    description: "Verbose execution agent for builds, tests, deployments",
    specialties: ["building", "testing", "linting", "execution", "deployments", "single-file changes"],
    keywords: ["build", "test", "lint", "deploy", "run", "execute", "install", "setup"],
    complexity: "medium",
    timelinessRequired: false,
    capabilities: ["bash", "all CLI tools"],
    skillLabels: [],
  },
  "code-review": {
    name: "Code Review Agent",
    description: "High signal-to-noise code quality and security analysis",
    specialties: ["code quality", "security", "logic errors", "performance", "validation"],
    keywords: ["review", "security", "quality", "lint", "validate", "audit", "check", "verify"],
    complexity: "medium",
    timelinessRequired: true,
    capabilities: ["bash", "grep", "view"],
    skillLabels: [],
  },
  "general-purpose": {
    name: "General Purpose Agent",
    description: "Full-capability agent for complex multi-step tasks",
    specialties: ["complex workflows", "coordination", "multi-file changes", "refactoring", "architecture"],
    keywords: ["refactor", "redesign", "architect", "complex", "multi-step", "coordinate", "integrate"],
    complexity: "high",
    timelinessRequired: false,
    capabilities: ["all tools", "high-quality reasoning"],
    skillLabels: [],
  },
  orchestrator: {
    name: "Orchestrator Agent",
    description: "Manages task assignments and multi-agent workflows",
    specialties: ["coordination", "assignment", "workflow", "monitoring", "delegation"],
    keywords: ["orchestrate", "manage", "assign", "delegate", "coordinate"],
    complexity: "high",
    timelinessRequired: false,
    capabilities: ["task delegation", "status tracking"],
    skillLabels: ["orchestrator"],
  },

  // ─── Skill-Based Agents ────────────────────────────────────────────────────

  "react-developer": {
    name: "React Developer",
    description: "Expert in React, TypeScript, Vite, Tailwind CSS, React Query, and component architecture",
    specialties: [
      "react components", "typescript", "vite", "tailwind css", "react query",
      "react router", "hooks", "state management", "frontend", "UI components",
      "forms", "responsive design", "spa",
    ],
    keywords: [
      "react", "component", "tsx", "jsx", "vite", "tailwind", "frontend",
      "ui", "page", "form", "hook", "state", "router", "navigation", "layout",
      "responsive", "vitest", "react query",
    ],
    complexity: "medium",
    timelinessRequired: false,
    capabilities: ["TypeScript", "React 18", "Vite", "Tailwind CSS", "React Query", "React Router v6", "Vitest"],
    skillLabels: ["frontend", "react"],
  },

  "dotnet-developer": {
    name: ".NET API Developer",
    description: "Expert in ASP.NET Core, C#, Web API design, Entity Framework Core, and middleware",
    specialties: [
      "asp.net core", "web api", "c#", "rest api", "controllers", "middleware",
      "entity framework", "dependency injection", "validation", "swagger", "openapi",
      "signalr", "jwt", "authentication", "authorization",
    ],
    keywords: [
      "api", "endpoint", "controller", "dotnet", ".net", "csharp", "c#",
      "rest", "http", "backend", "service", "middleware", "swagger", "jwt",
      "signalr", "aspnet", "webapi",
    ],
    complexity: "medium",
    timelinessRequired: false,
    capabilities: [".NET 8", "ASP.NET Core", "C#", "Entity Framework Core", "xUnit", "Swagger/OpenAPI", "SignalR"],
    skillLabels: ["backend", "api"],
  },

  "database-developer": {
    name: "Database Developer",
    description: "Expert in PostgreSQL, Entity Framework Core schema design, migrations, indexing, and query optimisation",
    specialties: [
      "postgresql", "entity framework", "ef core", "migrations", "schema design",
      "indexes", "relationships", "seed data", "query optimisation", "npgsql",
      "database", "dbcontext", "data model",
    ],
    keywords: [
      "database", "postgres", "postgresql", "migration", "schema", "model",
      "dbcontext", "entity", "table", "index", "seed", "npgsql", "ef",
      "relationship", "foreign key",
    ],
    complexity: "medium",
    timelinessRequired: false,
    capabilities: ["PostgreSQL", "EF Core", "Npgsql", "SQL", "Migrations", "Performance tuning"],
    skillLabels: ["database"],
  },

  "aspire-expert": {
    name: "Aspire Expert",
    description: "Expert in .NET Aspire orchestration, AppHost configuration, service discovery, Aspire Dashboard, and deployment pipelines",
    specialties: [
      "aspire", "apphost", "service discovery", "aspire dashboard", "opentelemetry",
      "health checks", "infrastructure as code", "docker", "containers",
      "postgresql container", "aspire hosting", "distributed application",
    ],
    keywords: [
      "aspire", "apphost", "orchestrat", "infrastructure", "container", "dashboard",
      "service discovery", "distributed", "hosting", "pipeline", "deploy", "devops",
      "opentelemetry", "health check",
    ],
    complexity: "high",
    timelinessRequired: false,
    capabilities: ["Aspire.Hosting", "AppHost", "Aspire Dashboard", "OpenTelemetry", "Docker", "CI/CD"],
    skillLabels: ["aspire", "infrastructure", "observability"],
  },

  "tester": {
    name: "Tester",
    description: "Expert in end-to-end testing with Playwright, API testing, bug filing, and quality assurance",
    specialties: [
      "e2e testing", "playwright", "api testing", "regression testing",
      "bug filing", "smoke tests", "integration tests", "test reports",
      "quality assurance", "accessibility testing",
    ],
    keywords: [
      "test", "e2e", "playwright", "regression", "smoke", "bug", "qa",
      "quality", "assert", "verify", "check", "validate", "coverage",
    ],
    complexity: "medium",
    timelinessRequired: true,
    capabilities: ["Playwright", "xUnit", "Vitest", "Bug filing", "Test reporting"],
    skillLabels: ["testing", "qa", "e2e"],
  },

  "designer": {
    name: "Designer",
    description: "Expert in UI/UX design, design systems, Tailwind CSS component design, accessibility, and user flow",
    specialties: [
      "ui design", "ux", "component design", "design system", "accessibility",
      "tailwind", "colour scheme", "typography", "layout", "responsive design",
      "user flow", "wireframe", "figma", "visual hierarchy",
    ],
    keywords: [
      "design", "ui", "ux", "layout", "colour", "color", "style", "theme",
      "accessibility", "a11y", "visual", "typography", "component design",
      "wireframe", "branding", "logo",
    ],
    complexity: "low-to-medium",
    timelinessRequired: false,
    capabilities: ["Tailwind CSS", "Design systems", "Accessibility (WCAG)", "Component design", "User flows"],
    skillLabels: ["design", "ui"],
  },
};

/**
 * Orchestrator class for managing agent assignments
 */
class Orchestrator {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.backlogDir = path.join(projectRoot, "backlog");
    this.tasksDir = path.join(this.backlogDir, "tasks");
    this.metadataFile = path.join(this.backlogDir, ".orchestrator-metadata.json");
    this.metadata = this.loadMetadata();
  }

  /**
   * Load orchestrator metadata from file
   */
  loadMetadata() {
    try {
      if (fs.existsSync(this.metadataFile)) {
        const content = fs.readFileSync(this.metadataFile, "utf8");
        return JSON.parse(content);
      }
    } catch (error) {
      console.warn(`Warning: Could not load orchestrator metadata: ${error.message}`);
    }
    return {
      assignments: {}, // taskId -> agentType
      history: [], // Array of {taskId, oldAgent, newAgent, timestamp, reason}
      config: {
        autoReassign: true,
        reassignThresholdMs: 3600000, // 1 hour
      },
    };
  }

  /**
   * Save orchestrator metadata to file
   */
  saveMetadata() {
    try {
      fs.writeFileSync(this.metadataFile, JSON.stringify(this.metadata, null, 2), "utf8");
    } catch (error) {
      console.error(`Error saving orchestrator metadata: ${error.message}`);
    }
  }

  /**
   * Analyze task properties and recommend an agent type
   * @param {Object} task - Task object from backlog.md
   * @returns {Object} - {agentType, confidence, rationale, alternativeAgents}
   */
  analyzeTask(task) {
    const analysis = {
      agentType: null,
      confidence: 0,
      rationale: "",
      alternativeAgents: [],
      reasoning: {},
    };

    // Extract task properties
    const title = (task.title || "").toLowerCase();
    const description = (task.description || "").toLowerCase();
    const status = task.status || "To Do";
    const labels = (task.labels || []).map((l) => l.toLowerCase());
    const taskType = this.inferTaskType(title, description, labels);

    // Score each agent type
    const scores = {};
    for (const [agentType, profile] of Object.entries(AGENT_PROFILES)) {
      if (agentType === "orchestrator") continue; // Skip orchestrator itself
      scores[agentType] = this.scoreAgent(agentType, profile, title, description, labels, taskType);
    }

    // Sort agents by score
    const sorted = Object.entries(scores)
      .sort((a, b) => b[1].score - a[1].score)
      .map((entry) => ({ agent: entry[0], ...entry[1] }));

    if (sorted.length > 0) {
      const topMatch = sorted[0];
      analysis.agentType = topMatch.agent;
      analysis.confidence = topMatch.score;
      analysis.rationale = topMatch.rationale;
      analysis.reasoning = topMatch.detailedReasoning;
      analysis.alternativeAgents = sorted.slice(1, 3).map((s) => ({
        agent: s.agent,
        score: s.score,
      }));
    }

    return analysis;
  }

  /**
   * Infer task type from title, description, and labels
   */
  inferTaskType(title, description, labels) {
    const combinedText = `${title} ${description} ${labels.join(" ")}`;

    if (
      /research|understand|investigate|explore|analyze|document/.test(
        combinedText
      )
    ) {
      return "research";
    }
    if (
      /test|build|lint|deploy|execute|run|install|compile|transpile/.test(
        combinedText
      )
    ) {
      return "execution";
    }
    if (
      /security|review|audit|vulnerability|validate|check|verify/.test(
        combinedText
      )
    ) {
      return "validation";
    }
    if (
      /refactor|redesign|architect|restructure|simplify|optimize|improve/.test(
        combinedText
      )
    ) {
      return "architecture";
    }
    if (/bug|fix|issue|error|crash|incorrect/.test(combinedText)) {
      return "bugfix";
    }
    if (/feature|add|implement|create|new/.test(combinedText)) {
      return "feature";
    }
    return "general";
  }

  /**
   * Score an agent type for a given task
   */
  scoreAgent(agentType, profile, title, description, labels, taskType) {
    let score = 0;
    const reasoning = {};

    // Keyword matching
    const keywords = profile.keywords;
    const keywordMatches = keywords.filter((kw) =>
      title.includes(kw) || description.includes(kw)
    ).length;
    const keywordScore = (keywordMatches / keywords.length) * 30;
    score += keywordScore;
    reasoning.keywords = {
      matches: keywordMatches,
      possible: keywords.length,
      score: keywordScore,
    };

    // Specialty matching
    const combinedText = `${title} ${description} ${labels.join(" ")}`;
    const specialtyMatches = profile.specialties.filter((spec) =>
      combinedText.includes(spec)
    ).length;
    const specialtyScore = (specialtyMatches / profile.specialties.length) * 25;
    score += specialtyScore;
    reasoning.specialties = {
      matches: specialtyMatches,
      possible: profile.specialties.length,
      score: specialtyScore,
    };

    // Task type matching
    const typeScores = {
      research: { explore: 35, task: 0, "code-review": 5, "general-purpose": 10 },
      execution: { explore: 0, task: 40, "code-review": 0, "general-purpose": 10 },
      validation: { explore: 5, task: 5, "code-review": 40, "general-purpose": 10 },
      architecture: { explore: 10, task: 5, "code-review": 10, "general-purpose": 35 },
      bugfix: { explore: 15, task: 20, "code-review": 20, "general-purpose": 15 },
      feature: { explore: 10, task: 15, "code-review": 5, "general-purpose": 25 },
      general: { explore: 10, task: 10, "code-review": 10, "general-purpose": 15 },
    };
    const typeScore = typeScores[taskType]?.[agentType] || 10;
    score += typeScore;
    reasoning.taskType = {
      inferred: taskType,
      score: typeScore,
    };

    // Complexity matching
    const complexityScores = {
      "low-to-medium": { explore: 10, task: 5, "code-review": 0, "general-purpose": 0 },
      medium: { explore: 5, task: 10, "code-review": 10, "general-purpose": 5 },
      high: { explore: 0, task: 0, "code-review": 10, "general-purpose": 15 },
    };
    const complexityScore = complexityScores[profile.complexity]?.[agentType] || 0;
    score += complexityScore;
    reasoning.complexity = {
      profileComplexity: profile.complexity,
      score: complexityScore,
    };

    // Labels that strongly indicate agent type (from profile skillLabels)
    const strongMatches = (profile.skillLabels || []).filter((ind) =>
      labels.includes(ind)
    ).length;
    const strongScore = strongMatches * 15; // skill-label match is a strong signal
    score += strongScore;
    reasoning.strongIndicators = {
      matches: strongMatches,
      score: strongScore,
    };

    // Penalty for mismatched complexity
    const expectedComplexity = {
      research: "low-to-medium",
      execution: "medium",
      validation: "medium",
      architecture: "high",
      bugfix: "medium",
      feature: "medium",
      general: "medium",
    };
    if (profile.complexity !== expectedComplexity[taskType]) {
      score = Math.max(0, score - 5);
      reasoning.complexityPenalty = 5;
    }

    const rationale = this.generateRationale(agentType, profile, reasoning);

    return {
      score: Math.round(score),
      rationale,
      detailedReasoning: reasoning,
    };
  }

  /**
   * Generate human-readable rationale for agent recommendation
   */
  generateRationale(agentType, profile, reasoning) {
    const reasons = [];

    if (reasoning.keywords.matches > 0) {
      reasons.push(
        `matches ${reasoning.keywords.matches} keywords from task title/description`
      );
    }

    if (reasoning.specialties.matches > 0) {
      reasons.push(`specializes in ${reasoning.specialties.matches} relevant areas`);
    }

    if (reasoning.taskType.score > 15) {
      reasons.push(
        `well-suited for ${reasoning.taskType.inferred} tasks (score: ${reasoning.taskType.score})`
      );
    }

    if (reasoning.strongIndicators.matches > 0) {
      reasons.push(`strong indicators in task labels`);
    }

    return `${profile.name} - ${reasons.join("; ")}`;
  }

  /**
   * Assign a task to an agent
   */
  assignTask(taskId, agentType, reason = "") {
    const oldAgent = this.metadata.assignments[taskId];
    this.metadata.assignments[taskId] = agentType;

    // Log to history
    this.metadata.history.push({
      taskId,
      oldAgent: oldAgent || null,
      newAgent: agentType,
      timestamp: new Date().toISOString(),
      reason,
    });

    // Keep history to last 100 entries
    if (this.metadata.history.length > 100) {
      this.metadata.history = this.metadata.history.slice(-100);
    }

    this.saveMetadata();

    return {
      taskId,
      previousAgent: oldAgent,
      newAgent: agentType,
      assigned: true,
    };
  }

  /**
   * Get assignment for a task
   */
  getAssignment(taskId) {
    return this.metadata.assignments[taskId] || null;
  }

  /**
   * Get all assignments
   */
  getAllAssignments() {
    return this.metadata.assignments;
  }

  /**
   * Get assignment history
   */
  getHistory(limit = 50) {
    return this.metadata.history.slice(-limit);
  }

  /**
   * Clear assignment for a task
   */
  clearAssignment(taskId) {
    delete this.metadata.assignments[taskId];
    this.saveMetadata();
  }

  /**
   * Export orchestrator status as JSON
   */
  getStatus() {
    return {
      totalTasks: Object.keys(this.metadata.assignments).length,
      assignments: this.metadata.assignments,
      recentHistory: this.metadata.history.slice(-10),
      config: this.metadata.config,
    };
  }
}

/**
 * Helper function to parse orchestrator metadata from task markdown
 */
function extractOrchestratorMetadata(taskContent) {
  const metadata = {
    assigned_agent: null,
    agent_instructions: null,
  };

  // Extract "## Assigned Agent" section
  const agentMatch = taskContent.match(
    /## Assigned Agent\s*\n+([^\n]+(?:\n(?!##)[^\n]*)*)/i
  );
  if (agentMatch) {
    metadata.assigned_agent = agentMatch[1].trim();
  }

  // Extract "## Agent Instructions" section
  const instructionsMatch = taskContent.match(
    /## Agent Instructions\s*\n+([^\n]+(?:\n(?!##)[^\n]*)*)/i
  );
  if (instructionsMatch) {
    metadata.agent_instructions = instructionsMatch[1].trim();
  }

  return metadata;
}

/**
 * Helper function to inject orchestrator metadata into task markdown
 */
function injectOrchestratorMetadata(taskContent, assignedAgent, agentInstructions) {
  let updated = taskContent;

  // Remove existing sections if present
  updated = updated.replace(/## Assigned Agent\s*\n+[^\n]+(?:\n(?!##)[^\n]*)*\n*/gi, "");
  updated = updated.replace(/## Agent Instructions\s*\n+[^\n]+(?:\n(?!##)[^\n]*)*\n*/gi, "");

  // Add new sections if provided
  const sections = [];
  if (assignedAgent) {
    sections.push(`## Assigned Agent\n\n${assignedAgent}\n`);
  }
  if (agentInstructions) {
    sections.push(`## Agent Instructions\n\n${agentInstructions}\n`);
  }

  if (sections.length > 0) {
    // Insert before the last section or at the end
    updated += "\n" + sections.join("\n");
  }

  return updated;
}

module.exports = {
  Orchestrator,
  AGENT_TYPES,
  AGENT_PROFILES,
  extractOrchestratorMetadata,
  injectOrchestratorMetadata,
};
