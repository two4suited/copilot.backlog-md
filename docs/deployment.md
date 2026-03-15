# Deploying Sessionize to Azure

Sessionize deploys to Azure Container Apps using the built-in .NET Aspire publish command.

## What gets provisioned

- **Azure Container Apps** — API and frontend containers
- **Azure Container Registry** — images built and pushed automatically by Aspire
- **Azure Database for PostgreSQL Flexible Server** — managed database
- **Azure Key Vault** — secrets (JWT signing key, DB password)

## Prerequisites

| Tool | Install |
|------|---------|
| Azure CLI | https://docs.microsoft.com/en-us/cli/azure/install-azure-cli |
| Azure subscription | https://azure.microsoft.com/free |

## Deploy

```bash
# 1. Login
az login

# 2. Deploy — provisions all infrastructure and deploys all services
aspire deploy
```

Aspire will prompt for environment name and Azure region on first run, then provision and deploy everything.

## Subsequent deploys

```bash
aspire deploy
```

Re-running `aspire deploy` updates containers without reprovisioning infrastructure.

## Tear down

```bash
az group delete --name <resource-group-name>
```

## CI/CD

The `.github/workflows/deploy-aca.yml` workflow supports manual `workflow_dispatch` deploys from GitHub Actions. Enable it when ready for automated deployments.
