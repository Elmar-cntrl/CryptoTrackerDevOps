using System.Security.Claims;
using CryptoTracker.Api.Data;
using CryptoTracker.Api.DTOs.AlertDtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CryptoTracker.Api.Controllers;

[ApiController]
[Route("api/alerts")]
[Authorize]
public class AlertController : ControllerBase
{
    private readonly AppDbContext _context;

    public AlertController(AppDbContext context)
    {
        _context = context;
    }

    private int GetUserId()
    {
        return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
    }
    
    [HttpGet]
    public async Task<ActionResult<List<AlertReadDto>>> GetMyAlerts()
    {
        int userId = GetUserId();

        var alerts = await _context.SpreadAlerts
            .Include(x => x.Token)
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .Take(200)
            .Select(x => new AlertReadDto
            {
                Id = x.Id,
                TokenId = x.TokenId,
                Symbol = x.Token.Symbol,

                JupiterPrice = x.JupiterPrice,
                MexcPrice = x.MexcPrice,

                SpreadPercent = x.SpreadPercent,
                Type = x.Type,

                CreatedAt = x.CreatedAt
            })
            .ToListAsync();

        return Ok(alerts);
    }
    
    [HttpDelete("clear")]
    public async Task<IActionResult> Clear()
    {
        int userId = GetUserId();

        var alerts = await _context.SpreadAlerts
            .Where(x => x.UserId == userId)
            .ToListAsync();

        _context.SpreadAlerts.RemoveRange(alerts);
        await _context.SaveChangesAsync();

        return Ok("Alerts cleared");
    }
}