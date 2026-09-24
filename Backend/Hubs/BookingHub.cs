using Microsoft.AspNetCore.SignalR;

namespace Backend.Hubs;

public class BookingHub : Hub
{
    // Klienten anropar denna direkt efter connect för att tala om vem den är
    public async Task Register(string userId, bool isAdmin)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");
        if (isAdmin)
            await Groups.AddToGroupAsync(Context.ConnectionId, "admins");
    }
}
