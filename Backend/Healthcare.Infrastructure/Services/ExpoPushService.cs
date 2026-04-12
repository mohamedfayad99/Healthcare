using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace Healthcare.Infrastructure.Services;

/// <summary>
/// Sends push notifications to Expo-managed devices via the Expo Push API.
/// </summary>
public sealed class ExpoPushService
{
    private readonly HttpClient _http;
    private readonly ILogger<ExpoPushService> _logger;
    private const string ExpoEndpoint = "https://exp.host/--/api/v2/push/send";

    public ExpoPushService(HttpClient http, ILogger<ExpoPushService> logger)
    {
        _http = http;
        _logger = logger;
    }

    /// <summary>
    /// Sends a push notification to one or more Expo push tokens.
    /// </summary>
    public async Task SendAsync(
        IEnumerable<string> tokens,
        string title,
        string body,
        object? data = null)
    {
        var validTokens = tokens
            .Where(t => !string.IsNullOrWhiteSpace(t) && t.StartsWith("ExponentPushToken"))
            .Distinct()
            .ToList();

        if (validTokens.Count == 0)
            return;

        var batches = validTokens
            .Select((t, i) => (t, i))
            .GroupBy(x => x.i / 100)
            .Select(g => g.Select(x => x.t).ToList());

        foreach (var batch in batches)
        {
            var messages = batch.Select(token => new
            {
                to = token,
                title,
                body,
                data = data ?? new { },
                sound = "default",
                priority = "high",
            });

            var json = JsonSerializer.Serialize(messages);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            try
            {
                var response = await _http.PostAsync(ExpoEndpoint, content);
                if (!response.IsSuccessStatusCode)
                {
                    var err = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("Expo push failed ({status}): {error}", response.StatusCode, err);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending Expo push notification");
            }
        }
    }
}
