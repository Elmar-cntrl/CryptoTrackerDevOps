namespace CryptoTracker.Api.Entities;

public class SpreadAlert
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; }

    public int TokenId { get; set; }
    public Token Token { get; set; }

    public decimal JupiterPrice { get; set; }
    public decimal MexcPrice { get; set; }

    public decimal SpreadPercent { get; set; }

    public string Type { get; set; } // прям обр спред

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}