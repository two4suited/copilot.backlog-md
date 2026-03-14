using Microsoft.AspNetCore.SignalR;

namespace ConferenceApp.Api.Hubs;

public class SessionHub : Hub
{
    public async Task JoinSession(string sessionId) =>
        await Groups.AddToGroupAsync(Context.ConnectionId, $"session-{sessionId}");

    public async Task LeaveSession(string sessionId) =>
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"session-{sessionId}");
}
