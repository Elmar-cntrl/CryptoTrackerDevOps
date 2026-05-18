namespace CryptoTracker.Api.Entities;

public class Trade
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; }

    public int TokenId { get; set; }
    public Token Token { get; set; }

    public decimal StartAmount { get; set; } // было
    public decimal EndAmount { get; set; }   // стало

    public decimal ProfitAmount { get; set; } // прибль или убыт
    public decimal ProfitPercent { get; set; }

    public string BuyExchange { get; set; }  // юпит/мекс
    public string SellExchange { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}