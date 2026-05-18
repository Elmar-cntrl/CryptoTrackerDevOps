using CryptoTracker.Api.Data;
using CryptoTracker.Api.DTOs.TokenDtos;
using CryptoTracker.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CryptoTracker.Api.Controllers;

[ApiController]
[Route("api/admin/tokens")]
[Authorize(Roles = "Admin")]
public class AdminTokenController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminTokenController(AppDbContext context)
    {
        _context = context;
    }
    
    [HttpGet]
    public async Task<ActionResult<List<TokenReadDto>>> GetAll()
    {
        var tokens = await _context.Tokens
            .Select(t => new TokenReadDto
            {
                Id = t.Id,
                Name = t.Name,
                Symbol = t.Symbol,
                JupiterId = t.JupiterId,
                MexcSymbol = t.MexcSymbol,
                IsActive = t.IsActive
            })
            .ToListAsync();

        return Ok(tokens);
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<TokenReadDto>> GetById(int id)
    {
        var t = await _context.Tokens.FindAsync(id);
        if (t == null) return NotFound();

        var dto = new TokenReadDto
        {
            Id = t.Id,
            Name = t.Name,
            Symbol = t.Symbol,
            JupiterId = t.JupiterId,
            MexcSymbol = t.MexcSymbol,
            IsActive = t.IsActive
        };

        return Ok(dto);
    }
    
    [HttpPost]
    public async Task<ActionResult<TokenReadDto>> Create(TokenCreateDto dto)
    {
        var token = new Token
        {
            Name = dto.Name,
            Symbol = dto.Symbol,
            JupiterId = dto.JupiterId,
            MexcSymbol = dto.MexcSymbol,
            IsActive = true
        };

        _context.Tokens.Add(token);
        await _context.SaveChangesAsync();

        var readDto = new TokenReadDto
        {
            Id = token.Id,
            Name = token.Name,
            Symbol = token.Symbol,
            JupiterId = token.JupiterId,
            MexcSymbol = token.MexcSymbol,
            IsActive = token.IsActive
        };

        return Ok(readDto);
    }
    
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, TokenCreateDto updated)
    {
        var token = await _context.Tokens.FindAsync(id);
        if (token == null) return NotFound();

        token.Name = updated.Name;
        token.Symbol = updated.Symbol;
        token.JupiterId = updated.JupiterId;
        token.MexcSymbol = updated.MexcSymbol;

        await _context.SaveChangesAsync();

        var dto = new TokenReadDto
        {
            Id = token.Id,
            Name = token.Name,
            Symbol = token.Symbol,
            JupiterId = token.JupiterId,
            MexcSymbol = token.MexcSymbol,
            IsActive = token.IsActive
        };

        return Ok(dto);
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var token = await _context.Tokens.FindAsync(id);
        if (token == null) return NotFound();

        _context.Tokens.Remove(token);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}