using System.Security.Claims;
using CryptoTracker.Api.Data;
using CryptoTracker.Api.DTOs.TradeDtos;
using CryptoTracker.Api.Entities;
using CryptoTracker.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CryptoTracker.Api.Controllers;

[ApiController]
[Route("api/trades")]
[Authorize]
public class TradeController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly TradeCalculator _calc;

    public TradeController(AppDbContext context, TradeCalculator calc)
    {
        _context = context;
        _calc = calc;
    }

    private int GetUserId()
    {
        return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
    }
    
    [HttpPost]
    public async Task<ActionResult<TradeReadDto>> Create(TradeCreateDto dto)
    {
        int userId = GetUserId();

        var token = await _context.Tokens.FindAsync(dto.TokenId);
        if (token == null)
            return NotFound("Token not found");

        decimal profit = _calc.CalculateProfit(dto.StartAmount, dto.EndAmount);
        decimal profitPercent = _calc.CalculateProfitPercent(dto.StartAmount, dto.EndAmount);

        var trade = new Trade
        {
            UserId = userId,
            TokenId = dto.TokenId,

            StartAmount = dto.StartAmount,
            EndAmount = dto.EndAmount,

            ProfitAmount = profit,
            ProfitPercent = profitPercent,

            BuyExchange = dto.BuyExchange,
            SellExchange = dto.SellExchange
        };

        _context.Trades.Add(trade);
        await _context.SaveChangesAsync();

        return Ok(new TradeReadDto
        {
            Id = trade.Id,
            TokenId = token.Id,
            Symbol = token.Symbol,

            StartAmount = trade.StartAmount,
            EndAmount = trade.EndAmount,

            ProfitAmount = trade.ProfitAmount,
            ProfitPercent = trade.ProfitPercent,

            BuyExchange = trade.BuyExchange,
            SellExchange = trade.SellExchange,

            CreatedAt = trade.CreatedAt
        });
    }
    
    [HttpGet]
    public async Task<ActionResult<List<TradeReadDto>>> GetMyTrades()
    {
        int userId = GetUserId();

        var trades = await _context.Trades
            .Include(x => x.Token)
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new TradeReadDto
            {
                Id = x.Id,
                TokenId = x.TokenId,
                Symbol = x.Token.Symbol,

                StartAmount = x.StartAmount,
                EndAmount = x.EndAmount,

                ProfitAmount = x.ProfitAmount,
                ProfitPercent = x.ProfitPercent,

                BuyExchange = x.BuyExchange,
                SellExchange = x.SellExchange,

                CreatedAt = x.CreatedAt
            })
            .ToListAsync();

        return Ok(trades);
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        int userId = GetUserId();

        var trade = await _context.Trades
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (trade == null)
            return NotFound();

        _context.Trades.Remove(trade);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}