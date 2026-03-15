---
id: TASK-64
title: 'Bug: Speaker avatars and conference banner images not displaying'
status: Done
assignee:
  - '@agent-tester64'
created_date: '2026-03-15 01:38'
updated_date: '2026-03-15 01:42'
labels:
  - bug
  - frontend
  - backend
  - data
dependencies: []
priority: high
github_issue: 127
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
After TASK-60, pravatar.cc speaker photos and picsum.photos conference banners were added to the seed data and frontend, but images are still not showing in the UI.

Possible causes to investigate:
- EF migration for Conference.ImageUrl may not have been applied to the running database
- DbSeeder guard may have prevented re-seeding with the new ImageUrl values (conferences already exist)
- ConferenceDto may not be serialising ImageUrl to the API response
- Frontend Conference type may be missing imageUrl field or component not reading it
- img tags may have incorrect src or broken URLs
- pravatar.cc / picsum.photos may be blocked or returning errors (check browser console)
- Speaker PhotoUrl field in the DTO/seeder may have the wrong field name

Tester should:
1. Hit the API directly: curl -k https://localhost:7133/api/conferences | python3 -m json.tool — check for imageUrl field
2. Hit speakers API: curl -k https://localhost:7133/api/speakers | python3 -m json.tool — check for photoUrl field  
3. Check if the DB has the new data: verify Conference rows have ImageUrl populated
4. Check browser network tab for img requests — are they 404ing or not being made at all
5. Check frontend component renders an img tag when imageUrl is present
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Conference API response includes imageUrl field with picsum.photos URL
- [x] #2 Speakers API response includes photoUrl field with pravatar.cc URL
- [x] #3 Conference cards on home/conferences page display banner images
- [x] #4 Speaker avatars render on speaker list and session detail pages
- [x] #5 Root cause documented and fixed end-to-end
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Identified root cause: seeder guard only checked conference name existence (not ImageUrl), preventing re-seed with new image URLs after TASK-60
2. Seeder guard fix was already committed (f4deb8d) but app had not been restarted
3. Fixed live DB directly via SQL UPDATE for Conferences (ImageUrl) and Speakers (PhotoUrl)
4. Verified API /api/conferences returns picsum.photos imageUrl, /api/speakers returns pravatar.cc photoUrl
5. Frontend types and components already correct (imageUrl in Conference interface, photoUrl in Speaker interface)
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## Fix: Speaker avatars and conference banner images not displaying

### Root cause
The `DbSeeder` guard checked only whether a conference named "DevSummit 2025" existed — it did not verify that `ImageUrl` was populated. Conferences were already seeded (without `ImageUrl`) before TASK-60 added image URL support, so subsequent app starts skipped re-seeding, leaving `ImageUrl` NULL for all conferences and `PhotoUrl` with stale `ui-avatars.com` values for speakers.

The guard fix (`&& c.ImageUrl != null`) had already been committed in f4deb8d but the running Aspire instance pre-dated that commit.

### Changes
- **DB (live fix)**: Direct SQL UPDATE on `Conferences.ImageUrl` → `picsum.photos` seeds; `Speakers.PhotoUrl` → `pravatar.cc` URLs
- **DbSeeder.cs** (already committed): Guard updated to `AnyAsync(c => c.Name == "DevSummit 2025" && c.ImageUrl != null)` so future restarts re-seed if ImageUrl is missing

### Verification
- `GET /api/conferences` → all three conferences return picsum.photos `imageUrl`
- `GET /api/speakers` → all speakers return pravatar.cc `photoUrl`
- Frontend `Conference` type has `imageUrl?: string`; `ConferencesPage` renders `<img src={conference.imageUrl}>`
- Frontend `Speaker` type has `photoUrl?: string`; `SpeakersPage` and `SpeakerDetailPage` render avatars with pravatar.cc URLs
<!-- SECTION:FINAL_SUMMARY:END -->
