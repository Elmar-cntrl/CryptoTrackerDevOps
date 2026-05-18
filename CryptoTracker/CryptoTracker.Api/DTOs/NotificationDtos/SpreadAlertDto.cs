namespace CryptoTracker.Api.DTOs.NotificationDtos;

public class SpreadAlertDto
{
    public int UserId { get; set; }
    public string TokenSymbol { get; set; }

    public decimal JupiterPrice { get; set; }
    public decimal MexcPrice { get; set; }

    public decimal SpreadPercent { get; set; }
    public string Type { get; set; } // прямой обратный спред
    

    public DateTime Time { get; set; } = DateTime.UtcNow;
}