using Backend.Models;
using Microsoft.AspNetCore.Identity;

namespace Backend.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext db)
    {
        if (!db.Resources.Any())
        {
        db.Resources.AddRange(
            new Resource { Id = 1, Type = ResourceType.MeetingRoom, Name = "Mötesrum A" },
            new Resource { Id = 2, Type = ResourceType.MeetingRoom, Name = "Mötesrum B" },
            new Resource { Id = 3, Type = ResourceType.MeetingRoom, Name = "Mötesrum C" },
            new Resource { Id = 4, Type = ResourceType.MeetingRoom, Name = "Mötesrum D" },
            new Resource { Id = 5, Type = ResourceType.VRHeadset, Name = "VR-headset 1" },
            new Resource { Id = 6, Type = ResourceType.VRHeadset, Name = "VR-headset 2" },
            new Resource { Id = 7, Type = ResourceType.VRHeadset, Name = "VR-headset 3" },
            new Resource { Id = 8, Type = ResourceType.VRHeadset, Name = "VR-headset 4" },
            new Resource { Id = 9, Type = ResourceType.AIServer, Name = "AI-server Alpha" },
            new Resource { Id = 10, Type = ResourceType.Desk, Name = "Desk #1" },
            new Resource { Id = 11, Type = ResourceType.Desk, Name = "Desk #2" },
            new Resource { Id = 12, Type = ResourceType.Desk, Name = "Desk #3" },
            new Resource { Id = 13, Type = ResourceType.Desk, Name = "Desk #4" },
            new Resource { Id = 14, Type = ResourceType.Desk, Name = "Desk #5" },
            new Resource { Id = 15, Type = ResourceType.Desk, Name = "Desk #6" },
            new Resource { Id = 16, Type = ResourceType.Desk, Name = "Desk #7" },
            new Resource { Id = 17, Type = ResourceType.Desk, Name = "Desk #8" },
            new Resource { Id = 18, Type = ResourceType.Desk, Name = "Desk #9" },
            new Resource { Id = 19, Type = ResourceType.Desk, Name = "Desk #10" },
            new Resource { Id = 20, Type = ResourceType.Desk, Name = "Desk #11" },
            new Resource { Id = 21, Type = ResourceType.Desk, Name = "Desk #12" },
            new Resource { Id = 22, Type = ResourceType.Desk, Name = "Desk #13" },
            new Resource { Id = 23, Type = ResourceType.Desk, Name = "Desk #14" },
            new Resource { Id = 24, Type = ResourceType.Desk, Name = "Desk #15" }
            );
        }

        if (!db.Users.Any(u => u.Role == Role.Admin))
        {
            var hasher = new PasswordHasher<User>();
            var admin = new User
            {
                Email = "admin@example.com",
                UserName = "admin",
                Role = Role.Admin
            };
            admin.PasswordHash = hasher.HashPassword(admin, "Admin123!");
            db.Users.Add(admin);
        }

        db.SaveChanges();
    }
}
