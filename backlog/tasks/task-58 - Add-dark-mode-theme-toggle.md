---
id: TASK-58
title: Add dark mode theme toggle
status: In Progress
assignee:
  - '@agent-darkmode'
created_date: '2026-03-15 01:06'
updated_date: '2026-03-15 01:11'
labels:
  - design
  - frontend
  - feature
  - accessibility
dependencies: []
priority: medium
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
- [ ] #1 Dark mode toggle (sun/moon icon) in navigation bar
- [ ] #2 Dark palette uses warm espresso/charcoal backgrounds, not generic greys
- [ ] #3 All pages render correctly in dark mode with no unthemed elements
- [ ] #4 User preference persisted to localStorage
- [ ] #5 Respects prefers-color-scheme on first visit if no saved preference
- [ ] #6 Dark mode text passes WCAG AA contrast on all dark surfaces
- [ ] #7 tailwind.config.js uses darkMode: 'class' strategy
<!-- AC:END -->
