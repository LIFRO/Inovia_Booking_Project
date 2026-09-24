using Backend.Dto;
using Backend.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Services;

public class BookingNotifier : IBookingNotifier
{
    private readonly IHubContext<BookingHub> _hub;

    public BookingNotifier(IHubContext<BookingHub> hub) => _hub = hub;

    public Task BookingCreated(BookingDto booking) =>
        _hub.Clients.All.SendAsync("BookingCreated", booking);
    
    public Task BookingCancelled(BookingDto booking) => 
        _hub.Clients.Group($"user-{booking.UserId}").SendAsync("BookingCancelled", booking);

    public Task BookingDeleted(BookingDto booking) =>
        _hub.Clients.Group("admins").SendAsync("BookingDeleted", booking);
}
