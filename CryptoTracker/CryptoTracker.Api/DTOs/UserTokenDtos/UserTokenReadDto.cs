public class UserTokenReadDto
{
    public int Id { get; set; }

    public int TokenId { get; set; }
    public string Symbol { get; set; }

    public decimal RightSpreadPercent { get; set; }
    public decimal BackSpreadPercent { get; set; }
}