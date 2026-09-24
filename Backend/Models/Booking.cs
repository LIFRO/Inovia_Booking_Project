namespace Backend.Models;

public class Booking
{
  public int Id { get; set; }
  public int ResourceId { get; set; }
  public string UserId { get; set; } = string.Empty;
  public User? User { get; set; }
  public DateOnly Date { get; set; }
  public TimeOnly StartTime { get; set;  }
  public TimeOnly EndTime { get; set; }
}
