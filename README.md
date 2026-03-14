# ConferenceApp

A full-stack conference management web app built with **React + .NET Aspire + PostgreSQL**, managed by an AI orchestrator that assigns tasks to specialised agents and keeps work moving automatically.

## The App

Browse conferences, explore tracks and sessions, view speaker profiles, and register for sessions — all in a responsive React UI backed by a .NET API orchestrated with Aspire.

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 · TypeScript · Vite · Tailwind CSS · React Query · React Router v7 |
| Backend | ASP.NET Core (.NET 10) · Entity Framework Core · JWT auth |
| Database | PostgreSQL (via Aspire container) |
| Orchestration | .NET Aspire 13 (AppHost) |

## Running Locally

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 24+](https://nodejs.org)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for Aspire PostgreSQL container)
- Aspire CLI: `dotnet tool install -g aspire`

### Start everything with Aspire

```bash
# Install frontend dependencies once
cd frontend && npm install && cd ..

# Run the entire app — starts API, PostgreSQL, and frontend together
aspire run
```

Aspire Dashboard opens at **http://localhost:15888** — shows logs, traces, and service health.

The API auto-runs EF migrations and seeds demo data (TechConf 2026) on first start.

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ConnectionStrings__conferencedb` | (Aspire-injected) | PostgreSQL connection string |
| `Jwt__Key` | dev key in appsettings.json | JWT signing key — **change in production** |
| `VITE_API_URL` | `http://localhost:5000` | API base URL for the frontend |

## Production Deployment

Deploy the full stack (API + PostgreSQL + frontend) with Docker Compose.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/) v2+

### Steps

```bash
# 1. Copy the example env file and fill in your secrets
cp .env.example .env

# 2. Edit .env — at minimum change POSTGRES_PASSWORD and Jwt__Key
#    Jwt__Key must be at least 32 characters long

# 3. Start all services in the background
docker compose up -d

# 4. Follow logs (optional)
docker compose logs -f
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API (direct) | http://localhost:8080 |
| API health | http://localhost:8080/health |

> **Note:** Swagger UI is disabled in Production mode. Use `/health` to verify the API is up.

### Environment variables

All variables are defined in `.env` (copy from `.env.example`):

| Variable | Description |
|----------|-------------|
| `POSTGRES_USER` | PostgreSQL username |
| `POSTGRES_PASSWORD` | PostgreSQL password — **change this** |
| `POSTGRES_DB` | PostgreSQL database name |
| `ConnectionStrings__conferencedb` | Full Npgsql connection string for the API |
| `Jwt__Key` | JWT signing secret — **must be ≥ 32 chars, change this** |
| `Jwt__Issuer` | JWT issuer claim (default: `ConferenceApp`) |
| `Jwt__Audience` | JWT audience claim (default: `ConferenceApp`) |

### Stopping and cleaning up

```bash
docker compose down          # stop containers
docker compose down -v       # stop and remove the postgres data volume
```

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

