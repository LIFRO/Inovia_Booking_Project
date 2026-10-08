using Backend.Dto;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
    [HttpPost("ChatBot")]
    public async Task<IActionResult> ChatBot([FromBody] ChatRequest request)
    {
        var reply = await _service.ChatBot(request.Message, request.History);

        return Ok(reply);
    }
}
