using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Healthcare.Infrastructure.Data;
using Healthcare.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Healthcare.Api.Routes;

public static class Route
{
    public static void MapEndpoints(this WebApplication app)
    {
        var key = Encoding.ASCII.GetBytes(app.Configuration["Jwt:Key"] ?? "PatientCareSuperSecretKey123ForHamidDoctor!@#");

        app.MapPost("/api/auth/login", async (AppDbContext db, UserLoginDto dto) =>
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);
            if (user == null) return Results.Unauthorized();

            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                Issuer = app.Configuration["Jwt:Issuer"],
                Audience = app.Configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return Results.Ok(new { Token = tokenHandler.WriteToken(token), Username = user.Username, Role = user.Role });
        });

        app.MapGet("/api/patients", async (AppDbContext db) =>
        {
            var patients = await db.Patients
                .Select(p => new
                {
                    p.Id,
                    p.FullName,
                    p.BedNumber,
                    p.Department,
                    p.Age,
                    LastPositionLog = db.PositionLogs
                        .Where(log => log.PatientId == p.Id)
                        .OrderByDescending(log => log.ChangedAt)
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Results.Ok(patients);
        });

        app.MapGet("/api/patients/{id}", async (int id, AppDbContext db) =>
        {
            var patient = await db.Patients.FindAsync(id);
            if (patient == null) return Results.NotFound();

            var lastLog = await db.PositionLogs
                .Where(log => log.PatientId == id)
                .OrderByDescending(log => log.ChangedAt)
                .FirstOrDefaultAsync();

            return Results.Ok(new { Patient = patient, LastPositionLog = lastLog });
        });

        app.MapGet("/api/patients/{id}/positions", async (int id, AppDbContext db) =>
        {
            var logs = await db.PositionLogs
                .Include(log => log.ChangedByUser)
                .Where(log => log.PatientId == id)
                .OrderByDescending(log => log.ChangedAt)
                .Select(log => new {
                    log.Id,
                    log.TargetPosition,
                    log.ChangedAt,
                    ChangedByInfo = log.ChangedByUser != null ? log.ChangedByUser.Username : "System",
                    log.IsMissed
                })
                .ToListAsync();

            return Results.Ok(logs);
        });

        app.MapPost("/api/patients/{id}/positions", async (int id, PositionCreateDto dto, AppDbContext db) =>
        {
            var log = new PositionLog
            {
                PatientId = id,
                TargetPosition = dto.TargetPosition,
                ChangedAt = DateTime.UtcNow,
                ChangedByUserId = 1,
                IsMissed = false
            };

            db.PositionLogs.Add(log);
            await db.SaveChangesAsync();

            var resultLog = new {
                log.Id,
                log.TargetPosition,
                log.ChangedAt,
                ChangedByInfo = "hamid",
                log.IsMissed
            };
            return Results.Created($"/api/patients/{id}/positions/{log.Id}", resultLog);
        });
    }
}

public class UserLoginDto { public string Username { get; set; } = string.Empty; public string Password { get; set; } = string.Empty; }
public class PositionCreateDto { public string TargetPosition { get; set; } = string.Empty; }
