---
name: routing
description: >
  Maps thematic agent names to functional roles. Team roster and routing rules for this repo's agent team. Applied by the orchestrator at session
  start. Scaffolded by `/guild:setup` — edit this file to change who is on the team, what they do,
  and how work gets routed.
license: MIT
metadata:
  version: "0.2"
  asset: /Users/brian/.copilot/installed-plugins/guild/guild/skills/setup/assets/skills/routing/SKILL.md
---

## Team

| Agent                        | Role                      | File                                        | Use for                                                           |
| ---------------------------- | ------------------------- | ------------------------------------------- | ----------------------------------------------------------------- |
| turanga-leela                | Orchestrator              | `turanga-leela.agent.md`                    | Default — orchestrates everything, routes work, tracks decisions  |
| professor-farnsworth         | Aspire/Platform Expert    | `professor-farnsworth.agent.md`             | AppHost config, Aspire wiring, ACA deployment, infra-as-code      |
| hermes-conrad                | Database Developer        | `hermes-conrad.agent.md`                    | EF Core migrations, PostgreSQL schema, indexes, query optimisation|
| kif-kroker                   | .NET Backend Developer    | `kif-kroker.agent.md`                       | ASP.NET Core controllers, services, auth, SignalR, API design     |
| philip-j-fry                 | React Frontend Developer  | `philip-j-fry.agent.md`                     | React components, Vite, Tailwind, React Query, routing            |
| amy-wong                     | Designer                  | `amy-wong.agent.md`                         | UI/UX specs, Tailwind design system, accessibility requirements   |
| bender-bending-rodriguez     | GitHub Actions / DevOps   | `bender-bending-rodriguez.agent.md`         | CI/CD pipelines, workflow debugging, ACA deployment automation    |
| dr-john-zoidberg             | Tester / QA               | `dr-john-zoidberg.agent.md`                 | Playwright E2E, xUnit API tests, bug filing, quality gates        |

---

## Routing Rules

| Pattern                                                                          | Role                                               |
| -------------------------------------------------------------------------------- | -------------------------------------------------- |
| aspire, apphost, service discovery, azure container apps, azd, infra, telemetry  | Aspire/Platform Expert (agent: professor-farnsworth)  |
| migration, schema, database, postgres, sql, index, ef core, entity framework     | Database Developer (agent: hermes-conrad)             |
| controller, service, api, endpoint, dto, auth, jwt, signalr, csharp, dotnet      | .NET Backend Developer (agent: kif-kroker)            |
| react, component, hook, frontend, vite, tailwind, typescript, ui, page, routing  | React Frontend Developer (agent: philip-j-fry)        |
| design, ux, layout, wireframe, colour, spacing, accessibility, tailwind spec     | Designer (agent: amy-wong)                            |
| ci, cd, pipeline, workflow, github actions, deploy, docker, secrets, runner      | GitHub Actions / DevOps (agent: bender-bending-rodriguez) |
| test, spec, playwright, e2e, xunit, bug, qa, regression, coverage                | Tester / QA (agent: dr-john-zoidberg)                 |
| commit, PR, branch, push, git, version control                                   | Orchestrator routes to scribe if present, else Kif   |

---

## SDLC Phases

Map your agents to each phase in the Team table. The orchestrator routes work through these stages.

| Phase         | Responsibility                                                      | When                                                | Agent(s)                                    |
| ------------- | ------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------- |
| **Design**    | Requirements, acceptance criteria, architecture, trade-off analysis | New features, ambiguous requests, significant scope | amy-wong (UI), turanga-leela (architecture) |
| **Implement** | Code, files, configuration, scripts, artifacts                      | Spec is clear; design phase complete or skipped     | kif-kroker, philip-j-fry, hermes-conrad, professor-farnsworth, bender-bending-rodriguez |
| **Verify**    | Tests, linters, builds — automated quality gates                    | After every implementation; never skipped           | dr-john-zoidberg                            |
| **Review**    | Peer validation of output against acceptance criteria               | Behavioral changes, shared-contract impact          | turanga-leela routes to appropriate peer    |
| **Integrate** | Commit, branch, pull request, version history                       | Verify passes; review passes or is skipped          | Scribe (none yet — Leela coordinates)       |

## Default Flow

**Full path** — new features, behavioral changes, shared-contract impact:

```
Design → Implement → Verify → Review → Integrate
```

**Fast path** — bounded tasks, no shared-contract impact:

```
Implement → Verify → Integrate
```

See the Maker-Checker skip criteria in the `orchestrate` skill to determine which path applies.

---

## Installed Skills

> **Keep this table in sync with skills actually present under your skills directory.** The orchestrate skill reads this table at every session start — an entry for a skill that is not installed causes startup errors.

| Order | Skill directory    | Session-start action                                             |
| ----- | ------------------ | ---------------------------------------------------------------- |
| 1     | `routing/`         | Load team roster and routing rules                               |
| 2     | `markdown-memory/` | `context:read` — load context, decisions, per-agent notes        |
| 3     | `github-issues/`   | `issue:ready` — surface actionable work from GitHub Issues       |
| 4     | `markdown-inbox/`  | `message:read` — check waiting messages from other agents        |

---

## Model Tiers

Used by the orchestrator when spawning tasks via the Copilot CLI (`task` tool supports model selection).

| Tier     | Model                  | Use for                                          |
| -------- | ---------------------- | ------------------------------------------------ |
| Fast     | `claude-haiku-4.5`     | Research, exploration, narrow tasks              |
| Standard | `claude-sonnet-4.6`    | Typical implementation and review                |
| Premium  | `claude-opus-4.5`      | Architecture, high-stakes reasoning              |
