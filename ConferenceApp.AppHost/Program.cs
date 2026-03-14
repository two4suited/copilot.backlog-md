var builder = DistributedApplication.CreateBuilder(args);

// PostgreSQL with a named data volume for persistence
var postgres = builder
    .AddPostgres("postgres")
    .WithDataVolume("conference-pgdata")
    .WithPgAdmin();

var db = postgres.AddDatabase("conferencedb");

// API project — receives the conferencedb connection string via Aspire
var api = builder
    .AddProject<Projects.ConferenceApp_Api>("api")
    .WithReference(db)
    .WaitFor(db);

// React/Vite frontend (created later at ../frontend)
builder
    .AddNpmApp("frontend", "../frontend", "dev")
    .WithReference(api)
    .WithHttpEndpoint(port: 5173, env: "PORT")
    .WithEnvironment("BROWSER", "none")
    .WaitFor(api);

builder.Build().Run();
