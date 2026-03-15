namespace Sessionize.Models;

public class SessionSpeaker
{
    public Guid SessionId { get; set; }
    public Session Session { get; set; } = null!;
    public Guid SpeakerId { get; set; }
    public Speaker Speaker { get; set; } = null!;
}
