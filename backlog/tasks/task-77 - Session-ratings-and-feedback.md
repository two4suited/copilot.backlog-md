---
id: TASK-77
title: Session ratings and feedback
status: Done
assignee:
  - '@copilot'
created_date: '2026-03-16 16:46'
updated_date: '2026-03-16 20:09'
labels:
  - feature
  - backend
  - frontend
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Allow registered attendees to rate and leave feedback on sessions they attended. Stars (1-5) required, comment optional. Only available after a session has ended. One rating per user per session (update allowed). Show aggregate rating summary publicly.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 SessionRating entity created with Stars (1-5), optional Comment, UserId FK, SessionId FK, unique (UserId, SessionId)
- [x] #2 EF Core migration generated and applies cleanly
- [x] #3 POST /api/sessions/{id}/ratings — authenticated, session must have ended, user must have been registered, upsert semantics
- [x] #4 GET /api/sessions/{id}/ratings/summary — public, returns avg stars, total count, star distribution (1–5)
- [x] #5 GET /api/sessions/{id}/ratings/mine — authenticated, returns current user's rating or null
- [x] #6 GET /api/sessions/{id}/ratings — admin only, paginated list of all ratings with reviewer name
- [x] #7 StarRating component renders 1–5 interactive stars and a display-only mode
- [x] #8 RatingSection shown on SessionDetailPage: summary if ratings exist, form for eligible users (registered + session ended)
- [x] #9 api.ts extended with ratings namespace (submit, getSummary, getMine)
- [x] #10 dotnet build clean, npm run build clean, no TypeScript errors
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Add SessionRating entity to Sessionize.Models/
2. Add DbSet + EF config + query filter to ConferenceDbContext
3. Generate EF Core migration
4. Add RatingDtos.cs (SubmitRatingRequest, RatingDto, RatingSummaryDto, MyRatingDto)
5. Implement RatingsController with 4 endpoints
6. Register controller (auto via AddControllers — no extra step)
7. Add ratings namespace to frontend api.ts
8. Add SessionRating type to frontend types
9. Build StarRating component
10. Build RatingSection component
11. Wire RatingSection into SessionDetailPage
12. Verify dotnet build + npm run build both clean
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added full session ratings and feedback feature across backend and frontend.

**Backend**
- New `SessionRating` entity in `Sessionize.Models/` extending `BaseEntity` (Stars 1–5, optional Comment ≤500 chars, UserId/SessionId FKs)
- Navigation properties added to `Session` and `User`
- `ConferenceDbContext` updated: `DbSet<SessionRating>`, soft-delete query filter, cascade relationships, unique index on `(UserId, SessionId)`, `HasMaxLength(500)` on Comment
- EF Core migration `AddSessionRatings` generated
- `RatingDtos.cs`: `SubmitRatingRequest`, `RatingDto`, `MyRatingDto`, `RatingSummaryDto`, `StarDistribution`, `AdminRatingDto`
- `RatingsController` with 4 endpoints: submit/upsert (auth + registered + session ended), public summary, my rating, admin list

**Frontend**
- `SessionRating`, `MyRatingDto`, `RatingSummaryDto`, `StarDistribution` types added to `types/index.ts`
- `api.ratings` namespace added to `services/api.ts` (submit, getSummary, getMine)
- `StarRating` component: interactive 1–5 star picker with display-only mode, ARIA attributes, dark mode support
- `RatingSection` component: aggregate summary with distribution bars + inline form; hidden until session ends; form gated on authentication + registration; upsert-aware (shows "Update rating" if already rated)
- `RatingSection` wired into bottom of `SessionDetailPage`

**Verified**: `dotnet build` clean, `npm run build` clean, no TypeScript errors.
<!-- SECTION:FINAL_SUMMARY:END -->
