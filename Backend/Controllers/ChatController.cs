using Backend.Dto;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Backend.Controllers;

[ApiController]
[Route("api/chat")]
public class ChatController
    : ControllerBase
{
    private readonly ChatService _service;

    public ChatController(ChatService service)
    {
        _service = service;
    }

    [Authorize]
    [EnableRateLimiting("chatbot")]
    [HttpPost("ChatBot")]
    public async Task<IActionResult> ChatBot([FromBody] ChatRequest request)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { error = "Message is required." });

        if (request.Message.Length > ChatRequestLimits.MaxMessageLength)
            return BadRequest(new { error = $"Message must be at most {ChatRequestLimits.MaxMessageLength} characters." });

        if (request.History is null || request.History.Count > ChatRequestLimits.MaxHistoryMessages)
            return BadRequest(new { error = $"History may contain at most {ChatRequestLimits.MaxHistoryMessages} messages." });

        if (request.History.Any(item =>
                item.Message.Length > ChatRequestLimits.MaxMessageLength ||
                (item.Role != "user" && item.Role != "assistant")))
            return BadRequest(new { error = "History contains an invalid message." });

        var reply = await _service.ChatBot(request.Message, request.History);

        return Ok(reply);
    }
}
