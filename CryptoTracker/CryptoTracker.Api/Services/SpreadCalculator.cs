namespace CryptoTracker.Api.Services;

public class SpreadCalculator
{
    public decimal CalculateSpreadPercent(decimal jupiterPrice, decimal mexcPrice)
    {
        if (jupiterPrice <= 0 || mexcPrice <= 0)
            return 0;

        decimal avg = (jupiterPrice + mexcPrice) / 2m;
        if (avg == 0)
            return 0;

        return (mexcPrice - jupiterPrice) / avg * 100m;
    }
}