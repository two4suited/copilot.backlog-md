namespace Sessionize.Api.DTOs;

public record SubmitRatingRequest(int Stars, string? Comment);

public record RatingDto(
    Guid Id,
    int Stars,
    string? Comment,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record MyRatingDto(bool HasRated, RatingDto? Rating);

public record StarDistribution(int OneStar, int TwoStars, int ThreeStars, int FourStars, int FiveStars);

public record RatingSummaryDto(
    double AverageStars,
    int TotalRatings,
    StarDistribution Distribution
);

public record AdminRatingDto(
    Guid Id,
    Guid UserId,
    string ReviewerName,
    int Stars,
    string? Comment,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);
