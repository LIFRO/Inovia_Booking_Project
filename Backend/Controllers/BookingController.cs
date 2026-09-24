using System.Security.Claims;
using Backend.Data;
using Backend.Dto;
using Backend.Models;
using Backend.Repository;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Backend.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class BookingController(BookingService service, IBookingNotifier notifier, ResourceRepository resource) : ControllerBase
{

    private readonly BookingService _service = service;
    private readonly IBookingNotifier _notifier = notifier;
    private readonly ResourceRepository _resource = resource;

    //User och/eller Admin kan hämta endast sina egna bokningar
    [HttpGet]
    public async Task<IActionResult> GetMyBookings()
    {

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var bookings = await _service.ListAllBookingsWithDetails(currentUserId!);

        return Ok(bookings);
    }

    //Admin kan hämta allas bokningar ()
    [HttpGet("all")]
    public async Task<IActionResult> GetAllBookings()
    {
        if(User.IsInRole("Admin"))
        {
            var bookings = await _service.ListAllBookingsWithDetails();
            return Ok(bookings);
        }

        if (User.IsInRole("User"))
        {
            var bookings = await _service.ListAllBookingsWithAnonimity();
            return Ok(bookings);
        }

        return Unauthorized();
    }

    //User kan hämta en av sina bokningar, Admin kan hämta en bokning av allas bokningar
    [HttpGet("{id}")]
    public async Task<IActionResult> GetMyBooking(int id)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var booking = await _service.GetBooking(id, currentUserId!);
        if (booking is null) return NotFound();

        if (booking.UserId != currentUserId && !isAdmin)
            return Forbid();

        return Ok(booking);
    }
    //User och Admin kan skapa bokningar till sig själva
    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var currentUserName = User.FindFirstValue(ClaimTypes.Name);

        var resource = await _resource.GetById(dto.ResourceId);
        if (resource is null) return NotFound();

        var booking = new Booking
        {
            UserId = currentUserId!,
            ResourceId = dto.ResourceId,
            Date = dto.Date,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime
        };

        var result = await _service.CreateBooking(booking);
        if (!result.Succeeded)
            return BadRequest(result.Error);

        try
        {
            await _notifier.BookingCreated(ToDto(booking, resource.Name, currentUserName ?? ""));
        }
        catch
        {
            Console.WriteLine("Notification failed for created booking");
        }

        var bookingDto = ToDto(booking, resource.Name, currentUserName ?? "");
        return CreatedAtAction(nameof(GetMyBooking), new { id= booking.Id }, bookingDto);
    }

    //User kan radera sina egna bokningar och Admin kan radera allas bokningar
    [HttpDelete("{id}")]
    public async Task<IActionResult> CancelBooking(int id)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var currentUserName = User.FindFirstValue(ClaimTypes.Name);
        var isAdmin = User.IsInRole("Admin");
        var booking = await _service.GetBooking(id);

        if (booking is null)
        {
            return NotFound();
        }

        var resource = await _resource.GetById(booking.ResourceId);

        var result = await _service.CancelBooking(id, currentUserId!, isAdmin);
        if (!result.Succeeded)
            return BadRequest(result.Error);

        try
        {
            await _notifier.BookingCancelled(booking);
        }
        catch
        {
            Console.WriteLine("Notification failed for cancelbooking");
        }

        return NoContent();
    }

    //listar alla datum och tider som går att boka
    [HttpGet("weekly-times")]
    public async Task<IActionResult> GetWeeklyTimes([FromQuery] DateOnly date)
    {
        var times = await _service.GetWeeklyTimes(date);
        return Ok(times);

    }

  private static BookingDto ToDto(Booking b, string resourceName, string userName) => new()
  {
      Id = b.Id,
      UserId = b.UserId,
      UserName = userName,
      ResourceId = b.ResourceId,
      ResourceName = resourceName,
      Date = b.Date,
      StartTime = b.StartTime,
      EndTime = b.EndTime,
  };

}
