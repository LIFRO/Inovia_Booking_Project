using Backend.Data;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminController(IBookingNotifier notifier, AdminService service) : ControllerBase
{
    private readonly IBookingNotifier _notifier = notifier;
    private readonly AdminService _service = service;

    //Login för Admin

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginUserDto user)
    {
        try
        {
            LoginResponseDto result = await _service.LoginUser(user);
            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("Invalid username or password");
        }
    }

    //Bara admin kan registrera ny admin
    [Authorize (Roles = "Admin")]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] CreateUserDto user)
    {
        try
        {
            await _service.RegisterUser(user);
        }
        catch (ArgumentException)
        {
            return StatusCode(409, "Invalid username or password");
        }
        LoginUserDto login = new LoginUserDto {
            UserName = user.UserName,
            Password = user.Password!,
        };

        LoginResponseDto result = await _service.LoginUser(login);

        return Ok(result);
    }
}
