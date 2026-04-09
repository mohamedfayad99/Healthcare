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

        app.MapPost("/api/auth/register", async (AppDbContext db, UserRegisterDto dto) =>
        {
            if (await db.Users.AnyAsync(u => u.Username == dto.Username))
                return Results.BadRequest(new { Message = "Username already exists" });

            var newUser = new User
            {
                Username = dto.Username,
                Role = dto.Role,
                ProfileImage = dto.ProfileImage,
                NationalId = dto.NationalId,
                Gender = dto.Gender,
                PhoneNumber = dto.PhoneNumber
                // Typically you would hash the password here, but we'll accept plain text per the existing demo setup
            };

            db.Users.Add(newUser);
            await db.SaveChangesAsync();

            return Results.Ok(new { Message = "User registered successfully" });
        });

        app.MapGet("/api/beds/occupied", async (AppDbContext db) =>
        {
            var occupiedBeds = await db.Patients.Select(p => p.BedNumber).ToListAsync();
            return Results.Ok(occupiedBeds);
        });

        app.MapPost("/api/patients", async (HttpContext context, PatientCreateDto dto, AppDbContext db) =>
        {
            var userIdStr = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Results.Unauthorized();

            var newPatient = new Patient
            {
                FullName = dto.FullName,
                Age = dto.Age,
                Department = dto.Department,
                BedNumber = dto.BedNumber,
                MobilityStatus = dto.MobilityStatus,
                CreatedByUserId = userId
            };

            db.Patients.Add(newPatient);
            await db.SaveChangesAsync();

            return Results.Created($"/api/patients/{newPatient.Id}", newPatient);
        }).RequireAuthorization();

        app.MapGet("/api/patients", async (HttpContext context, AppDbContext db) =>
        {
            var userIdStr = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Results.Unauthorized();

            var patients = await db.Patients
                .Where(p => p.CreatedByUserId == userId)
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
        }).RequireAuthorization();

        app.MapGet("/api/patients/{id}", async (HttpContext context, int id, AppDbContext db) =>
        {
            var userIdStr = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Results.Unauthorized();

            var patient = await db.Patients.FirstOrDefaultAsync(p => p.Id == id && p.CreatedByUserId == userId);
            if (patient == null) return Results.NotFound();

            var lastLog = await db.PositionLogs
                .Where(log => log.PatientId == id)
                .OrderByDescending(log => log.ChangedAt)
                .FirstOrDefaultAsync();

            return Results.Ok(new { Patient = patient, LastPositionLog = lastLog });
        }).RequireAuthorization();

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

        app.MapPost("/api/patients/{id}/positions", async (HttpContext context, int id, PositionCreateDto dto, AppDbContext db) =>
        {
            var userIdStr = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Results.Unauthorized();

            var log = new PositionLog
            {
                PatientId = id,
                TargetPosition = dto.TargetPosition,
                ChangedAt = DateTime.UtcNow,
                ChangedByUserId = userId,
                IsMissed = false
            };

            db.PositionLogs.Add(log);
            await db.SaveChangesAsync();

            var resultLog = new {
                log.Id,
                log.TargetPosition,
                log.ChangedAt,
                ChangedByInfo = context.User.FindFirst(ClaimTypes.Name)?.Value ?? "User",
                log.IsMissed
            };
            return Results.Created($"/api/patients/{id}/positions/{log.Id}", resultLog);
        }).RequireAuthorization();
        app.MapDelete("/api/patients/{id}", async (HttpContext context, int id, AppDbContext db) =>
        {
            var userIdStr = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Results.Unauthorized();

            var patient = await db.Patients.FirstOrDefaultAsync(p => p.Id == id && p.CreatedByUserId == userId);
            if (patient == null) return Results.NotFound();
            
            db.Patients.Remove(patient);
            await db.SaveChangesAsync();
            return Results.Ok(new { Message = "Patient deleted successfully" });
        }).RequireAuthorization();

        app.MapGet("/api/auth/me", async (HttpContext context, AppDbContext db) =>
        {
            var userIdStr = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Results.Unauthorized();
                
            var user = await db.Users.FindAsync(userId);
            if (user == null) return Results.NotFound();
            
            return Results.Ok(new { user.Id, user.Username, user.Role, user.ProfileImage, user.NationalId, user.Gender, user.PhoneNumber });
        }).RequireAuthorization();

        app.MapPut("/api/auth/profile-image", async (HttpContext context, ProfileImageUpdateDto dto, AppDbContext db) =>
        {
            var userIdStr = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Results.Unauthorized();
                
            var user = await db.Users.FindAsync(userId);
            if (user == null) return Results.NotFound();
            
            user.ProfileImage = dto.ImageBase64;
            await db.SaveChangesAsync();
            
            return Results.Ok(new { Message = "Profile image updated successfully", ProfileImage = user.ProfileImage });
        }).RequireAuthorization();
        app.MapPut("/api/auth/profile", async (HttpContext context, UserProfileUpdateDto dto, AppDbContext db) =>
        {
            var userIdStr = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Results.Unauthorized();
                
            var user = await db.Users.FindAsync(userId);
            if (user == null) return Results.NotFound();
            
            if (!string.IsNullOrEmpty(dto.Username)) user.Username = dto.Username;
            if (!string.IsNullOrEmpty(dto.PhoneNumber)) user.PhoneNumber = dto.PhoneNumber;
            
            await db.SaveChangesAsync();
            
            return Results.Ok(new { Message = "Profile updated successfully", Username = user.Username, PhoneNumber = user.PhoneNumber });
        }).RequireAuthorization();
    }
}

public class UserLoginDto { public string Username { get; set; } = string.Empty; public string Password { get; set; } = string.Empty; }
public class UserRegisterDto { public string Username { get; set; } = string.Empty; public string Password { get; set; } = string.Empty; public string Role { get; set; } = "Nurse"; public string ProfileImage { get; set; } = string.Empty; public string NationalId { get; set; } = string.Empty; public string Gender { get; set; } = string.Empty; public string PhoneNumber { get; set; } = string.Empty; }
public class UserProfileUpdateDto { public string? Username { get; set; } public string? PhoneNumber { get; set; } }
public class PatientCreateDto { public string FullName { get; set; } = string.Empty; public int Age { get; set; } = 0; public string Department { get; set; } = string.Empty; public string BedNumber { get; set; } = string.Empty; public string MobilityStatus { get; set; } = string.Empty; }
public class PositionCreateDto { public string TargetPosition { get; set; } = string.Empty; }
public class ProfileImageUpdateDto { public string ImageBase64 { get; set; } = string.Empty; }
