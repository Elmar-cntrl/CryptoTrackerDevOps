using CryptoTracker.Api.Data;
using CryptoTracker.Api.DTOs.NotificationDtos;
using CryptoTracker.Api.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace CryptoTracker.Api.Services;

public class PriceMonitorService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly MonitoringOptions _options;

    private readonly Dictionary<string, DateTime> _cooldowns = new();

    public PriceMonitorService(IServiceScopeFactory scopeFactory, IOptions<MonitoringOptions> options)
    {
        _scopeFactory = scopeFactory;
        _options = options.Value;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        Console.WriteLine("PriceMonitorService started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();

                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var jupiter = scope.ServiceProvider.GetRequiredService<JupiterPriceService>();
                var mexc = scope.ServiceProvider.GetRequiredService<MexcPriceService>();
                var calculator = scope.ServiceProvider.GetRequiredService<SpreadCalculator>();
                var notifier = scope.ServiceProvider.GetRequiredService<NotificationService>();

                var settings = await context.UserTokenSettings
                    .Include(x => x.Token)
                    .ToListAsync(stoppingToken);

                if (settings.Count == 0)
                {
                    Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] No tracked tokens. Waiting...");
                    await Task.Delay(_options.LoopDelayMs, stoppingToken);
                    continue;
                }

                var tokens = settings
                    .Select(x => x.Token)
                    .DistinctBy(x => x.Id)
                    .Where(t => t.IsActive)
                    .ToList();

                Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] TOKENS TRACKED: {tokens.Count} | SETTINGS: {settings.Count}");

                int total = tokens.Count;
                int index = 0;
                int batchNumber = 1;

                while (index < total)
                {
                    var batch = tokens
                        .Skip(index)
                        .Take(_options.JupiterBatchSize)
                        .ToList();

                    Console.WriteLine($"\n[{DateTime.Now:HH:mm:ss}] BATCH #{batchNumber} ({batch.Count} tokens)");

                    var jPrices = await jupiter.GetBatchPricesAsync(batch);
                    var mPrices = await mexc.GetPricesAsync(batch);

                    foreach (var token in batch)
                    {
                        if (string.IsNullOrWhiteSpace(token.JupiterId))
                        {
                            Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] {token.Symbol} | SKIP (no JupiterId)");
                            continue;
                        }

                        jPrices.TryGetValue(token.JupiterId, out decimal jPrice);
                        mPrices.TryGetValue(token.Id, out decimal mPrice);

                        Console.Write($"[{DateTime.Now:HH:mm:ss}] {token.Symbol} | J=");

                        if (jPrice > 0)
                            Console.Write(jPrice.ToString("F6"));
                        else
                            Console.Write("null");

                        Console.Write(" | M=");

                        if (mPrice > 0)
                            Console.Write(mPrice.ToString("F6"));
                        else
                            Console.Write("null");

                        if (jPrice <= 0 || mPrice <= 0)
                        {
                            Console.WriteLine("  → SKIP (no data)");
                            continue;
                        }

                        decimal diffPercent = calculator.CalculateSpreadPercent(jPrice, mPrice);
                        Console.Write($" | Spread={diffPercent:F2}%");
                        
                        
                        if (mPrice > jPrice)
                            Console.WriteLine("  → RIGHT CHECK");
                        else
                            Console.WriteLine("  → BACK CHECK");

                        var usersForToken = settings.Where(x => x.TokenId == token.Id);

                        foreach (var s in usersForToken)
                        {
                            // RIGHT SPREAD
                            if (mPrice > jPrice)
                            {
                                if (diffPercent >= s.RightSpreadPercent)
                                {
                                    string key = $"{s.UserId}:{token.Id}:RIGHT";

                                    if (CooldownPassed(key))
                                    {
                                        SetCooldown(key);

                                        Console.WriteLine(
                                            $"   RIGHT ALERT -> userId={s.UserId} | threshold={s.RightSpreadPercent}% | spread={diffPercent:F2}%");

                                        await notifier.SendToUserAsync(s.UserId, new SpreadAlertDto
                                        {
                                            UserId = s.UserId,
                                            TokenSymbol = token.Symbol,
                                            JupiterPrice = jPrice,
                                            MexcPrice = mPrice,
                                            SpreadPercent = diffPercent,
                                            Type = "RightSpread"
                                        });
                                    }
                                    else
                                    {
                                        Console.WriteLine(
                                            $"   RIGHT COOLDOWN -> userId={s.UserId}");
                                    }
                                }
                            }
                            // BACK SPREAD
                            else
                            {
                                if (Math.Abs(diffPercent) >= s.BackSpreadPercent)
                                {
                                    string key = $"{s.UserId}:{token.Id}:BACK";

                                    if (CooldownPassed(key))
                                    {
                                        SetCooldown(key);

                                        Console.WriteLine(
                                            $"   BACK ALERT -> userId={s.UserId} | threshold={s.BackSpreadPercent}% | spread={diffPercent:F2}%");

                                        await notifier.SendToUserAsync(s.UserId, new SpreadAlertDto
                                        {
                                            UserId = s.UserId,
                                            TokenSymbol = token.Symbol,
                                            JupiterPrice = jPrice,
                                            MexcPrice = mPrice,
                                            SpreadPercent = diffPercent,
                                            Type = "BackSpread"
                                        });
                                    }
                                    else
                                    {
                                        Console.WriteLine(
                                            $"   BACK COOLDOWN -> userId={s.UserId}");
                                    }
                                }
                            }
                        }
                    }

                    index += _options.JupiterBatchSize;
                    batchNumber++;

                    await Task.Delay(_options.BatchDelayMs, stoppingToken);
                }
            }
            catch (TaskCanceledException)
            {
                Console.WriteLine("Monitor stopped (TaskCanceledException)");
            }
            catch (Exception ex)
            {
                Console.WriteLine("Monitor error: " + ex.Message);
            }

            await Task.Delay(_options.LoopDelayMs, stoppingToken);
        }
    }

    private bool CooldownPassed(string key)
    {
        if (!_cooldowns.ContainsKey(key))
            return true;

        return (DateTime.UtcNow - _cooldowns[key]).TotalSeconds >= _options.CooldownSeconds;
    }

    private void SetCooldown(string key)
    {
        _cooldowns[key] = DateTime.UtcNow;
    }
}