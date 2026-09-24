using static System.Runtime.InteropServices.JavaScript.JSType;
namespace Backend.Dto;

public class CreateBookingDto
{
  public int ResourceId { get; set; }
  public string Name { get; set; } = string.Empty;
  public DateOnly Date { get; set; }
  public TimeOnly StartTime { get; set; }
  public TimeOnly EndTime { get; set; }
}
