using Backend.Data;
using Backend.Dto;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repository;

public class ResourceRepository(AppDbContext db)
{
  private readonly AppDbContext _db = db;

  public async Task<List<Resource>> ListResources()
  {
    return await _db.Resources.ToListAsync();
  }

  public async Task<Resource?> GetById(int id)
{
    return await _db.Resources.FindAsync(id);
}

  public async Task<List<ResourceAvailabilityDto>> GetAvailabilitySummary(DateOnly date, TimeOnly time)
  {
    var bookedResourceIds = await _db.Bookings
      .Where(b => b.Date == date && b.StartTime <= time && b.EndTime > time)
      .Select(b => b.ResourceId)
      .ToListAsync();

      var resources = await _db.Resources.ToListAsync();

      return resources
        .GroupBy(r => r.Type)
        .Select(g => new ResourceAvailabilityDto
        {
          Type = g.Key.ToString(),
          Total = g.Count(),
          Available = g.Count(r => !bookedResourceIds.Contains(r.Id))
        })
        .ToList();
  }
}
