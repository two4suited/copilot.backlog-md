using System.Text;
using ConferenceApp.Api.Hubs;
using ConferenceApp.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using ConferenceApp.Api.Data;
using ConferenceApp.Models;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "ConferenceApp API", Version = "v1", Description = "REST API for conference management" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
            Array.Empty<string>()
        }
    });
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath)) c.IncludeXmlComments(xmlPath);
});
builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddProblemDetails();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        // Allow any localhost origin so the port Aspire/Vite picks doesn't matter
        policy.SetIsOriginAllowed(origin =>
              {
                  var uri = new Uri(origin);
                  return uri.Host == "localhost" || uri.Host == "127.0.0.1";
              })
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
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
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddHostedService<SessionReminderService>();

var app = builder.Build();

app.MapDefaultEndpoints();

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
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "ConferenceApp API v1"));
    app.UseCors("AllowFrontend");
}

app.UseAuthentication();
app.UseAuthorization();
app.UseHttpsRedirection();
app.MapControllers();
app.MapHub<SessionHub>("/hubs/session");

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

app.Run();
