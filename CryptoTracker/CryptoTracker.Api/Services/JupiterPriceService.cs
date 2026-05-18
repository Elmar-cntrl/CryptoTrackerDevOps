using System.Text.Json;
using CryptoTracker.Api.Entities;

namespace CryptoTracker.Api.Services;

public class JupiterPriceService
{
    private readonly HttpClient _http;

    public JupiterPriceService(HttpClient http)
    {
        _http = http;
    }

    public async Task<Dictionary<string, decimal>> GetBatchPricesAsync(List<Token> tokens)
    {
        var ids = tokens
            .Where(t => !string.IsNullOrWhiteSpace(t.JupiterId))
            .Select(t => t.JupiterId)
            .ToList();

        if (ids.Count == 0)
            return new Dictionary<string, decimal>();

        string url = "https://lite-api.jup.ag/price/v3?ids=" + string.Join(",", ids);

        var response = await _http.GetAsync(url);
        response.EnsureSuccessStatusCode();

        string json = await response.Content.ReadAsStringAsync();

        using var doc = JsonDocument.Parse(json);

        var result = new Dictionary<string, decimal>();

        // Jupiter возвращает объект напрямую, без "data"
        foreach (var tokenProp in doc.RootElement.EnumerateObject())
        {
            string id = tokenProp.Name;

            if (tokenProp.Value.TryGetProperty("usdPrice", out var usdPriceElement))
            {
                if (usdPriceElement.TryGetDecimal(out decimal price))
                {
                    result[id] = price;
                }
            }
        }

        return result;
    }
}