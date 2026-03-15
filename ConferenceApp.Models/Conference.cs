namespace ConferenceApp.Models;

public class Conference : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Location { get; set; } = string.Empty;
    public string? WebsiteUrl { get; set; }
    /// <summary>IANA timezone identifier for the conference venue, e.g. "America/Los_Angeles".</summary>
    public string Timezone { get; set; } = "UTC";
    public ICollection<Track> Tracks { get; set; } = new List<Track>();
}
