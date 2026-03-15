# Deploying Sessionize to Azure

Sessionize uses .NET Aspire with the Azure Developer CLI (`azd`) for deployment to Azure Container Apps.

## What gets provisioned

- **Azure Container Apps** — API and frontend containers
- **Azure Container Registry** — Docker images built and pushed automatically
- **Azure Database for PostgreSQL Flexible Server** — managed database
- **Azure Key Vault** — secrets (JWT key, connection strings)

## Prerequisites

| Tool | Install |
|------|---------|
| Azure Developer CLI | `winget install Microsoft.Azd` / `brew install azd` |
| Azure CLI | https://docs.microsoft.com/en-us/cli/azure/install-azure-cli |
| Azure subscription | https://azure.microsoft.com/free |

## First-time setup

```bash
# 1. Login
azd auth login

# 2. Provision all infrastructure and deploy
azd up
```

`azd up` will:
1. Ask for environment name and Azure region
2. Provision all Azure resources via Bicep templates
3. Build and push container images
4. Deploy the Aspire app

## Ongoing deploys

```bash
# Deploy latest code (infrastructure already provisioned)
azd deploy
```

## Tear down

```bash
# Delete all Azure resources
azd down
```

## CI/CD

The `.github/workflows/deploy-aca.yml` workflow supports manual `workflow_dispatch` deploys from GitHub Actions. Enable it when ready for automated deployments.
