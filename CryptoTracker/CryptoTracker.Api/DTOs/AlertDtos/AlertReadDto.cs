namespace CryptoTracker.Api.DTOs.AlertDtos;

public class AlertReadDto
{
    public int Id { get; set; }

    public int TokenId { get; set; }
    public string Symbol { get; set; }

    public decimal JupiterPrice { get; set; }
    public decimal MexcPrice { get; set; }

    public decimal SpreadPercent { get; set; }
    public string Type { get; set; }

    public DateTime CreatedAt { get; set; }
}