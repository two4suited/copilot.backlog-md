namespace ConferenceApp.Models;

public class Track : BaseEntity
{
    public Guid ConferenceId { get; set; }
    public Conference Conference { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Color { get; set; } = "#6366f1";
    public int SortOrder { get; set; } = 0;
    public ICollection<Session> Sessions { get; set; } = new List<Session>();
}
