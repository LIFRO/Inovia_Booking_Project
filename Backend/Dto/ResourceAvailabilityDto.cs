namespace Backend.Dto;

public class ResourceAvailabilityDto
{
    public string Type { get; set; } = string.Empty;
    public int Total { get; set; }
    public int Available { get; set; }
}