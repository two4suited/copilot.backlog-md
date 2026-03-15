---
id: TASK-51
title: Deploy ConferenceApp to Azure Container Apps using Aspire
status: In Progress
assignee:
  - '@agent-aca'
created_date: '2026-03-15 00:47'
updated_date: '2026-03-15 01:33'
labels:
  - azure
  - deployment
  - aspire
  - infrastructure
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Use .NET Aspire's Azure hosting integration to deploy the full ConferenceApp stack (API + frontend + PostgreSQL) to Azure Container Apps (ACA). Aspire generates Bicep/provisioning code automatically from the AppHost model. The deployment uses 'aspire publish' / 'azd up' to provision all Azure resources.

Key Azure resources Aspire will provision automatically:
- Azure Container Apps Environment (with Aspire dashboard)
- Azure Container Registry (ACR) for built images
- Azure Database for PostgreSQL Flexible Server (replacing the local postgres container)
- Azure Log Analytics workspace
- User-assigned Managed Identity

AppHost changes required:
1. Add NuGet package: Aspire.Hosting.Azure.AppContainerApps (or Aspire.Hosting.Azure)
2. Call AddAzureContainerAppEnvironment() to declare the ACA env
3. Call .PublishAsAzureContainerApp() on the api and frontend resources
4. Replace AddPostgres() with AddAzurePostgresFlexibleServer() for production
5. Store secrets (JWT key, pg password) as Azure Key Vault references or ACA secrets

Frontend consideration: AddViteApp runs 'npm run dev' locally. For production ACA deployment the frontend must be built (npm run build) and served via nginx or as a static site. Options: a) serve built assets from the API container, b) use Azure Static Web Apps for the frontend, c) build a production nginx container.

Deployment toolchain: Use 'azd' (Azure Developer CLI) with 'azd init --from-code' or 'azd up'. Alternatively use the new 'aspire deploy' CLI command (Aspire 9+).

Reference: https://learn.microsoft.com/en-us/dotnet/aspire/deployment/azure/aca-deployment
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Aspire.Hosting.Azure package added to ConferenceApp.AppHost.csproj
- [x] #2 AppHost Program.cs uses AddAzureContainerAppEnvironment() and PublishAsAzureContainerApp() on api and frontend
- [x] #3 PostgreSQL replaced with AddAzurePostgresFlexibleServer() when running in publish/deploy mode (keep local postgres for dev)
- [x] #4 Secrets (JWT signing key, pg password) stored as ACA secrets or Azure Key Vault references — not hardcoded
- [x] #5 Frontend has a production Dockerfile or nginx container for serving built Vite assets
- [ ] #6 'azd up' or 'aspire deploy' successfully provisions all Azure resources and deploys containers
- [ ] #7 App is accessible via the ACA-assigned public URL after deployment
- [x] #8 GitHub Actions workflow added for CI/CD: build → push to ACR → azd deploy on merge to main
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add Aspire.Hosting.Azure.AppContainers + Aspire.Hosting.Azure.PostgreSQL + Aspire.Hosting.Azure packages to AppHost
2. Rewrite AppHost/Program.cs with IsPublishMode branch: Azure Flexible Server + AddAzureContainerAppEnvironment + PublishAsAzureContainerApp on api and frontend; local branch unchanged
3. Add jwt-key parameter (secret) to both branches so the JWT key is stored as a Key Vault secret in production
4. Create frontend/Dockerfile.frontend.prod (node build → nginx runtime with envsubst entrypoint)
5. Create frontend/nginx.prod.conf (template with ${API_SERVICE_URL} placeholder for /api/ and /hubs/ proxying)
6. Create frontend/docker-entrypoint.sh (reads services__api__http__0, runs envsubst, starts nginx)
7. Create azure.yaml pointing azd at the AppHost project
8. Create .github/workflows/deploy-aca.yml (OIDC login + azd deploy on push to main)
9. Update docs/deployment.md with full Azure section including architecture table, OIDC setup guide, required secrets
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## Azure Container Apps Deployment Setup

Configured end-to-end deployment pipeline for ConferenceApp on Azure Container Apps using .NET Aspire 13 and azd.

### What changed

**ConferenceApp.AppHost**
- Added packages: `Aspire.Hosting.Azure`, `Aspire.Hosting.Azure.AppContainers`, `Aspire.Hosting.Azure.PostgreSQL`
- `Program.cs` now branches on `builder.ExecutionContext.IsPublishMode`:
  - **Publish**: `AddAzureContainerAppEnvironment`, `AddAzurePostgresFlexibleServer` + `WithPasswordAuthentication`, `PublishAsAzureContainerApp` on API and frontend Dockerfile container
  - **Dev**: unchanged local postgres + Vite dev server
- `jwt-key` added as a secret parameter (stored in Azure Key Vault at deploy time)

**frontend/**
- `Dockerfile.frontend.prod` — multi-stage: node build → nginx runtime with `gettext` for envsubst
- `nginx.prod.conf` — template with `${API_SERVICE_URL}` placeholder for `/api/` and `/hubs/` proxy locations
- `docker-entrypoint.sh` — reads `services__api__http__0` (Aspire-injected), runs `envsubst`, then starts nginx

**Root**
- `azure.yaml` — azd project definition pointing at AppHost; `azd up` from repo root provisions all resources

**.github/workflows/deploy-aca.yml**
- Triggers on push to `main` and `workflow_dispatch`
- Uses OIDC (`azure/login`) — no long-lived secrets needed
- Runs `azd deploy` after authenticating; requires `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID` secrets

**docs/deployment.md**
- Full Azure section: provisioned resources table, architecture dev-vs-prod comparison, CI/CD setup, OIDC federated credential instructions

### Notes on ACs 6 & 7
AC #6 (azd up runs) and AC #7 (app accessible at ACA URL) cannot be verified here — no Azure credentials are available locally (per task instructions). All configuration is in place; `azd up` should succeed once credentials are configured.

### Tests
- `dotnet build ConferenceApp.sln` — 0 errors, 0 warnings
<!-- SECTION:FINAL_SUMMARY:END -->
