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
| `Jwt__Issuer` | JWT issuer claim | `Sessionize` |
| `Jwt__Audience` | JWT audience claim | `SessionizeUsers` |
| `VITE_API_URL` | API base URL for frontend | `http://localhost:5000` |

> **Security**: Never commit `Jwt__Key` to source control. Use secrets management (Azure Key Vault, GitHub Secrets, environment-specific config) in production.

---

## Production Deployment — Azure Container Apps

Sessionize deploys to Azure Container Apps via [.NET Aspire's Azure hosting integration](https://learn.microsoft.com/dotnet/aspire/deployment/azure/aca-deployment) and the [Azure Developer CLI (azd)](https://learn.microsoft.com/azure/developer/azure-developer-cli/).

### What `azd up` provisions automatically

| Azure resource | Purpose |
|---|---|
| Azure Container Apps environment | Hosts API + frontend container apps |
| Azure Container Registry (ACR) | Stores built container images |
| Azure Database for PostgreSQL Flexible Server | Production database |
| Azure Key Vault | Stores `pg-password` and `jwt-key` secrets |
| Azure Log Analytics workspace | Centralised logging |
| User-assigned Managed Identity | ACR pull credentials for container apps |

### Prerequisites

| Tool | Install |
|---|---|
| Azure subscription | [portal.azure.com](https://portal.azure.com) |
| Azure CLI | `brew install azure-cli` |
| Azure Developer CLI | `brew install azure-developer-cli` |
| Docker Desktop | Required to build container images locally |

### First-time deploy

```bash
# 1. Authenticate
az login
azd auth login

# 2. Provision all Azure resources and deploy (from repo root)
azd up
```

`azd up` will prompt for:
- **Environment name** (e.g. `production`) — used to name Azure resource groups
- **Azure location** (e.g. `eastus`)
- **`pg-password`** — PostgreSQL admin password, stored in Key Vault
- **`jwt-key`** — JWT signing secret (≥ 32 chars), stored in Key Vault

### Update a running deployment

```bash
# Rebuild and push images, then update container apps
azd deploy
```

### Architecture: dev vs production

| Concern | Local dev | Azure (publish mode) |
|---|---|---|
| PostgreSQL | Docker container (`AddPostgres`) | Azure Flexible Server (`AddAzurePostgresFlexibleServer`) |
| Frontend | Vite dev server (`AddViteApp`) | nginx container (`Dockerfile.frontend.prod`) |
| Secrets | `appsettings.json` defaults | Azure Key Vault |
| API ingress | Aspire localhost proxy | ACA internal ingress |
| Frontend ingress | Vite HMR port | ACA external HTTPS |

### How the frontend production container works

`frontend/Dockerfile.frontend.prod` builds the Vite app with `npm run build`, then serves the static assets with nginx. At container startup, `docker-entrypoint.sh` substitutes the API's internal URL (injected by Aspire as `services__api__http__0`) into the nginx config, so `/api/` and `/hubs/` requests are proxied to the API container app inside the same ACA environment.

### CI/CD — GitHub Actions

`.github/workflows/deploy-aca.yml` deploys on every push to `main` using OIDC (no long-lived credentials).

**Required GitHub secrets** (Settings → Secrets → Actions):

| Secret | Description |
|---|---|
| `AZURE_CLIENT_ID` | Client ID of the Azure AD app registration |
| `AZURE_TENANT_ID` | Azure AD tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Target Azure subscription ID |

**Optional GitHub variables** (Settings → Variables → Actions):

| Variable | Default | Description |
|---|---|---|
| `AZURE_ENV_NAME` | `production` | azd environment name |
| `AZURE_LOCATION` | `eastus` | Azure region |

To set up OIDC for the app registration, add a federated credential for the GitHub Actions workflow:
- **Issuer**: `https://token.actions.githubusercontent.com`
- **Subject**: `repo:<org>/<repo>:ref:refs/heads/main`
- **Audience**: `api://AzureADTokenExchange`

---

## Docker — Manual Deployment

### Build images

```bash
# API
docker build -t sessionize-api -f Sessionize.Api/Dockerfile .

# Frontend
docker build -t sessionize-frontend -f frontend/Dockerfile frontend/
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
    image: sessionize-api
    environment:
      ConnectionStrings__conferencedb: "Host=db;Database=conferencedb;Username=postgres;Password=postgres"
      Jwt__Key: "change-this-secret-key-in-production-32chars"
      Jwt__Issuer: "Sessionize"
      Jwt__Audience: "SessionizeUsers"
    ports:
      - "5000:8080"
    depends_on:
      - db

  frontend:
    image: sessionize-frontend
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
dotnet ef database update --project Sessionize.Api
```

To create a new migration after model changes:

```bash
dotnet ef migrations add <MigrationName> --project Sessionize.Api
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
