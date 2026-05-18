namespace CryptoTracker.Api.Entities;

public class PriceSnapshot
{
    public int Id { get; set; }

    public int TokenId { get; set; }

    public decimal JupiterPrice { get; set; }
    public decimal MexcPrice { get; set; }

    public decimal SpreadPercent { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}