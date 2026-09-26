using Backend.Dto;
using Backend.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Services;

public class BookingNotifier : IBookingNotifier
{
    private readonly IHubContext<BookingHub> _hub;

    public BookingNotifier(IHubContext<BookingHub> hub) => _hub = hub;

    public async Task BookingCreated(BookingDto booking)
    {
        var publicBooking = new
        {
            booking.Id,
            booking.ResourceId,
            booking.ResourceName,
            booking.Date,
            booking.StartTime,
            booking.EndTime
        };

        await _hub.Clients.All.SendAsync("BookingCreated", publicBooking);
        await _hub.Clients.Groups($"user-{booking.UserId}", "admins")
            .SendAsync("BookingCreatedPrivate", booking);
    }
    
    public Task BookingCancelled(BookingDto booking) =>
        _hub.Clients.All.SendAsync("BookingCancelled", new { booking.Id });

    public Task BookingDeleted(BookingDto booking) =>
        _hub.Clients.Group("admins").SendAsync("BookingDeleted", booking);
}
