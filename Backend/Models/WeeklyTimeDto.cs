namespace Backend.Models;

public class WeeklyTimeDto
{
  public int DayNumber { get; set; }
  public DateOnly AvailableDate { get; set; }
  public TimeOnly AvailableTime { get; set; }
    
}
