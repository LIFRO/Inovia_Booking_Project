namespace Backend.Dto;

public class AnonymousBookingDto
{
  public int Id { get; set; }
  public int ResourceId { get; set; }
  public string UserId { get; set; } = string.Empty;
  public string ResourceName { get; set; } = string.Empty;
  public DateOnly Date { get; set; }
  public TimeOnly StartTime { get; set; }
  public TimeOnly EndTime { get; set; }
}