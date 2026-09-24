using Backend.Models;
using Backend.Dto;
public class BookingService(BookingRepository repo)
{
  private readonly BookingRepository _repo = repo;

    public async Task<List<WeeklyTimeDto>> GetWeeklyTimes(DateOnly date)
  {
    return await _repo.GetWeeklyTimes(date);
  }

  public async Task<BookingResult> CreateBooking(Booking bookingToCreate)
  {
    var validationError = await ValidateBooking(bookingToCreate);
    if (validationError is not null)
      return BookingResult.Failure(validationError);

    var created = await _repo.CreateBooking(bookingToCreate);
    return created
    ? BookingResult.Success()
    : BookingResult.Failure("Failed to save booking");
  }

    public async Task<BookingDto?> GetBooking(int id, string? userId=null)
  {
    return await _repo.GetByIdWithDetails(id, userId);
  }

  public async Task<List<BookingDto>> ListAllBookingsWithDetails(string userId)
  {
    return await _repo.ListAllBookingsWithDetails(userId);
  }

  public async Task<List<AnonymousBookingDto>> ListAllBookingsWithAnonimity()
  {
    return await _repo.ListAllBookingsWithAnonimity();
  }

  public async Task<List<BookingDto>> ListAllBookingsWithDetails()
  {
    return await _repo.ListAllBookingsWithDetails();
  }

  private async Task<string?> ValidateBooking(Booking booking)
    {
        if (!IsFullHour(booking.StartTime) || !IsFullHour(booking.EndTime))
          return "Booking must start and end on full hours";

        if (booking.EndTime <= booking.StartTime)
      return "Starttime have to be before endtime";

    if (booking.Date < DateOnly.FromDateTime(DateTime.UtcNow) ||
        (booking.Date == DateOnly.FromDateTime(DateTime.UtcNow) &&
        booking.StartTime < TimeOnly.FromDateTime(DateTime.UtcNow)))
      return "Can not book already passed time";

    var hasConflict = await _repo.HasConflictingBooking(
        booking.ResourceId, booking.Date, booking.StartTime, booking.EndTime);

    if (hasConflict)
      return "Resource is already booked this time";

    return null;
    }

    private static bool IsFullHour(TimeOnly time) => time.Minute == 0 && time.Second == 0; 


    public async Task<BookingResult> CancelBooking(int id, string userId, bool isAdmin)
  {
    var booking = await _repo.GetById(id);
    if (booking is null)
      return BookingResult.Failure("Can not find booking");
    if (booking.UserId != userId && !isAdmin)
      return BookingResult.Failure("No access");

    var removed = await _repo.CancelBooking(booking);
    return removed
    ? BookingResult.Success()
    : BookingResult.Failure("Could not delete booking");
  }


  public class BookingResult
  {
    public bool Succeeded { get; set; }
    public string? Error { get; set; }

    public static BookingResult Success() => new() { Succeeded = true };
    public static BookingResult Failure(string error) => new() { Succeeded = false, Error = error };
  }
}