---
id: TASK-64
title: 'Bug: Speaker avatars and conference banner images not displaying'
status: To Do
assignee: []
created_date: '2026-03-15 01:38'
labels:
  - bug
  - frontend
  - backend
  - data
dependencies: []
priority: high
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
- [ ] #1 Conference API response includes imageUrl field with picsum.photos URL
- [ ] #2 Speakers API response includes photoUrl field with pravatar.cc URL
- [ ] #3 Conference cards on home/conferences page display banner images
- [ ] #4 Speaker avatars render on speaker list and session detail pages
- [ ] #5 Root cause documented and fixed end-to-end
<!-- AC:END -->
