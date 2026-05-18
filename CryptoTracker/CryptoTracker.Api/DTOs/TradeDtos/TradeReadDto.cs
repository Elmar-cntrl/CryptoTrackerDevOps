namespace CryptoTracker.Api.DTOs.TradeDtos;

public class TradeReadDto
{
    public int Id { get; set; }
    public int TokenId { get; set; }
    public string Symbol { get; set; }

    public decimal StartAmount { get; set; }
    public decimal EndAmount { get; set; }

    public decimal ProfitAmount { get; set; }
    public decimal ProfitPercent { get; set; }

    public string BuyExchange { get; set; }
    public string SellExchange { get; set; }

    public DateTime CreatedAt { get; set; }
}