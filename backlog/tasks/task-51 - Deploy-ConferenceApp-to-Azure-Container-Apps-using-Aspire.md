---
id: TASK-51
title: Deploy ConferenceApp to Azure Container Apps using Aspire
status: To Do
assignee: []
created_date: '2026-03-15 00:47'
labels:
  - azure
  - deployment
  - aspire
  - infrastructure
dependencies: []
priority: high
github_issue: 107
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
- [ ] #1 Aspire.Hosting.Azure package added to ConferenceApp.AppHost.csproj
- [ ] #2 AppHost Program.cs uses AddAzureContainerAppEnvironment() and PublishAsAzureContainerApp() on api and frontend
- [ ] #3 PostgreSQL replaced with AddAzurePostgresFlexibleServer() when running in publish/deploy mode (keep local postgres for dev)
- [ ] #4 Secrets (JWT signing key, pg password) stored as ACA secrets or Azure Key Vault references — not hardcoded
- [ ] #5 Frontend has a production Dockerfile or nginx container for serving built Vite assets
- [ ] #6 'azd up' or 'aspire deploy' successfully provisions all Azure resources and deploys containers
- [ ] #7 App is accessible via the ACA-assigned public URL after deployment
- [ ] #8 GitHub Actions workflow added for CI/CD: build → push to ACR → azd deploy on merge to main
<!-- AC:END -->
