namespace CryptoTracker.Api.Options;

public class MonitoringOptions
{
    public int LoopDelayMs { get; set; }
    public int JupiterBatchSize { get; set; }
    public int BatchDelayMs { get; set; }

    public int CooldownSeconds { get; set; }
}