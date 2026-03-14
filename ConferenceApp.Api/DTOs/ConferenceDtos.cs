namespace ConferenceApp.Api.DTOs;

public record ConferenceDto(
    Guid Id,
    string Name,
    string? Description,
    DateTime StartDate,
    DateTime EndDate,
    string Location,
    string? WebsiteUrl,
    int TrackCount,
    DateTime CreatedAt
);

public record ConferenceDetailDto(
    Guid Id,
    string Name,
    string? Description,
    DateTime StartDate,
    DateTime EndDate,
    string Location,
    string? WebsiteUrl,
    IReadOnlyList<TrackDto> Tracks,
    DateTime CreatedAt
);

public record CreateConferenceRequest(
    string Name,
    string? Description,
    DateTime StartDate,
    DateTime EndDate,
    string Location,
    string? WebsiteUrl
);

public record UpdateConferenceRequest(
    string Name,
    string? Description,
    DateTime StartDate,
    DateTime EndDate,
    string Location,
    string? WebsiteUrl
);

public record TrackDto(
    Guid Id,
    Guid ConferenceId,
    string Name,
    string? Description,
    string Color,
    int SortOrder,
    int SessionCount
);

public record TrackDetailDto(
    Guid Id,
    Guid ConferenceId,
    string Name,
    string? Description,
    string Color,
    int SortOrder,
    IReadOnlyList<SessionSummaryDto> Sessions
);

public record SessionSummaryDto(
    Guid Id,
    string Title,
    DateTime StartTime,
    DateTime EndTime,
    string Room,
    int Capacity,
    string SessionType,
    string Level
);

public record CreateTrackRequest(
    string Name,
    string? Description,
    string Color,
    int SortOrder
);

public record UpdateTrackRequest(
    string Name,
    string? Description,
    string Color,
    int SortOrder
);

public record PagedResult<T>(
    IReadOnlyList<T> Items,
    int Total,
    int Page,
    int PageSize
);

// ── Session DTOs ──────────────────────────────────────────────────────────────

public record SessionDto(
    Guid Id,
    Guid TrackId,
    string TrackName,
    string TrackColor,
    string Title,
    string? Description,
    DateTime StartTime,
    DateTime EndTime,
    string Room,
    int SeatsTotal,
    int RegistrationCount,
    int SeatsAvailable,
    string SessionType,
    string Level,
    string? SlidesUrl,
    string? RecordingUrl,
    IReadOnlyList<SpeakerSummaryDto> Speakers
);

public record CreateSessionRequest(
    Guid TrackId,
    string Title,
    string? Description,
    DateTime StartTime,
    DateTime EndTime,
    string Room,
    int Capacity,
    string SessionType,
    string Level,
    IReadOnlyList<Guid>? SpeakerIds
);

public record UpdateSessionRequest(
    string Title,
    string? Description,
    DateTime StartTime,
    DateTime EndTime,
    string Room,
    int Capacity,
    string SessionType,
    string Level,
    string? SlidesUrl,
    string? RecordingUrl
);

public record UpdateSessionSpeakersRequest(IReadOnlyList<Guid>? SpeakerIds);

public record SpeakerSummaryDto(Guid Id, string Name, string Company, string? PhotoUrl);

// ── Speaker DTOs ──────────────────────────────────────────────────────────────

public record SpeakerDto(
    Guid Id,
    string Name,
    string Bio,
    string Email,
    string Company,
    string? PhotoUrl,
    string? TwitterHandle,
    string? LinkedInUrl
);

public record SpeakerDetailDto(
    Guid Id,
    string Name,
    string Bio,
    string Email,
    string Company,
    string? PhotoUrl,
    string? TwitterHandle,
    string? LinkedInUrl,
    IReadOnlyList<SessionSummaryDto> Sessions
);

public record CreateSpeakerRequest(
    string Name,
    string Bio,
    string Email,
    string Company,
    string? PhotoUrl,
    string? TwitterHandle,
    string? LinkedInUrl
);

public record UpdateSpeakerRequest(
    string Name,
    string Bio,
    string Company,
    string? PhotoUrl,
    string? TwitterHandle,
    string? LinkedInUrl
);
