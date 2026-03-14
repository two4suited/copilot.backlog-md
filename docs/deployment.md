# Deployment Guide

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| [.NET SDK](https://dotnet.microsoft.com/download) | 10+ | Build & run the API |
| [Node.js](https://nodejs.org) | 24+ | Build & run the frontend |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Latest | PostgreSQL container via Aspire |
| Aspire CLI | Latest | Orchestrate local services |

Install the Aspire CLI:
```bash
dotnet tool install -g aspire
```

---

## Local Development

### 1. Install frontend dependencies (once)

```bash
cd frontend && npm install && cd ..
```

### 2. Start everything

```bash
aspire run
```

Aspire starts all services and opens the dashboard automatically:

| Service | URL |
|---------|-----|
| Aspire Dashboard | http://localhost:15888 |
| API | http://localhost:5000 |
| Frontend | http://localhost:5173 |
| Swagger UI | http://localhost:5000/swagger |

On first run the API automatically applies EF Core migrations and seeds demo data (TechConf 2026, speakers, sessions).

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `ConnectionStrings__conferencedb` | PostgreSQL connection string | Injected by Aspire |
| `Jwt__Key` | JWT signing key (≥ 32 chars) | Dev key in `appsettings.json` — **change in production** |
| `Jwt__Issuer` | JWT issuer claim | `ConferenceApp` |
| `Jwt__Audience` | JWT audience claim | `ConferenceAppUsers` |
| `VITE_API_URL` | API base URL for frontend | `http://localhost:5000` |

> **Security**: Never commit `Jwt__Key` to source control. Use secrets management (Azure Key Vault, GitHub Secrets, environment-specific config) in production.

---

## Production Deployment — Azure Container Apps

ConferenceApp is designed for cloud deployment via the [Azure Developer CLI (azd)](https://learn.microsoft.com/azure/developer/azure-developer-cli/).

### Prerequisites

- Azure subscription
- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)
- [Azure Developer CLI](https://learn.microsoft.com/azure/developer/azure-developer-cli/install-azd)

### Deploy

```bash
# 1. Log in
az login
azd auth login

# 2. Initialise the project (first time only)
azd init

# 3. Provision Azure resources and deploy
azd up
```

`azd up` provisions:
- Azure Container Apps environment
- Azure Container Registry
- Azure Database for PostgreSQL Flexible Server
- Azure Key Vault (for secrets)

### Update a running deployment

```bash
azd deploy
```

---

## Docker — Manual Deployment

### Build images

```bash
# API
docker build -t conferenceapp-api -f ConferenceApp.Api/Dockerfile .

# Frontend
docker build -t conferenceapp-frontend -f frontend/Dockerfile frontend/
```

### Run with Docker Compose

Create a `docker-compose.yml` at the repo root:

```yaml
version: "3.9"
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: conferencedb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"

  api:
    image: conferenceapp-api
    environment:
      ConnectionStrings__conferencedb: "Host=db;Database=conferencedb;Username=postgres;Password=postgres"
      Jwt__Key: "change-this-secret-key-in-production-32chars"
      Jwt__Issuer: "ConferenceApp"
      Jwt__Audience: "ConferenceAppUsers"
    ports:
      - "5000:8080"
    depends_on:
      - db

  frontend:
    image: conferenceapp-frontend
    environment:
      VITE_API_URL: "http://localhost:5000"
    ports:
      - "5173:80"
    depends_on:
      - api
```

```bash
docker compose up -d
```

---

## Database Migrations

Migrations run automatically on API startup. To run them manually:

```bash
dotnet ef database update --project ConferenceApp.Api
```

To create a new migration after model changes:

```bash
dotnet ef migrations add <MigrationName> --project ConferenceApp.Api
```

---

## Default Accounts

The database seeder creates the following accounts on first startup:

| Email | Password | Role |
|-------|----------|------|
| `admin@conference.dev` | `Admin123!` | Admin |
| `speaker@conference.dev` | `Speaker123!` | Speaker |
| `attendee@conference.dev` | `Attendee123!` | Attendee |

> **Important**: Change these passwords immediately in any non-local environment.

---

## Health Checks

The API exposes health check endpoints (via Aspire Service Defaults):

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Overall health |
| `GET /alive` | Liveness probe |

These are suitable for use as Kubernetes liveness/readiness probes or Azure Container Apps health probes.
