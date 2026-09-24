using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Resource> Resources => Set<Resource>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<User> Users => Set<User>();

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
        .Property(u => u.Role)
        .HasConversion<string>();

        modelBuilder.Entity<WeeklyTimeDto>(entity =>
        {
            entity.HasNoKey();
            entity.Property(e => e.DayNumber).HasColumnName("day_number");
            entity.Property(e => e.AvailableDate).HasColumnName("available_date");
            entity.Property(e => e.AvailableTime).HasColumnName("available_time");
        });
    }

}
