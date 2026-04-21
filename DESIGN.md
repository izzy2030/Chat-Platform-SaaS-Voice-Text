---
name: Hydra Chat Design System
version: 1.0.0
description: Premium Clean + Emerald Voice & Text chat platform design system

# Core Design Tokens
colors:
  # Semantic colors (Clean Light Mode Primary)
  background: "#F9FAFA"
  foreground: "#191C1D"
  card: "#FFFFFF"
  card-foreground: "#191C1D"
  popover: "#FFFFFF"
  popover-foreground: "#191C1D"
  primary: "#25A369"
  primary-foreground: "#FFFFFF"
  secondary: "#ECF6E8"
  secondary-foreground: "#2F6A29"
  muted: "#F2F4F5"
  muted-foreground: "#6D7A70"
  accent: "#8BC47F"
  accent-foreground: "#1C2320"
  destructive: "#E14D45"
  destructive-foreground: "#FFFFFF"
  border: "#E4EBE1"
  input: "#F2F4F5"
  ring: "#25A369"

  # Special Surface: Dark Contrast (Reserved for high-priority/live signals)
  surface-dark: "#1A1D1C"
  surface-dark-foreground: "#FFFFFF"
  surface-dark-muted: "rgba(255, 255, 255, 0.45)"
  surface-dark-border: "rgba(255, 255, 255, 0.05)"

  # Sidebar specific
  sidebar: "#FFFFFF"
  sidebar-foreground: "#6D7A70"
  sidebar-primary: "#25A369"
  sidebar-accent: "#ECF6E8"
  sidebar-accent-foreground: "#2F6A29"
  sidebar-border: "#ECEEEF"

typography:
  sans: Plus Jakarta Sans
  serif: Lora
  mono: IBM Plex Mono

  display:
    fontSize: 3rem
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: -0.02em
  
  h1:
    fontSize: 2.25rem
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: -0.01em
  
  h2:
    fontSize: 1.5rem
    fontWeight: 800
    lineHeight: 1.3
  
  label:
    fontSize: 0.625rem # 10px
    fontWeight: 900
    textTransform: uppercase
    letterSpacing: 0.22em

rounded:
  none: 0px
  sm: 8px
  md: 10px
  lg: 12px
  xl: 14px
  full: 9999px

spacing:
  unit: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px

# Components
components:
  card-premium:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.lg}"
    border: "1px solid {colors.border}"
    boxShadow: "0 12px 40px -12px rgba(24,28,29,0.15)"
  
  card-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.surface-dark-foreground}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
    boxShadow: "0 12px 40px -12px rgba(28,35,32,0.45)"

  badge-pill:
    rounded: "{rounded.full}"
    padding: "4px 12px"
    typography: "{typography.label}"

  sidebar-item-active:
    backgroundColor: "{colors.sidebar-accent}"
    textColor: "{colors.sidebar-accent-foreground}"
    fontWeight: 900
---

## Overview

"Dense Elegance" - A high-density, premium UI that balances clean, airy light surfaces with strategic high-contrast dark blocks for priority information. The system uses a specialized emerald green palette to convey health, growth, and clarity.

## Design Philosophy

1. **Information Density**: Maximize signal-to-noise ratio without feeling cluttered. Use generous rounding and subtle shadows to separate layers.
2. **Strategic Contrast**: Reserve the dark `#1C2320` surface for live signals, "Ops Notes", and critical AI performance metrics.
3. **Emerald Accents**: Use green not just as a brand color, but as a functional indicator of "Active", "Resolved", and "Healthy" states.

## Layout Rules

- **The 34px Rule**: Primary dashboard containers use a `34px` border radius (`rounded-huge`).
- **Inner Rounding**: Nested elements should use smaller radii (`24px`, `20px`, `12px`) to maintain visual nesting logic.
- **Glass & Depth**: Use `backdrop-blur` on white cards (`bg-white/90`) to add depth over the global subtle gradient.

## Typography Guidelines

- **Headlines**: Use heavy weights (800-900) for "Welcome" headings.
- **Labels**: Use 10px font size with `tracking-[0.2em]` and `font-black` for all section headers and badges.
- **Muted Text**: Use `#6D7A70` for secondary descriptions to keep the focus on primary data.

## Do's and Don'ts

✅ DO use the `#ECF6E8` light green background for active states and "Healthy" badges.
✅ DO apply the `shadow-premium` to all major cards.
✅ DO keep vertical spacing consistent (py-7 or py-12 for major sections).
❌ DON'T use pure black for text; use `#191C1D`.
❌ DON'T use generic borders; prefer tonal shifts or very subtle shadows.
❌ DON'T mix different rounding styles on the same horizontal level.

