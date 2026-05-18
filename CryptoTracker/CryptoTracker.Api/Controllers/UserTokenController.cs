using System.Security.Claims;
using CryptoTracker.Api.Data;
using CryptoTracker.Api.DTOs.UserTokenDtos;
using CryptoTracker.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CryptoTracker.Api.Controllers;

[ApiController]
[Route("api/user/tokens")]
[Authorize]
public class UserTokenController : ControllerBase
{
    private readonly AppDbContext _context;

    public UserTokenController(AppDbContext context)
    {
        _context = context;
    }

    private int GetUserId()
    {
        return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
    }
    
    
    // ✅ Получить все доступные токены (не только отслеживаемые)
    [HttpGet("all")]
    public async Task<ActionResult<List<object>>> GetAllTokens()
    {
        var tokens = await _context.Tokens
            .Where(t => t.IsActive) // если хочешь только активные, иначе убери этот фильтр
            .Select(t => new 
            {
                t.Id,
                t.Symbol,
                t.Name,       // если есть имя токена
                t.IsActive
            })
            .ToListAsync();

        return Ok(tokens);
    }

    // ✅ Получить все токены пользователя (отслеживаемые токены)
    [HttpGet]
    public async Task<ActionResult<List<UserTokenReadDto>>> GetMyTokens()
    {
        int userId = GetUserId();

        var settings = await _context.UserTokenSettings
            .Include(x => x.Token)
            .Where(x => x.UserId == userId)
            .Select(x => new UserTokenReadDto
            {
                Id = x.Id,
                TokenId = x.TokenId,
                Symbol = x.Token.Symbol,
                RightSpreadPercent = x.RightSpreadPercent,
                BackSpreadPercent = x.BackSpreadPercent
            })
            .ToListAsync();

        return Ok(settings);
    }

    // ✅ Добавить токен в отслеживание
    [HttpPost]
    public async Task<ActionResult<UserTokenReadDto>> AddToken(UserTokenCreateDto dto)
    {
        int userId = GetUserId();

        var token = await _context.Tokens.FindAsync(dto.TokenId);
        if (token == null)
            return NotFound("Token not found");

        bool alreadyExists = await _context.UserTokenSettings
            .AnyAsync(x => x.UserId == userId && x.TokenId == dto.TokenId);

        if (alreadyExists)
            return BadRequest("Token already added");

        var setting = new UserTokenSetting
        {
            UserId = userId,
            TokenId = dto.TokenId,
            RightSpreadPercent = dto.RightSpreadPercent,
            BackSpreadPercent = dto.BackSpreadPercent
        };

        _context.UserTokenSettings.Add(setting);
        await _context.SaveChangesAsync();

        return Ok(new UserTokenReadDto
        {
            Id = setting.Id,
            TokenId = setting.TokenId,
            Symbol = token.Symbol,
            RightSpreadPercent = setting.RightSpreadPercent,
            BackSpreadPercent = setting.BackSpreadPercent
        });
    }

// ✅ Обновить spread по TokenId
    [HttpPut("{tokenId}")]
    public async Task<ActionResult<UserTokenReadDto>> UpdateToken(int tokenId, UserTokenUpdateDto dto)
    {
        int userId = GetUserId();

        var setting = await _context.UserTokenSettings
            .Include(x => x.Token)
            .FirstOrDefaultAsync(x => x.TokenId == tokenId && x.UserId == userId);

        if (setting == null)
            return NotFound("Token not tracked by user");

        setting.RightSpreadPercent = dto.RightSpreadPercent;
        setting.BackSpreadPercent = dto.BackSpreadPercent;

        await _context.SaveChangesAsync();

        return Ok(new UserTokenReadDto
        {
            TokenId = setting.TokenId,
            Symbol = setting.Token.Symbol,
            RightSpreadPercent = setting.RightSpreadPercent,
            BackSpreadPercent = setting.BackSpreadPercent
        });
    }

// ✅ Удалить токен из отслеживания по TokenId
    [HttpDelete("{tokenId}")]
    public async Task<IActionResult> RemoveToken(int tokenId)
    {
        int userId = GetUserId();

        var setting = await _context.UserTokenSettings
            .FirstOrDefaultAsync(x => x.TokenId == tokenId && x.UserId == userId);

        if (setting == null)
            return NotFound("Token not tracked by user");

        _context.UserTokenSettings.Remove(setting);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // ✅ Включить отслеживание ВСЕХ токенов (создаёт записи если их нет)
    [HttpPost("activate-all")]
    public async Task<IActionResult> ActivateAll()
    {
        int userId = GetUserId();

        var allTokens = await _context.Tokens
            .Where(t => t.IsActive)
            .ToListAsync();

        var existingTokenIds = await _context.UserTokenSettings
            .Where(x => x.UserId == userId)
            .Select(x => x.TokenId)
            .ToListAsync();

        var existingSet = existingTokenIds.ToHashSet();

        foreach (var token in allTokens)
        {
            if (!existingSet.Contains(token.Id))
            {
                _context.UserTokenSettings.Add(new UserTokenSetting
                {
                    UserId = userId,
                    TokenId = token.Id,
                    RightSpreadPercent = 3,
                    BackSpreadPercent = 0.3m
                });
            }
        }

        await _context.SaveChangesAsync();

        return Ok("All tokens are now tracked");
    }

    // ❌ Отключить отслеживание ВСЕХ токенов (удаляет все записи)
    [HttpDelete("deactivate-all")]
    public async Task<IActionResult> DeactivateAll()
    {
        int userId = GetUserId();

        int deleted = await _context.UserTokenSettings
            .Where(x => x.UserId == userId)
            .ExecuteDeleteAsync();

        return Ok(new
        {
            message = "All tracked tokens deleted",
            deletedRows = deleted
        });
    }

    // ✅ Установить один spread всем токенам сразу
    [HttpPut("set-global-spread")]
    public async Task<IActionResult> SetGlobalSpread(GlobalSpreadDto dto)
    {
        int userId = GetUserId();

        int updated = await _context.UserTokenSettings
            .Where(x => x.UserId == userId)
            .ExecuteUpdateAsync(setters =>
                setters
                    .SetProperty(x => x.RightSpreadPercent, dto.RightSpreadPercent)
                    .SetProperty(x => x.BackSpreadPercent, dto.BackSpreadPercent));

        return Ok(new
        {
            message = "Global spread updated",
            updatedRows = updated
        });
    }
}