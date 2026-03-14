namespace ConferenceApp.Models;

public enum UserRole { Attendee, Speaker, Admin }

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Attendee;
    public string? AvatarUrl { get; set; }
    public ICollection<Registration> Registrations { get; set; } = new List<Registration>();
}
