namespace CryptoTracker.Api.Services;

public class TradeCalculator
{
    public decimal CalculateProfit(decimal startAmount, decimal endAmount)
    {
        return endAmount - startAmount;
    }

    public decimal CalculateProfitPercent(decimal startAmount, decimal endAmount)
    {
        if (startAmount <= 0)
            return 0;

        return (endAmount - startAmount) / startAmount * 100m;
    }

    public decimal CalculateSpreadPercent(decimal mexcPrice, decimal jupiterPrice)
    {
        if (mexcPrice <= 0 || jupiterPrice <= 0)
            return 0;

        decimal avg = (mexcPrice + jupiterPrice) / 2m;
        return (mexcPrice - jupiterPrice) / avg * 100m;
    }
}