using Healthcare.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Healthcare.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<PositionLog> PositionLogs => Set<PositionLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Seed initial data
        modelBuilder.Entity<User>().HasData(
            new User { Id = 1, Username = "hamid", Role = "Nurse" }
        );

        modelBuilder.Entity<Patient>().HasData(
            new Patient { Id = 1, FullName = "سعد عطية", Age = 58, BedNumber = "12", Department = "العناية المركزة", MobilityStatus = "غير قادر على الحركة" },
            new Patient { Id = 2, FullName = "محمد علي", Age = 45, BedNumber = "8", Department = "العناية المركزة", MobilityStatus = "غير قادر على الحركة" },
            new Patient { Id = 3, FullName = "فاطمة أحمد", Age = 62, BedNumber = "15", Department = "العناية المركزة", MobilityStatus = "غير قادر على الحركة" }
        );
        
        // Setup initial position logs
        modelBuilder.Entity<PositionLog>().HasData(
            new PositionLog { Id = 1, PatientId = 1, TargetPosition = "على الظهر", ChangedAt = DateTime.UtcNow.AddHours(-1.5), ChangedByUserId = 1, IsMissed = false },
            new PositionLog { Id = 2, PatientId = 2, TargetPosition = "الجانب الأيمن", ChangedAt = DateTime.UtcNow.AddMinutes(-35), ChangedByUserId = 1, IsMissed = false },
            new PositionLog { Id = 3, PatientId = 3, TargetPosition = "الجانب الأيسر", ChangedAt = DateTime.UtcNow.AddHours(-4.5), ChangedByUserId = 1, IsMissed = false }
        );
    }
}
