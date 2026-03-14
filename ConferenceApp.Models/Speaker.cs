namespace ConferenceApp.Models;

public class Speaker : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
    public string? TwitterHandle { get; set; }
    public string? LinkedInUrl { get; set; }
    public ICollection<SessionSpeaker> SessionSpeakers { get; set; } = new List<SessionSpeaker>();
}
