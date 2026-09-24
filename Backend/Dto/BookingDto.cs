using static System.Runtime.InteropServices.JavaScript.JSType;
namespace Backend.Dto;

public class BookingDto
{
  public int Id { get; set; }
  public int ResourceId { get; set; }
  public string UserId { get; set; } = string.Empty;
  public string UserName { get; set; } = string.Empty;
  public string ResourceName { get; set; } = string.Empty;
  public DateOnly Date { get; set; }
  public TimeOnly StartTime { get; set; }
  public TimeOnly EndTime { get; set; }
}
