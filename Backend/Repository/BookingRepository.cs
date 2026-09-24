using System.Linq.Expressions;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Backend.Dto;
public class BookingRepository(AppDbContext db)
{
  private readonly AppDbContext _db = db;

    public async Task<List<WeeklyTimeDto>> GetWeeklyTimes(DateOnly inputDate)
{
    return await _db.Set<WeeklyTimeDto>()
        .FromSqlInterpolated($"SELECT * FROM public.weekly_times({inputDate})")
        .ToListAsync();
}

  public async Task<bool> CreateBooking(Booking bookingToCreate)
  {

    _db.Bookings.Add(bookingToCreate);
    await _db.SaveChangesAsync();
    return true;
  }

  public async Task<Booking?> GetById(int id)
{
    return await _db.Bookings.FindAsync(id);
}


public async Task<BookingDto?> GetByIdWithDetails(int id, string? userId = null)
{
    var query = _db.Bookings.Where(b => b.Id == id && (userId == null || b.UserId == userId));

    return await query
        .Join(_db.Resources, b => b.ResourceId, r => r.Id, (b, r) => new { b, r })
        .Join(_db.Users, br => br.b.UserId, u => u.Id, (br, u) => new BookingDto
        {
            Id = br.b.Id,
            UserId = br.b.UserId,
            UserName = u.UserName!,
            ResourceId = br.b.ResourceId,
            ResourceName = br.r.Name,
            Date = br.b.Date,
            StartTime = br.b.StartTime,
            EndTime = br.b.EndTime
        })
        .FirstOrDefaultAsync();
}

public async Task<List<BookingDto>> ListAllBookingsWithDetails(string? userId=null)
  {
    var query = _db.Bookings.Where(b => userId == null || b.UserId == userId);

    return await query
        .Join(_db.Resources,
            b => b.ResourceId,
            r => r.Id,
            (b, r) => new { b, r })
        .Join(_db.Users,
            br => br.b.UserId,
            u => u.Id,
            (br, u) => new BookingDto
            {
                Id = br.b.Id,
                UserId = br.b.UserId,
                UserName = u.UserName!,
                ResourceId = br.b.ResourceId,
                ResourceName = br.r.Name,
                Date = br.b.Date,
                StartTime = br.b.StartTime,
                EndTime = br.b.EndTime
            })
        .ToListAsync();
}

public async Task<List<AnonymousBookingDto>> ListAllBookingsWithAnonimity(string? userId=null)
{
    var query = _db.Bookings.Where(b => userId == null || b.UserId == userId);

    return await query
        .Join(_db.Resources,
            b => b.ResourceId,
            r => r.Id,
            (b, r) => new { b, r })
        .Join(_db.Users,
            br => br.b.UserId,
            u => u.Id,
            (br, u) => new AnonymousBookingDto
            {
                Id = br.b.Id,
                UserId = br.b.UserId,
                ResourceId = br.b.ResourceId,
                ResourceName = br.r.Name,
                Date = br.b.Date,
                StartTime = br.b.StartTime,
                EndTime = br.b.EndTime
            })
        .ToListAsync();
}

  public async Task<bool> CancelBooking(Booking booking)
  {
    _db.Bookings.Remove(booking);
    await _db.SaveChangesAsync();
    return true;
  }

  public async Task<bool> HasConflictingBooking(int resourceId, DateOnly date, TimeOnly startTime, TimeOnly endTime)
  {

    return await _db.Bookings.AnyAsync(b =>
        b.ResourceId == resourceId &&
        b.Date == date &&
        startTime < b.EndTime &&
        endTime > b.StartTime);
  }

}
