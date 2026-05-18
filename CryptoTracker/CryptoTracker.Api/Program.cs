using System.Text;
using CryptoTracker.Api.Data;
using CryptoTracker.Api.Helpers;
using CryptoTracker.Api.Hubs;
using CryptoTracker.Api.Options;
using CryptoTracker.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

//
// DATABASE
//
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

//
// OPTIONS
//
builder.Services.Configure<MonitoringOptions>(
    builder.Configuration.GetSection("Monitoring"));

//
// JWT
//
builder.Services.AddScoped<JwtService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!);

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],

            IssuerSigningKey = new SymmetricSecurityKey(key)
        };

        // SignalR support
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;

                if (!string.IsNullOrEmpty(accessToken) &&
                    path.StartsWithSegments("/hubs/notifications"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });

//
// SIGNALR
//
builder.Services.AddSignalR();
builder.Services.AddSingleton<IUserIdProvider, UserIdProvider>();

//
// HTTP CLIENTS
//
builder.Services.AddHttpClient<JupiterPriceService>();
builder.Services.AddHttpClient<MexcPriceService>();

//
// SERVICES
//
builder.Services.AddSingleton<SpreadCalculator>();
builder.Services.AddScoped<NotificationService>();
builder.Services.AddHostedService<PriceMonitorService>();
builder.Services.AddSingleton<TradeCalculator>();

//
// CONTROLLERS
//
builder.Services.AddControllers();

//
// SWAGGER
//
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT: Bearer {token}"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

//
// CORS (ВАЖНО ДЛЯ AWS)
//
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendCors", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://localhost:3000",
                "http://13.49.64.201"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

//
// SWAGGER
//
app.UseSwagger();
app.UseSwaggerUI();

//
// ❗ ВАЖНО: HTTPS ОТКЛЮЧЕН (иначе будет ломаться на AWS без SSL)
//
/* app.UseHttpsRedirection(); */

//
// PIPELINE
//
app.UseCors("FrontendCors");

app.UseAuthentication();
app.UseAuthorization();

//
// ROUTES
//
app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    db.Database.Migrate();
}

app.Run();