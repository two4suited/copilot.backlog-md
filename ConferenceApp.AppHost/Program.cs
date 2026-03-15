var builder = DistributedApplication.CreateBuilder(args);

// Use a stable password so the persisted data volume survives restarts.
// In publish mode this parameter becomes an Azure Key Vault secret.
var pgPassword = builder.AddParameter("pg-password", "DevPassword123!", secret: true);

// JWT signing key — injected as a secret into the API container.
// Override at deployment time: azd will prompt for a value and store it securely.
var jwtKey = builder.AddParameter("jwt-key", "dev-secret-key-change-in-production-min-32-chars!!", secret: true);

if (builder.ExecutionContext.IsPublishMode)
{
    // ── Azure publish mode ────────────────────────────────────────────────
    // Registers the Azure Container Apps environment and all provisioning
    // infrastructure (ACR, Log Analytics workspace, managed identity).
    builder.AddAzureContainerAppsInfrastructure();

    // Azure Database for PostgreSQL Flexible Server (replaces local container).
    // pgPassword is stored in Azure Key Vault and injected as a connection-string secret.
    var azurePostgres = builder.AddAzurePostgresFlexibleServer("postgres")
        .WithPasswordAuthentication(userName: null, password: pgPassword);

    var db = azurePostgres.AddDatabase("conferencedb");

    var api = builder
        .AddProject<Projects.ConferenceApp_Api>("api")
        .WithReference(db)
        .WithEnvironment("Jwt__Key", jwtKey)
        .PublishAsAzureContainerApp((_, app) =>
        {
            app.Template.Scale.MinReplicas = 1;
        });

    // Production frontend: multi-stage Dockerfile builds Vite assets and
    // serves them via nginx.  The nginx config proxies /api and /hubs to
    // the internal API container app using the Aspire-injected service URL.
    builder
        .AddDockerfile("frontend", "../frontend", "Dockerfile.frontend.prod")
        .WithReference(api)
        .WithHttpEndpoint(targetPort: 80)
        .PublishAsAzureContainerApp((_, app) =>
        {
            app.Template.Scale.MinReplicas = 1;
        });
}
else
{
    // ── Local development mode ────────────────────────────────────────────
    var postgres = builder
        .AddPostgres("postgres", password: pgPassword)
        .WithDataVolume("conference-pgdata")
        .WithPgAdmin();

    var db = postgres.AddDatabase("conferencedb");

    var api = builder
        .AddProject<Projects.ConferenceApp_Api>("api")
        .WithReference(db)
        .WithEnvironment("Jwt__Key", jwtKey)
        .WaitFor(postgres);

    builder
        .AddViteApp("frontend", "../frontend")
        .WithReference(api)
        .WithEnvironment("BROWSER", "none")
        .WaitFor(api);
}

builder.Build().Run();
