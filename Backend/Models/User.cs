using Microsoft.AspNetCore.Identity;

namespace Backend.Models;

public class User : IdentityUser
{
    public Role Role { get; set; }
}

public enum Role
{
    User,
    Admin

}

public class CreateUserDto
{
    public string Email { get; set; } = "";
    public string UserName { get; set; } = "";
    public string? Password { get; set; }
}

public class LoginUserDto
{
    public string UserName { get; set; } = "";
    public string Password { get; set; } = "";
}

public class LoginResponseDto
{
    public string UserName { get; set; } = "";
    public string AccessToken { get; set; } = "";
}
