---
id: TASK-56
title: Redesign site with warm earth tone colour palette
status: To Do
assignee: []
created_date: '2026-03-15 00:58'
labels:
  - design
  - frontend
  - ui
dependencies: []
priority: high
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
- [ ] #1 tailwind.config.js brand tokens updated to earth tone values (linen, espresso, terracotta, sage)
- [ ] #2 Navigation uses cream bg, espresso text, terracotta active/hover states
- [ ] #3 Home hero uses linen bg with espresso headline and terracotta CTA button
- [ ] #4 Conference cards use cream surface with tan border and terracotta date badge
- [ ] #5 Schedule track chips use sage green; session cards use warm cream background
- [ ] #6 Speaker cards show terracotta name highlight on warm surface
- [ ] #7 Session detail page uses terracotta track badge and sage seat availability bar
- [ ] #8 Admin tables use alternating warm row shading with terracotta action buttons
- [ ] #9 No leftover navy (#0f172a) or teal (#0ea5e9) classes anywhere in the codebase
- [ ] #10 All pages pass 375px viewport check with no horizontal overflow
<!-- AC:END -->
