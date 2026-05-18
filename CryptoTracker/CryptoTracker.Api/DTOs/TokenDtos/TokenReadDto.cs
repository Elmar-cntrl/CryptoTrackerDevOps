namespace CryptoTracker.Api.DTOs.TokenDtos
{
    public class TokenReadDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Symbol { get; set; }
        public string JupiterId { get; set; }
        public string MexcSymbol { get; set; }
        public bool IsActive { get; set; }
    }
}