using Backend.Dto;

namespace Backend.Services;

public interface IBookingNotifier
{
    Task BookingCreated(BookingDto booking);
    Task BookingCancelled(BookingDto booking); // För user bokningar
    Task BookingDeleted(BookingDto booking); // För admins
}
