namespace ConferenceApp.Models;

public class Conference : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Location { get; set; } = string.Empty;
    public string? WebsiteUrl { get; set; }
    public ICollection<Track> Tracks { get; set; } = new List<Track>();
}
