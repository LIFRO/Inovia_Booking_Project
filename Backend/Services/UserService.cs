using Microsoft.AspNetCore.Identity;
using Backend.Repository;
using Backend.Models;

public class UserService
{
    private readonly UserRepository _repo;
    private readonly PasswordHasher<User> _hasher;
    private readonly TokenService _tokenService;

    public UserService(UserRepository repo, TokenService tokenService)
    {
        _repo = repo;
        _tokenService = tokenService;
        _hasher = new PasswordHasher<User>();
    }

    public async Task<LoginResponseDto> LoginUser(LoginUserDto user)
    {
        User? foundUser = await _repo.FindUserAsync(user.UserName);

        if (foundUser == null || foundUser.PasswordHash == null)
            throw new UnauthorizedAccessException("Invalid username or password");

        var correctPasword = _hasher.VerifyHashedPassword(
            foundUser,
            foundUser.PasswordHash,
            user.Password
        );

        if (correctPasword == PasswordVerificationResult.Failed)
            throw new UnauthorizedAccessException("Invalid username or password");

        string token = _tokenService.CreateToken(foundUser);

        return new LoginResponseDto {
            UserName = foundUser.UserName!,
            AccessToken = token
        };
    }

    public async Task<UserCreatedOrLoggedIn> RegisterUser(CreateUserDto user)
    {
        if (user.Password == null)
            throw new Exception("Password cant be null");

        if (await _repo.DoesUserExist(user.UserName, user.Email))
            throw new ArgumentException("Email or username already exists");

        User createdUser = new User {
            Email = user.Email,
            UserName = user.UserName,
            Role = Role.User
        };

        var hash = _hasher.HashPassword(createdUser, user.Password);

        createdUser.PasswordHash = hash;

        UserCreatedOrLoggedIn createUser = await _repo.CreateUser(createdUser);

        return createUser;
    }
}
