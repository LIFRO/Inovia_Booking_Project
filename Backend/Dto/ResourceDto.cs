using Backend.Models;

namespace Backend.Dto;

public class ResourceDto
{
  public int Id { get; set; }
  public ResourceType Type { get; set; }
  public string Name { get; set; } = string.Empty;
}
