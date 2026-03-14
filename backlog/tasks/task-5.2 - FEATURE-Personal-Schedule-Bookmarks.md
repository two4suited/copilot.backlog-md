---
id: TASK-5.2
title: 'FEATURE: Personal Schedule & Bookmarks'
status: In Progress
assignee:
  - '@copilot'
created_date: '2026-03-14 21:13'
updated_date: '2026-03-14 22:03'
labels:
  - feature
  - frontend
dependencies: []
parent_task_id: TASK-5
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Logged-in attendees can bookmark sessions and view a filtered schedule of only their saved/registered sessions.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Bookmark icon on each session card toggles save state
- [x] #2 My Schedule page shows only registered + bookmarked sessions
- [x] #3 Sessions grouped by time slot on My Schedule
- [x] #4 Works offline (bookmarks stored locally, synced on login)
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## Personal Schedule & Bookmarks (TASK-5.2)

### What changed
- **BookmarksContext** (`context/BookmarksContext.tsx`): Global React context managing bookmark state. When authenticated, reads from the `/api/users/me/registrations` endpoint; when unauthenticated, stores IDs in `localStorage` under `offline_bookmarks`. Optimistic UI updates are applied immediately on toggle, then reconciled after the mutation settles. On login, any pending offline bookmarks are synced to the API automatically.
- **BookmarkButton** (`components/BookmarkButton.tsx`): Reusable button rendering a `Bookmark` / `BookmarkCheck` icon (lucide-react). Calls `e.preventDefault()` + `e.stopPropagation()` so it works inside `<Link>` cards without triggering navigation. Disabled with spinner feedback during in-flight mutations.
- **SchedulePage**: `SessionCard` gained a `BookmarkButton` overlaid in the top-right corner (absolute-positioned, `pr-8` padding to avoid overlap). No other layout changes.
- **MySchedulePage**: Added track name + colour dot badge alongside room/type/seats. Renamed "Cancel" button to "Remove from schedule".
- **App.tsx**: `<BookmarksProvider>` wraps the router inside `<QueryClientProvider>` so the context has access to both React Query and auth state.

### User impact
Attendees can bookmark any session directly from the schedule grid without navigating away. Bookmarks persist via the registration API. Offline users see a local-only bookmark that syncs to the server on next login. My Schedule groups sessions by date with full time/track/room metadata and a clear removal button.

### Tests
Frontend build (`npm run build`) passes with 0 TypeScript errors and 0 warnings.
<!-- SECTION:FINAL_SUMMARY:END -->
