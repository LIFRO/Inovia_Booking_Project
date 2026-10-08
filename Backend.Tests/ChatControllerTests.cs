using Backend.Controllers;
using Backend.Dto;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace Backend.Tests;

public class ChatControllerTests
{
    [Fact]
    public async Task ChatBot_WithEmptyMessage_ReturnsBadRequest()
    {
        var controller = new ChatController(null!);
        var request = new ChatRequest("   ", []);

        var result = await controller.ChatBot(request);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Theory]
    [InlineData("assistant", "assistant")]
    [InlineData("user", "user")]
    [InlineData("unexpected role", "user")]
    public void NormalizeChatRole_MapsHistoryRolesSafely(string inputRole, string expectedRole)
    {
        var role = ChatService.NormalizeChatRole(inputRole);

        Assert.Equal(expectedRole, role);
    }
}
