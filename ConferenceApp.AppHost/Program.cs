var builder = DistributedApplication.CreateBuilder(args);

// Use a stable password so the persisted data volume survives restarts.
// Override via CONFERENCE_PG_PASSWORD env var or user secrets in production.
var pgPassword = builder.AddParameter("pg-password", "DevPassword123!", secret: true);

// PostgreSQL with a named data volume for persistence
var postgres = builder
    .AddPostgres("postgres", password: pgPassword)
    .WithDataVolume("conference-pgdata")
    .WithPgAdmin();

var db = postgres.AddDatabase("conferencedb");

// API project — wait for the postgres server to be healthy (not the DB itself,
// which doesn't exist until EF migrations run on first startup).
var api = builder
    .AddProject<Projects.ConferenceApp_Api>("api")
    .WithReference(db)
    .WaitFor(postgres);

// React/Vite frontend — uses AddViteApp (Aspire.Hosting.JavaScript)
// which auto-configures the HTTP endpoint and sets the PORT env var.
builder
    .AddViteApp("frontend", "../frontend")
    .WithReference(api)
    .WithEnvironment("BROWSER", "none")
    .WaitFor(api);

builder.Build().Run();
