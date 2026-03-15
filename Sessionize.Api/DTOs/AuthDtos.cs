namespace Sessionize.Api.DTOs;

public record RegisterRequest(string Name, string Email, string Password);
public record LoginRequest(string Email, string Password);
public record AuthResponse(string Token, string Email, string Name, string Role);
public record UserProfileDto(Guid Id, string Email, string Name, string Role);
