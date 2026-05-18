namespace CryptoTracker.Api.Entities;

public class UserTokenSetting
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; }

    public int TokenId { get; set; }
    public Token Token { get; set; }

    public decimal RightSpreadPercent { get; set; } = 3;
    public decimal BackSpreadPercent { get; set; } = 100;
}