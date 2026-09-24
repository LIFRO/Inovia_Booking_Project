using System.Text.Json.Serialization;

namespace Backend.Models;
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ResourceType
{
  MeetingRoom,
  Desk,
  VRHeadset,
  AIServer
}

public class Resource
{
  public int Id { get; set; }
  public ResourceType Type { get; set; }
  public string Name { get; set; } = string.Empty;

}

