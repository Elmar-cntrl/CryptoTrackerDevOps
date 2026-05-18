using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace CryptoTracker.Api.Helpers;

public class UserIdProvider : IUserIdProvider
{
    public string GetUserId(HubConnectionContext connection)
    {
        // берем ClaimTypes.NameIdentifier из дживити
        var userId = connection.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
        {
            Console.WriteLine("⚠️ SignalR: UserId not found in token");
        }
        else
        {
            Console.WriteLine($"✅ SignalR: UserId={userId}");
        }

        return userId;
    }
}