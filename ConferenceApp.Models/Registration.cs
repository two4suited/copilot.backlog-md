namespace ConferenceApp.Models;

public class Registration : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid SessionId { get; set; }
    public Session Session { get; set; } = null!;
    public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;
    public bool IsWaitlisted { get; set; } = false;
}
