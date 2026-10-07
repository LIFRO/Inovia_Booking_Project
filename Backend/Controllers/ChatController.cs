using Backend.Dto;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Backend.Controllers;

[ApiController]
[Route("api/chat")]
public class ChatController(ChatService service) : ControllerBase
{
    private readonly ChatService _service = service;

    [Authorize]
    [HttpPost("ChatBot")]
    public async Task<IActionResult> ChatBot ([FromBody] String essage)
    {
	service.	
    }
}
