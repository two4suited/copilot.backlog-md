# ConferenceApp

A full-stack conference management web app built with **React + .NET Aspire + PostgreSQL**, managed by an AI orchestrator that assigns tasks to specialised agents and keeps work moving automatically.

## The App

Browse conferences, explore tracks and sessions, view speaker profiles, and register for sessions — all in a responsive React UI backed by a .NET API orchestrated with Aspire.

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 · TypeScript · Vite · Tailwind CSS · React Query · React Router v6 |
| Backend | ASP.NET Core (.NET 8+) · Entity Framework Core · JWT auth |
| Database | PostgreSQL (via Aspire container) |
| Orchestration | .NET Aspire (AppHost) |

## Running Locally

### Prerequisites
- [.NET 8+ SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for Aspire PostgreSQL container)

### Start everything with Aspire

```bash
# Install frontend dependencies once
cd frontend && npm install && cd ..

# Run the Aspire AppHost — starts API, PostgreSQL, and frontend together
dotnet run --project ConferenceApp.AppHost
```

Aspire Dashboard opens at **http://localhost:15888** — shows logs, traces, and service health.

The API auto-runs EF migrations and seeds demo data (TechConf 2026) on first start.

### Run services individually

```bash
# API only
dotnet run --project ConferenceApp.Api

# Frontend only
cd frontend && npm run dev
```

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ConnectionStrings__conferencedb` | (Aspire-injected) | PostgreSQL connection string |
| `Jwt__Key` | dev key in appsettings.json | JWT signing key — **change in production** |
| `VITE_API_URL` | `http://localhost:5000` | API base URL for the frontend |

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/conferences` | Paginated conference list |
| `GET` | `/api/conferences/{id}` | Conference detail with tracks |
| `POST` | `/api/conferences` | Create conference |
| `GET` | `/api/conferences/{id}/tracks` | Tracks for a conference |
| `GET` | `/api/conferences/{id}/tracks/{trackId}` | Track detail with sessions |
| `GET` | `/api/sessions` | Sessions (filter: `trackId`, `conferenceId`) |
| `GET` | `/api/sessions/{id}` | Session detail with speakers |
| `GET` | `/api/speakers` | All speakers |
| `GET` | `/api/speakers/{id}` | Speaker detail with sessions |
| `POST` | `/api/auth/register` | Create account → JWT |
| `POST` | `/api/auth/login` | Login → JWT |
| `GET` | `/api/auth/me` | Current user profile (🔒) |

Swagger UI: `http://localhost:5000/swagger` (development only)

## Project Structure

```
ConferenceApp.sln
├── ConferenceApp.AppHost/          # .NET Aspire orchestrator
├── ConferenceApp.Api/              # ASP.NET Core Web API
│   ├── Controllers/                # Conferences, Tracks, Sessions, Speakers, Auth
│   ├── Data/                       # DbContext, migrations, seeder
│   ├── DTOs/                       # Request/response records
│   └── Services/                   # TokenService (JWT)
├── ConferenceApp.Models/           # Domain models (shared library)
│   └── Conference, Track, Session, Speaker, User, Registration
frontend/                           # React app
│   └── src/
│       ├── pages/                  # ConferencesPage, ConferenceDetailPage, TrackDetailPage, ...
│       ├── components/             # Layout, LoadingSpinner, ErrorMessage, LevelBadge
│       ├── services/api.ts         # axios client with JWT interceptor
│       └── types/index.ts          # TypeScript interfaces
src/                                # Orchestrator CLI
backlog/                            # Task tracking (Backlog.md)
.github/agents/                     # Agent instruction files
```

## AI Orchestrator

This repo uses an **orchestrator + specialised agents** system to build the app automatically.

### Skill-based agents

| Agent | Handles |
|-------|---------|
| `aspire-expert` | AppHost, infrastructure, containers, OTel |
| `dotnet-developer` | API controllers, services, middleware |
| `database-developer` | EF Core models, migrations, schema |
| `react-developer` | React pages, components, hooks |
| `designer` | UI/UX, Tailwind components, accessibility |
| `tester` | Playwright e2e tests, bug filing |

### Orchestrator commands

```bash
# Continuous loop — assigns To Do tasks, detects stuck work, files bugs
orchestrator ralph

# One-shot tag & assign all tasks by label
orchestrator tag

# Assign a specific task
orchestrator assign 3.1 --agent dotnet-developer

# File a bug
orchestrator bug "Login fails on Safari" --task 4.2 --priority high

# See all tasks and assignments
orchestrator status
backlog task list --plain
```

### Ralph loop

The `ralph` loop runs continuously, scanning the backlog every 30 seconds:
- Assigns new **To Do** tasks to the right skill agent based on labels
- Detects tasks stuck **In Progress** and auto-files bug reports
- Persists state in `backlog/.ralph-state.json`

```bash
orchestrator ralph --interval 30   # run forever
orchestrator ralph --dry-run       # preview without changes
```

## Task Board

```bash
backlog board          # terminal Kanban board
backlog browser        # web UI
backlog task list --plain
```

## Learn More

- [Orchestrator Documentation](./ORCHESTRATOR.md)
- [Quick Start Guide](./QUICK_START.md)
- [Agent Instructions](./.github/agents/)
- [Aspire Documentation](https://aspire.dev)

