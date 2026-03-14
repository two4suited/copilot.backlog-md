namespace ConferenceApp.Models;

public class Session : BaseEntity
{
    public Guid TrackId { get; set; }
    public Track Track { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Room { get; set; } = string.Empty;
    public int Capacity { get; set; } = 50;
    public string SessionType { get; set; } = "Talk";
    public string Level { get; set; } = "Intermediate";
    public string? SlidesUrl { get; set; }
    public string? RecordingUrl { get; set; }
    public ICollection<SessionSpeaker> SessionSpeakers { get; set; } = new List<SessionSpeaker>();
    public ICollection<Registration> Registrations { get; set; } = new List<Registration>();
}
