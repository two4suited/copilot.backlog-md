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
