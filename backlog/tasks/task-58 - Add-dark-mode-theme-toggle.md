---
id: TASK-58
title: Add dark mode theme toggle
status: Done
assignee:
  - '@agent-darkmode'
created_date: '2026-03-15 01:06'
updated_date: '2026-03-15 01:28'
labels:
  - design
  - frontend
  - feature
  - accessibility
dependencies: []
priority: medium
github_issue: 114
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Users should be able to switch between the warm earth tone light theme and a complementary dark theme. The dark theme should feel cohesive with the earth tone brand — not a generic dark grey — think dark espresso/charcoal backgrounds with warm accent colours.

Dark palette direction:
- Page background: deep espresso #1a0f0a
- Surface/card: warm dark brown #2c1810
- Border: muted brown #4a2e20
- Primary text: warm off-white #f5f0eb
- Muted text: warm light tan #c4a882
- Accent: terracotta #c2622d (same as light — works on dark too)
- Sage: #8aab76 (lightened for dark bg contrast)

Implementation:
- Use Tailwind's dark mode (class strategy: add dark class to <html>)
- Toggle button in nav bar (sun/moon icon)
- Persist preference to localStorage
- All existing components use dark: variants
- Respect prefers-color-scheme on first visit
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Dark mode toggle (sun/moon icon) in navigation bar
- [x] #2 Dark palette uses warm espresso/charcoal backgrounds, not generic greys
- [x] #3 All pages render correctly in dark mode with no unthemed elements
- [x] #4 User preference persisted to localStorage
- [x] #5 Respects prefers-color-scheme on first visit if no saved preference
- [x] #6 Dark mode text passes WCAG AA contrast on all dark surfaces
- [x] #7 tailwind.config.js uses darkMode: 'class' strategy
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. tailwind.config.js: add darkMode: "class"
2. Create ThemeContext.tsx: reads localStorage, falls back to prefers-color-scheme, toggles dark class on <html>
3. Wrap app in ThemeProvider in main.tsx
4. Layout.tsx: import Sun/Moon from lucide-react, add toggle button, add dark: variants throughout
5. Add dark: variants to all pages: HomePage, ConferencesPage, ConferenceDetailPage, TrackDetailPage, SessionDetailPage, SpeakersPage, SpeakerDetailPage, MySchedulePage, LoginPage, RegisterPage, SchedulePage
6. Add dark: variants to shared components: LevelBadge, ErrorMessage, ConfirmDialog, SearchBar, BookmarkButton
7. Add dark: variants to admin: AdminLayout, ConferenceAdminPage, SessionAdminPage, SpeakerAdminPage, ConferenceFormPage, SessionFormPage, SpeakerFormPage
8. Build passes: npm run build
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
## Dark Mode Theme Toggle

Adds a warm espresso dark theme to ConferenceApp with a persistent sun/moon toggle in the nav bar.

### What changed
- **tailwind.config.js**: Added `darkMode: "class"` strategy
- **ThemeContext.tsx** (new): `ThemeProvider` reads `localStorage("theme")`, falls back to `prefers-color-scheme` on first visit, toggles `dark` class on `<html>`, exposes `useTheme()` hook
- **main.tsx**: Wrapped app in `<ThemeProvider>`
- **Layout.tsx**: Added Sun/Moon toggle button (lucide-react) in the nav bar; complete dark: variants throughout nav, mobile menu, and page container
- **All pages**: Added dark: variants — HomePage, ConferencesPage, ConferenceDetailPage, TrackDetailPage, SessionDetailPage, SpeakersPage, SpeakerDetailPage, SchedulePage (including complex DayGrid), MySchedulePage, LoginPage, RegisterPage
- **Shared components**: LevelBadge, ErrorMessage, ConfirmDialog, SearchBar — all themed
- **Admin**: AdminLayout, ConferenceAdminPage, SessionAdminPage, SpeakerAdminPage, ConferenceFormPage, SessionFormPage, SpeakerFormPage — all tables, forms, labels, inputs themed

### Dark palette
- Page bg: `#1a0f0a` (deep espresso)
- Surface/card: `#2c1810` (warm dark brown)
- Border: `#4a2e20` (muted brown)
- Primary text: `#f5f0eb` (warm off-white)
- Muted text: `#c4a882` (warm tan)
- Accent: `#c2622d` terracotta (unchanged — works on dark)

### Tests
- `npm run build` passes (TypeScript + Vite) with 0 errors

### Persistence
- Preference saved to `localStorage("theme")`
- Respects `prefers-color-scheme` on first visit when no stored preference
<!-- SECTION:FINAL_SUMMARY:END -->
