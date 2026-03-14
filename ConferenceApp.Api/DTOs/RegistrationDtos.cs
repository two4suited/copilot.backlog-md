namespace ConferenceApp.Api.DTOs;

public record RegisterSessionResponse(
    Guid RegistrationId,
    Guid SessionId,
    string SessionTitle,
    DateTime RegisteredAt
);

public record MyRegistrationsResponse(List<SessionDto> Sessions);

public record AttendeeDto(Guid UserId, string Name, string Email, DateTime RegisteredAt);
