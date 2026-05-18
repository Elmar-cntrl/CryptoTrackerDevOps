namespace CryptoTracker.Api.DTOs.TokenDtos
{
    public class TokenCreateDto
    {
        public string Name { get; set; }
        public string Symbol { get; set; }
        public string JupiterId { get; set; }
        public string MexcSymbol { get; set; }
    }
}