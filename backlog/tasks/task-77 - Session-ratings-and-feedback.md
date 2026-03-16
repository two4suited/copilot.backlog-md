---
id: TASK-77
title: Session ratings and feedback
status: In Progress
assignee:
  - '@copilot'
created_date: '2026-03-16 16:46'
updated_date: '2026-03-16 16:47'
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
- [ ] #1 SessionRating entity created with Stars (1-5), optional Comment, UserId FK, SessionId FK, unique (UserId, SessionId)
- [ ] #2 EF Core migration generated and applies cleanly
- [ ] #3 POST /api/sessions/{id}/ratings — authenticated, session must have ended, user must have been registered, upsert semantics
- [ ] #4 GET /api/sessions/{id}/ratings/summary — public, returns avg stars, total count, star distribution (1–5)
- [ ] #5 GET /api/sessions/{id}/ratings/mine — authenticated, returns current user's rating or null
- [ ] #6 GET /api/sessions/{id}/ratings — admin only, paginated list of all ratings with reviewer name
- [ ] #7 StarRating component renders 1–5 interactive stars and a display-only mode
- [ ] #8 RatingSection shown on SessionDetailPage: summary if ratings exist, form for eligible users (registered + session ended)
- [ ] #9 api.ts extended with ratings namespace (submit, getSummary, getMine)
- [ ] #10 dotnet build clean, npm run build clean, no TypeScript errors
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
