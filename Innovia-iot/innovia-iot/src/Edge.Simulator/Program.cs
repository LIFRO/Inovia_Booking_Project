using MQTTnet;
using MQTTnet.Client;
using System.Text.Json;
using System.Text;
using System.Net.Http.Json;

var registry = new HttpClient { BaseAddress = new Uri("http://localhost:5101") };
var portal = new HttpClient { BaseAddress = new Uri("http://localhost:5104") };

var tenant = await registry.GetFromJsonAsync<Tenant>(
    "/api/tenants/by-slug/innovia"
);

var devices = await registry.GetFromJsonAsync<List<Device>>(
                  $"/api/tenants/{tenant!.Id}/devices"
              ) ??
              [];

var factory = new MqttFactory();
var client = factory.CreateMqttClient();

var options = new MqttClientOptionsBuilder()
                  .WithTcpServer("localhost", 1883)
                  .Build();

Console.WriteLine("Edge.Simulator starting… connecting to MQTT at localhost:1883");
try
{
    await client.ConnectAsync(options);
    Console.WriteLine("✅ Connected to MQTT broker.");
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Failed to connect to MQTT broker: {ex.Message}");
    throw;
}

var rand = new Random();

async Task<double> RandomTemp(Device dev)
{
    var recent_reading = await portal.GetFromJsonAsync<LatestReading>(
        $"/portal/{tenant!.Id}/devices/{dev!.Id}/latest?type=temperature"
    );

    double temp = recent_reading?.point?.V ?? 22.0;

    double change = rand.NextDouble() * 2;

    return temp <= 0 ? temp + change : rand.Next(0, 2) == 1 ? temp + change
                                                            : Math.Max(0, temp - change);
};

async Task<double> RandomCO2(Device dev)
{
    var recent_reading = await portal.GetFromJsonAsync<LatestReading>(
        $"/portal/{tenant!.Id}/devices/{dev!.Id}/latest?type=co2"
    );

    double co2 = recent_reading?.point?.V ?? 900;

    int change = rand.Next(0, 700);

    return co2 <= 200 ? co2 + change : rand.Next(0, 2) == 1 ? co2 + change
                                                            : Math.Max(200, co2 - change);
}

while (true)
{
    foreach (var device in devices)
    {
        var payload = new {
            deviceId = device.Serial,
            apiKey = $"{device.Serial}--key",
            timestamp = DateTimeOffset.UtcNow,
            metrics = new[] {
                new {
                    type = "temperature",
                    value = await RandomTemp(device),
                    unit = "C"
                },
                new { type = "co2", value = await RandomCO2(device), unit = "ppm" }
            }
        };
        var topic = $"tenants/innovia/devices/{device.Serial}/measurements";
        var json = JsonSerializer.Serialize(payload);

        var message = new MqttApplicationMessageBuilder()
                          .WithTopic(topic)
                          .WithPayload(Encoding.UTF8.GetBytes(json))
                          .Build();

        await client.PublishAsync(message);
        Console.WriteLine($"[{DateTimeOffset.UtcNow:o}] Published to '{topic}': {json}");
    }

    await Task.Delay(TimeSpan.FromSeconds(1));
}

record Tenant(Guid Id, string Name, string Slug);

record Device(
    Guid Id,
    Guid TenantId,
    Guid? RoomId,
    string Model,
    string Serial,
    string Status
);

record LatestReading(
    Guid Id,
    string type,
    ReadingPoint point
);

record ReadingPoint(
    DateTimeOffset T,
    double V
);
