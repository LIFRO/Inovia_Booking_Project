using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{

    private readonly UserService _service;

    public UserController(UserService service) => _service = service;

    //login för en user
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

    //registrering för en user
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
