using System.Text;
using ConferenceApp.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using ConferenceApp.Api.Data;
using ConferenceApp.Models;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var connectionString = builder.Configuration.GetConnectionString("conferencedb")
    ?? throw new InvalidOperationException("Connection string 'conferencedb' not found.");

builder.Services.AddDbContext<ConferenceDbContext>(options =>
    options.UseNpgsql(connectionString)
           .UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking));

// JWT authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("SpeakerOrAdmin", policy => policy.RequireRole("Speaker", "Admin"));
});

builder.Services.AddScoped<TokenService>();

var app = builder.Build();

await using (var scope = app.Services.CreateAsyncScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ConferenceDbContext>();
    try
    {
        await db.Database.MigrateAsync();
        await DbSeeder.SeedAsync(db);
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogWarning(ex, "Database migration/seeding failed on startup — Aspire will retry.");
    }
}

app.UseExceptionHandler(a => a.Run(async ctx =>
{
    ctx.Response.StatusCode = 500;
    ctx.Response.ContentType = "application/problem+json";
    await ctx.Response.WriteAsJsonAsync(new
    {
        type = "https://httpstatuses.io/500",
        title = "An unexpected error occurred.",
        status = 500
    });
}));

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseCors("AllowFrontend");
}

app.UseAuthentication();
app.UseAuthorization();
app.UseHttpsRedirection();
app.MapControllers();

app.MapGet("/api/tracks/{id:guid}", async (Guid id, ConferenceDbContext db) =>
    await db.Tracks.Include(t => t.Sessions).FirstOrDefaultAsync(t => t.Id == id)
        is Track track ? Results.Ok(track) : Results.NotFound())
    .WithName("GetTrackById");

app.MapPost("/api/tracks", async (Track track, ConferenceDbContext db) =>
{
    db.Tracks.Add(track);
    await db.SaveChangesAsync();
    return Results.Created($"/api/tracks/{track.Id}", track);
}).WithName("CreateTrack");

app.MapGet("/api/sessions", async (ConferenceDbContext db) =>
    await db.Sessions
        .Include(s => s.Track)
        .Include(s => s.SessionSpeakers).ThenInclude(ss => ss.Speaker)
        .ToListAsync())
    .WithName("GetSessions");

app.MapGet("/api/sessions/{id:guid}", async (Guid id, ConferenceDbContext db) =>
    await db.Sessions
        .Include(s => s.Track)
        .Include(s => s.SessionSpeakers).ThenInclude(ss => ss.Speaker)
        .Include(s => s.Registrations)
        .FirstOrDefaultAsync(s => s.Id == id)
        is Session session ? Results.Ok(session) : Results.NotFound())
    .WithName("GetSessionById");

app.MapGet("/api/tracks/{trackId:guid}/sessions", async (Guid trackId, ConferenceDbContext db) =>
    await db.Sessions.Where(s => s.TrackId == trackId)
        .Include(s => s.SessionSpeakers).ThenInclude(ss => ss.Speaker)
        .ToListAsync())
    .WithName("GetSessionsByTrack");

app.MapPost("/api/sessions", async (Session session, ConferenceDbContext db) =>
{
    db.Sessions.Add(session);
    await db.SaveChangesAsync();
    return Results.Created($"/api/sessions/{session.Id}", session);
}).WithName("CreateSession");

app.MapGet("/api/speakers", async (ConferenceDbContext db) =>
    await db.Speakers
        .Include(sp => sp.SessionSpeakers).ThenInclude(ss => ss.Session)
        .ToListAsync())
    .WithName("GetSpeakers");

app.MapGet("/api/speakers/{id:guid}", async (Guid id, ConferenceDbContext db) =>
    await db.Speakers
        .Include(sp => sp.SessionSpeakers).ThenInclude(ss => ss.Session)
        .FirstOrDefaultAsync(sp => sp.Id == id)
        is Speaker speaker ? Results.Ok(speaker) : Results.NotFound())
    .WithName("GetSpeakerById");

app.MapPost("/api/speakers", async (Speaker speaker, ConferenceDbContext db) =>
{
    db.Speakers.Add(speaker);
    await db.SaveChangesAsync();
    return Results.Created($"/api/speakers/{speaker.Id}", speaker);
}).WithName("CreateSpeaker");

app.MapGet("/api/users", async (ConferenceDbContext db) =>
    await db.Users.ToListAsync())
    .WithName("GetUsers");

app.MapGet("/api/users/{id:guid}", async (Guid id, ConferenceDbContext db) =>
    await db.Users
        .Include(u => u.Registrations).ThenInclude(r => r.Session)
        .FirstOrDefaultAsync(u => u.Id == id)
        is User user ? Results.Ok(user) : Results.NotFound())
    .WithName("GetUserById");

app.MapPost("/api/users", async (User user, ConferenceDbContext db) =>
{
    db.Users.Add(user);
    await db.SaveChangesAsync();
    return Results.Created($"/api/users/{user.Id}", user);
}).WithName("CreateUser");

app.MapGet("/api/registrations", async (ConferenceDbContext db) =>
    await db.Registrations.Include(r => r.User).Include(r => r.Session).ToListAsync())
    .WithName("GetRegistrations");

app.MapGet("/api/users/{userId:guid}/registrations", async (Guid userId, ConferenceDbContext db) =>
    await db.Registrations.Where(r => r.UserId == userId)
        .Include(r => r.Session).ThenInclude(s => s.Track)
        .ToListAsync())
    .WithName("GetUserRegistrations");

app.MapGet("/api/sessions/{sessionId:guid}/registrations", async (Guid sessionId, ConferenceDbContext db) =>
    await db.Registrations.Where(r => r.SessionId == sessionId)
        .Include(r => r.User)
        .ToListAsync())
    .WithName("GetSessionRegistrations");

app.MapPost("/api/registrations", async (Registration registration, ConferenceDbContext db) =>
{
    registration.RegisteredAt = DateTime.UtcNow;
    db.Registrations.Add(registration);
    await db.SaveChangesAsync();
    return Results.Created($"/api/registrations/{registration.Id}", registration);
}).WithName("CreateRegistration");

app.MapDelete("/api/registrations/{id:guid}", async (Guid id, ConferenceDbContext db) =>
{
    var reg = await db.Registrations.IgnoreQueryFilters().FirstOrDefaultAsync(r => r.Id == id);
    if (reg is null) return Results.NotFound();
    db.Registrations.Remove(reg);
    await db.SaveChangesAsync();
    return Results.NoContent();
}).WithName("DeleteRegistration");

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }))
    .WithName("Health");

app.Run();
