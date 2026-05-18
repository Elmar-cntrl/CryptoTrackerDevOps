namespace CryptoTracker.Api.DTOs.TradeDtos;

public class TradeCreateDto
{
    public int TokenId { get; set; }

    public decimal StartAmount { get; set; }
    public decimal EndAmount { get; set; }

    public string BuyExchange { get; set; }
    public string SellExchange { get; set; }
}