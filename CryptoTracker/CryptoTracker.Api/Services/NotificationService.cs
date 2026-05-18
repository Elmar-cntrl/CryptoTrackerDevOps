using CryptoTracker.Api.Data;
using CryptoTracker.Api.DTOs.NotificationDtos;
using CryptoTracker.Api.Entities;
using CryptoTracker.Api.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace CryptoTracker.Api.Services;

public class NotificationService
{
    private readonly IHubContext<NotificationHub> _hub;
    private readonly AppDbContext _context;

    public NotificationService(IHubContext<NotificationHub> hub, AppDbContext context)
    {
        _hub = hub;
        _context = context;
    }

    public async Task SendToUserAsync(int userId, SpreadAlertDto dto)
    {
        Console.WriteLine($"[{dto.Type}] {dto.TokenSymbol} | Spread: {dto.SpreadPercent:F2}%");

        // сохр в базу
        var token = await _context.Tokens.FirstOrDefaultAsync(x => x.Symbol == dto.TokenSymbol);

        if (token != null)
        {
            _context.SpreadAlerts.Add(new SpreadAlert
            {
                UserId = userId,
                TokenId = token.Id,

                JupiterPrice = dto.JupiterPrice,
                MexcPrice = dto.MexcPrice,

                SpreadPercent = dto.SpreadPercent,
                Type = dto.Type
            });

            await _context.SaveChangesAsync();
        }

        // отправляем по сигналR
        await _hub.Clients.User(userId.ToString())
            .SendAsync("SpreadAlert", dto);
    }
}