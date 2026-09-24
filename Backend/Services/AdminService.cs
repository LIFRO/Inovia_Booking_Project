using Backend.Models;
using Backend.Repository;
using Microsoft.AspNetCore.Identity;

namespace Backend.Services;

public class AdminService
{
    private readonly UserRepository _repo;
    private readonly PasswordHasher<User> _hasher;
    private readonly TokenService _tokenService;

    public AdminService(UserRepository repo, TokenService tokenService)
    {
        _repo = repo;
        _tokenService = tokenService;
        _hasher = new PasswordHasher<User>();
    }

    public async Task<LoginResponseDto> LoginUser(LoginUserDto user)
    {
        User? foundAdmin = await _repo.FindUserAsync(user.UserName);

        if (foundAdmin == null || foundAdmin.PasswordHash == null || foundAdmin.Role != Role.Admin)
            throw new UnauthorizedAccessException("Invalid username or password");

        var correctPasword = _hasher.VerifyHashedPassword(
            foundAdmin,
            foundAdmin.PasswordHash,
            user.Password
        );

        if (correctPasword == PasswordVerificationResult.Failed)
            throw new UnauthorizedAccessException("Invalid username or password");

        string token = _tokenService.CreateToken(foundAdmin);

        return new LoginResponseDto {
            UserName = foundAdmin.UserName!,
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
            Role = Role.Admin
        };

        var hash = _hasher.HashPassword(createdUser, user.Password);

        createdUser.PasswordHash = hash;

        UserCreatedOrLoggedIn createUser = await _repo.CreateUser(createdUser);

        return createUser;
    }

}
