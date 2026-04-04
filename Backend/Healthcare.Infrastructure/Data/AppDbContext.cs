using Healthcare.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Healthcare.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<PositionLog> PositionLogs => Set<PositionLog>();

}
