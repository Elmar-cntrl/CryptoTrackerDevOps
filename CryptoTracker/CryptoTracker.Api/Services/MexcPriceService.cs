using System.Text.Json;
using CryptoTracker.Api.Entities;

namespace CryptoTracker.Api.Services;

public class MexcPriceService
{
    private readonly HttpClient _http;

    public MexcPriceService(HttpClient http)
    {
        _http = http;
    }

    public async Task<decimal> GetPriceAsync(Token token)
    {
        if (string.IsNullOrWhiteSpace(token.MexcSymbol))
            return 0;

        string url = $"https://contract.mexc.com/api/v1/contract/fair_price/{token.MexcSymbol}_USDT";

        try
        {
            var response = await _http.GetAsync(url);
            response.EnsureSuccessStatusCode();

            string json = await response.Content.ReadAsStringAsync();

            using var doc = JsonDocument.Parse(json);

            if (doc.RootElement.TryGetProperty("data", out var dataElement))
            {
                if (dataElement.TryGetProperty("fairPrice", out var fairPriceElement))
                {
                    
                    if (fairPriceElement.ValueKind == JsonValueKind.Number &&
                        fairPriceElement.TryGetDecimal(out decimal price))
                    {
                        return price;
                    }
                    
                    
                    if (fairPriceElement.ValueKind == JsonValueKind.String &&
                        decimal.TryParse(fairPriceElement.GetString(), out decimal priceFromString))
                    {
                        return priceFromString;
                    }
                }
            }

            return 0;
        }
        catch
        {
            return 0;
        }
    }

    public async Task<Dictionary<int, decimal>> GetPricesAsync(List<Token> tokens)
    {
        var tasks = tokens.Select(async t =>
        {
            var price = await GetPriceAsync(t);
            return (t.Id, price);
        });

        var results = await Task.WhenAll(tasks);

        return results.ToDictionary(x => x.Id, x => x.price);
    }
}