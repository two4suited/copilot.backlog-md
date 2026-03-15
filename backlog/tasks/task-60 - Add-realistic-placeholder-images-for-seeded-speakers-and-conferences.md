---
id: TASK-60
title: Add realistic placeholder images for seeded speakers and conferences
status: To Do
assignee: []
created_date: '2026-03-15 01:20'
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
- [ ] #1 All 17 seeded speakers have pravatar.cc photo URLs (deterministic by name)
- [ ] #2 All 3 seeded conferences have picsum.photos banner image URLs
- [ ] #3 Conference model has ImageUrl field with EF migration if it didn't already
- [ ] #4 Conference cards on the home/conferences page display the banner image
- [ ] #5 Speaker avatars render correctly in speaker list and session detail pages
- [ ] #6 Fallback gradient shown if image URL is null/missing (no broken img tags)
<!-- AC:END -->
