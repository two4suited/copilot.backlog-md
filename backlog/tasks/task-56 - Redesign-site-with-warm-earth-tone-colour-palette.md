---
id: TASK-56
title: Redesign site with warm earth tone colour palette
status: Done
assignee:
  - '@agent-designer'
created_date: '2026-03-15 00:58'
updated_date: '2026-03-15 01:07'
labels:
  - design
  - frontend
  - ui
dependencies: []
priority: high
github_issue: 112
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The current navy/teal theme feels cold and generic. Replace it with a warm, earthy palette that feels grounded and premium — think Notion, Linear, or Basecamp's warmth but for a tech conference.

Palette direction:
- Primary background: warm off-white / linen (#faf7f2 or similar)
- Primary text: deep espresso brown (#2c1810)
- Accent: burnt sienna / terracotta (#c2622d or #b85c38)
- Secondary accent: warm sage green (#6b7c5c)
- Surface/card background: warm cream (#f0ebe3)
- Border/divider: warm tan (#d4c5b0)
- Muted text: warm grey-brown (#8a7468)

Apply consistently via tailwind.config.js theme extension (brand-* tokens). Remove the current navy/teal palette entirely.

Key areas to update:
- tailwind.config.js: replace brand-primary/accent tokens with earth tone values
- Navigation bar: cream background, espresso text, terracotta active link
- Home hero: warm linen background, large espresso headline, terracotta CTA button
- Conference cards: cream card surface, tan border, terracotta date badge
- Schedule grid: sage green track chips, warm card backgrounds
- Speaker cards: warm surface, terracotta name highlight
- Session detail: terracotta track badge, sage availability bar
- Admin pages: warm table rows, terracotta action buttons
- Buttons: terracotta primary, sage secondary, espresso text
- All pages must look cohesive — no leftover blue/teal classes
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 tailwind.config.js brand tokens updated to earth tone values (linen, espresso, terracotta, sage)
- [x] #2 Navigation uses cream bg, espresso text, terracotta active/hover states
- [x] #3 Home hero uses linen bg with espresso headline and terracotta CTA button
- [x] #4 Conference cards use cream surface with tan border and terracotta date badge
- [x] #5 Schedule track chips use sage green; session cards use warm cream background
- [x] #6 Speaker cards show terracotta name highlight on warm surface
- [x] #7 Session detail page uses terracotta track badge and sage seat availability bar
- [x] #8 Admin tables use alternating warm row shading with terracotta action buttons
- [x] #9 No leftover navy (#0f172a) or teal (#0ea5e9) classes anywhere in the codebase
- [x] #10 All pages pass 375px viewport check with no horizontal overflow
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Replaced entire navy/teal design with warm earth tone palette.

**Palette tokens (tailwind.config.js):**
- brand-bg: #faf7f2 (warm linen)
- brand-surface: #f0ebe3 (cream)
- brand-border: #d4c5b0 (warm tan)
- brand-primary: #2c1810 (deep espresso)
- brand-accent: #c2622d (terracotta)
- brand-sage: #6b7c5c (sage green)
- brand-muted: #8a7468 (warm grey-brown)

**Changes by area:**
- `tailwind.config.js`: Replaced flat navy/teal tokens with nested brand.* earth tone tokens
- `index.css`: Added body background (#faf7f2) and text (#2c1810) base styles
- `Layout.tsx`: Navbar changed from dark espresso to cream (brand-surface) with warm tan border; active links use terracotta, inactive use warm muted brown
- `HomePage.tsx`: Hero changed from dark gradient to warm linen bg with espresso headline, terracotta CTA; feature cards use cream surface
- `ConferencesPage.tsx`: Cards use cream surface/tan border; date badges are terracotta; gradients use warm amber/stone tones
- `SchedulePage.tsx`: Track chips default to sage green (#6b7c5c); session cards use cream bg; day tabs and filters updated
- `SpeakersPage.tsx`: Speaker cards use cream surface; avatar fallback uses terracotta bg
- `SpeakerDetailPage.tsx`: Replaced all indigo with brand-accent; sessions use brand-sage for track names
- `SessionDetailPage.tsx`: Track badge defaults to terracotta; seat availability bar uses sage/terracotta; speaker cards use cream surface
- `ConferenceDetailPage.tsx`, `TrackDetailPage.tsx`: All indigo links/icons replaced with terracotta
- `SearchBar.tsx`: Input uses cream bg/tan border; dropdown uses cream surface; highlights use terracotta
- `LevelBadge.tsx`: Replaced green/blue/purple with brand-sage/brand-accent/brand-primary earth tones
- `AdminLayout.tsx`: Sidebar uses warm muted text, active uses terracotta
- All admin list/form pages: Indigo buttons replaced with terracotta; table rows use warm alternating bg; form inputs use tan borders
- `LoginPage.tsx`, `RegisterPage.tsx`: Forms use cream surface; buttons use terracotta
- `NotFoundPage.tsx`, `MySchedulePage.tsx`: Updated to earth tones throughout
- `ConfirmDialog.tsx`, `LoadingSpinner.tsx`, `BookmarkButton.tsx`, `ErrorMessage.tsx`: Updated to brand tokens

No navy (#0f172a) or teal (#0ea5e9) classes remain anywhere in the codebase. Build passes with 0 TypeScript errors.
<!-- SECTION:FINAL_SUMMARY:END -->
