---
id: TASK-21
title: Search API and UI — full-text search across sessions and speakers
status: Done
assignee:
  - '@copilot'
created_date: '2026-03-14 22:05'
updated_date: '2026-03-14 22:08'
labels:
  - backend
  - frontend
  - api
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add a GET /api/search?q=term endpoint that searches sessions (title, description, speaker name) and speakers (name, bio, company). Frontend: search bar in the nav header that shows a dropdown of results as you type, with links to session/speaker detail pages.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 GET /api/search?q= returns sessions and speakers matching the query
- [x] #2 Search is case-insensitive and matches partial words
- [x] #3 Frontend search bar shows live dropdown results
- [x] #4 Clicking a result navigates to the correct detail page
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## Full-text Search — TASK-21

### What changed
- **Backend**: Added `SearchController.cs` with `GET /api/search?q=term` endpoint. Uses PostgreSQL `ILike` for case-insensitive partial matching across sessions (Title, Description, Speaker names via join) and speakers (Name, Bio, Company). Returns up to 10 results each; rejects queries shorter than 2 characters with 400.
- **API client** (`client.ts`): Added `SearchResultDto`, `SessionSearchItem`, `SpeakerSearchItem` interfaces and `searchApi(q)` helper.
- **Frontend**: Extracted `SearchBar.tsx` component embedded in the nav header. Debounces input 300 ms, shows a dropdown with Sessions/Speakers sections, navigates to `/sessions/:id` or `/speakers/:id` on click, closes on Escape or outside click, shows "No results" when empty, requires ≥ 2 chars before firing.
- **Layout.tsx**: Imported and placed `<SearchBar />` between the main nav and the auth buttons.

### Tests
- `dotnet build ConferenceApp.sln -c Release` — 0 errors
- `cd frontend && npm run build` — 0 errors, 0 unused imports
<!-- SECTION:FINAL_SUMMARY:END -->
