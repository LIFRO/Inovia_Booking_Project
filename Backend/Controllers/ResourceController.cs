using Backend.Data;
using Backend.Dto;
using Backend.Models;
using Backend.Repository;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ResourceController(ResourceRepository repo) : ControllerBase
{

    private readonly ResourceRepository _repo = repo;
    
    //hämtar alla tillgängliga resurser
    [HttpGet]
    public async Task<IActionResult> GetAllResources()
    {
        var resources = await _repo.ListResources();
        var dtos = resources.Select(r => new ResourceDto
        {
            Id = r.Id,
            Name = r.Name,
            Type = r.Type
        });

        return Ok(dtos);
    }

    [HttpGet("availability")]
    public async Task<IActionResult> GetAvailability()
    {
        var now = DateTime.Now;
        var summary = await _repo.GetAvailabilitySummary(
            DateOnly.FromDateTime(now), TimeOnly.FromDateTime(now));
        return Ok(summary);
    }
}

