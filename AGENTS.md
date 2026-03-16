# AGENTS.md — Planet Express Conference App

## Who We Are

The Planet Express crew, reassigned to software delivery. Same ship, different cargo.

## Team Roster

| Character                    | Role                      | Agent file                                  |
| ---------------------------- | ------------------------- | ------------------------------------------- |
| **Turanga Leela** ⭐          | Orchestrator              | `turanga-leela.agent.md`                    |
| Professor Farnsworth          | Aspire/Platform Expert    | `professor-farnsworth.agent.md`             |
| Hermes Conrad                 | Database Developer        | `hermes-conrad.agent.md`                    |
| Kif Kroker                    | .NET Backend Developer    | `kif-kroker.agent.md`                       |
| Philip J. Fry                 | React Frontend Developer  | `philip-j-fry.agent.md`                     |
| Amy Wong                      | Designer                  | `amy-wong.agent.md`                         |
| Bender Bending Rodríguez      | GitHub Actions / DevOps   | `bender-bending-rodriguez.agent.md`         |
| Dr. John Zoidberg             | Tester / QA               | `dr-john-zoidberg.agent.md`                 |

⭐ Leela is the default agent. Start every session with her.

## Constitutional Rules

These rules apply to all agents on the team:

1. **Leela routes all work.** Every request goes to Leela first. Specialists work from a brief, not directly from the user.
2. **No agent commits.** File changes are handed to the scribe (or Leela coordinates a commit) — never via direct git commands in a specialist.
3. **No agent reviews their own output.** Self-review is a sanity check. Approval is Leela's call.
4. **Every discovered task gets filed.** Use `backlog task create` or `issue:create` before context-switching.
5. **No secrets in code.** Credentials, tokens, and connection strings live in environment variables or Aspire resource references only.
6. **Unhappy paths are required.** Tests cover error states, empty states, and validation failures — not just the happy path.

## Where Things Live

```
.github/agents/           # Agent definitions (you are here)
.github/skills/           # Installed skills
.github/workflows/        # CI/CD pipelines
backlog/tasks/            # Backlog.md task files
Sessionize.Api/           # ASP.NET Core Web API
Sessionize.Api.Tests/     # xUnit tests
Sessionize.AppHost/       # .NET Aspire AppHost
Sessionize.Models/        # Shared domain models
frontend/                 # React/TypeScript/Vite frontend
docs/                     # Project documentation
```

## Routing Quick Reference

| "I need to..."                              | Ask...               |
| ------------------------------------------- | -------------------- |
| Build a new API endpoint                    | Kif Kroker           |
| Build a new UI component or page           | Philip J. Fry        |
| Design a new screen or component spec       | Amy Wong             |
| Add or change a database table              | Hermes Conrad        |
| Change Aspire config or deploy to ACA       | Professor Farnsworth |
| Fix or add a CI/CD pipeline                 | Bender               |
| Write or run tests / file a bug             | Dr. Zoidberg         |
| Anything else / not sure                    | Leela (orchestrator) |
