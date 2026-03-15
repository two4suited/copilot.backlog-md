---
id: TASK-54
title: Redesign the site with a fresh modern visual identity
status: In Progress
assignee:
  - '@agent-designer'
created_date: '2026-03-15 00:50'
updated_date: '2026-03-15 00:59'
labels:
  - design
  - frontend
  - ui
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The current site uses a generic blue/white Tailwind theme with minimal personality. Give the ConferenceApp a polished, modern design that feels like a real tech-conference platform (think GitHub Universe, KubeCon, or Microsoft Build landing pages).

Design goals:
- Pick a distinct, cohesive colour palette (e.g. deep navy + electric teal accent, or dark charcoal + vivid purple)
- Add a hero section on the Home page with a conference banner image (placeholder) and a CTA button
- Improve the Schedule page layout: bolder track colour chips, cleaner time grid, better session cards
- Speaker cards: proper avatar, name, company, bio excerpt
- Session detail page: speaker avatar, track badge, seat availability bar
- Admin pages: consistent data-table style with action buttons
- Navigation: add active-link highlighting, mobile hamburger menu (if not present)
- Typography: use a Google Font or system font stack that conveys professionalism
- All Tailwind — no external CSS frameworks introduced
- Responsive: mobile-first, looks good from 375px to 1440px

Also update the Tailwind config (tailwind.config.js) to extend the theme with the new colour tokens so classes like bg-brand-primary, text-brand-accent work consistently across components.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 New colour palette applied globally via tailwind.config.js theme extension
- [x] #2 Home page has a hero section with headline, sub-text, and CTA button
- [x] #3 Conference cards on Home page use the new design system
- [x] #4 Schedule page has improved track chips, time grid, and session cards
- [x] #5 Speaker cards show avatar, name, company, and bio excerpt
- [x] #6 Session detail page shows speaker avatar, track badge, and seat availability bar
- [x] #7 Navigation has active-link highlighting and mobile hamburger menu
- [x] #8 Admin pages use consistent data-table styling
- [x] #9 All pages pass a 375px viewport visual check (no horizontal overflow)
- [x] #10 No new CSS frameworks introduced — Tailwind only
<!-- AC:END -->
