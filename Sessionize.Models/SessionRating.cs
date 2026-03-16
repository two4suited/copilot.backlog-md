namespace Sessionize.Models;

public class SessionRating : BaseEntity
{
    public Guid SessionId { get; set; }
    public Session Session { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    /// <summary>Rating from 1 (poor) to 5 (excellent).</summary>
    public int Stars { get; set; }

    /// <summary>Optional written feedback (max 500 characters).</summary>
    public string? Comment { get; set; }
}
