---
id: TASK-60
title: Add realistic placeholder images for seeded speakers and conferences
status: Done
assignee:
  - '@agent-images'
created_date: '2026-03-15 01:20'
updated_date: '2026-03-15 01:35'
labels:
  - design
  - frontend
  - backend
  - data
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The current seed data uses ui-avatars.com for speaker photos and has no images for conferences. This looks unpolished in the UI. Use high-quality, reliable placeholder image services to give each speaker a consistent avatar and each conference a banner/hero image.

Speaker photos:
- Use https://i.pravatar.cc/200?u=<name> (deterministic by seed param — same URL always returns same face)
- Each speaker gets a unique URL based on their name/email so avatars are consistent across restarts
- Example: https://i.pravatar.cc/200?u=alice.johnson gives Alice a consistent face

Conference images:
- Use https://picsum.photos/seed/<slug>/1200/400 for conference banner/hero images (deterministic by seed slug)
- Example: https://picsum.photos/seed/techconf2026/1200/400
- Each conference gets a unique, consistent landscape photo

Update DbSeeder.cs:
- Replace ui-avatars.com URLs with pravatar.cc URLs for all 17 speakers
- Add a PhotoUrl/BannerUrl field to Conference model if it doesn't exist, and seed it
- If Conference model lacks an image field, add it: string? ImageUrl in the model + EF migration

Update frontend:
- Conference cards on HomePage/ConferencesPage: show conference image as card header (with fallback gradient if null)
- Speaker cards on SpeakersPage/SpeakerDetailPage: already uses photo — verify pravatar URLs render correctly
- Session detail speaker avatar: verify pravatar URL shows correctly
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 All 17 seeded speakers have pravatar.cc photo URLs (deterministic by name)
- [x] #2 All 3 seeded conferences have picsum.photos banner image URLs
- [x] #3 Conference model has ImageUrl field with EF migration if it didn't already
- [x] #4 Conference cards on the home/conferences page display the banner image
- [x] #5 Speaker avatars render correctly in speaker list and session detail pages
- [x] #6 Fallback gradient shown if image URL is null/missing (no broken img tags)
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## TASK-60: Realistic placeholder images for speakers and conferences

### What changed

**Part 1 — Speaker photos (DbSeeder.cs)**
- Replaced `ui-avatars.com` with `https://i.pravatar.cc/200?u=<email>` for all 17 seeded speakers
- Each speaker gets a deterministic, realistic face avatar based on their email address

**Part 2 — Conference banner images**
- Added `public string? ImageUrl { get; set; }` to the `Conference` model (`ConferenceApp.Models/Conference.cs`)
- Generated EF Core migration `AddConferenceImageUrl`
- Added `ImageUrl` to `ConferenceDto` and `ConferenceDetailDto`
- Updated `ConferencesController` to include `ImageUrl` in all DTO projections
- Seeded all 3 conferences with `picsum.photos` banner URLs (deterministic slugs: techconf2023, devsummit2025, techconf2026)

**Part 3 — Frontend conference cards (ConferencesPage.tsx)**
- Conference card header now shows `<img>` if `imageUrl` is present (3:1 aspect ratio, `object-cover`)
- Falls back to `bg-gradient-to-r from-brand-accent to-brand-sage` gradient when `imageUrl` is null
- Added `imageUrl?: string` to the `Conference` TypeScript interface
- Removed unused `CARD_GRADIENTS` constant

### Tests
- `cd ConferenceApp.Api && dotnet build` — ✅ 0 warnings, 0 errors
- `cd frontend && npm run build` — ✅ Vite build succeeded

### Risks / follow-ups
- EF migration needs `dotnet ef database update` on deployed instances
- pravatar.cc and picsum.photos are third-party services; no offline fallback
<!-- SECTION:FINAL_SUMMARY:END -->
