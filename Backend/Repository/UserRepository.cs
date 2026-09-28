using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repository;

public class UserRepository(AppDbContext db)
{

    private readonly AppDbContext _db = db;
    public async Task<User?> FindUserAsync(string userName)
    {
        //NOTE: This function is used to find and return a user;
        return await _db.Users.FirstOrDefaultAsync(u => u.UserName != null && u.UserName.ToLower() == userName.ToLower());
    }

    public async Task<bool> DoesUserExist(string userName, string email)
    {
        return await _db.Users.AnyAsync(u => u.UserName == userName || u.Email == email);
    }

    public async Task<UserCreatedOrLoggedIn> CreateUser(User user)
    {
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return new UserCreatedOrLoggedIn
        {
            UserName = user.UserName!,
            Succeded = true
        };
    }
}
