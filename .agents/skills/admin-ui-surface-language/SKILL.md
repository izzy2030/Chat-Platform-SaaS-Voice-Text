---
name: admin-ui-surface-language
description: Design or refactor admin, dashboard, studio, and app-surface UIs using a restrained premium system of soft white cards, pale green support surfaces, and selective dark contrast. Use when the goal is to elevate a product UI without overusing accents, make pages feel cohesive, or translate a good-looking reference page into a repeatable visual language across the rest of an app.
---

# Admin UI Surface Language

Use this skill to make product UI feel elevated, calm, and deliberate without making every page loud.

This is for app surfaces, not marketing pages.

## Core Idea

The system is built on **contrast discipline**:

- most surfaces stay white or off-white
- pale green is used as a supportive accent, not the main event
- dark panels appear only where emphasis is earned

The goal is not "make it green."
The goal is "make hierarchy obvious."

## When To Use

Use this skill when:

- a dashboard feels flat or generic
- an admin page needs to feel more premium
- one page looks strong and the rest of the app should match it
- the UI needs more contrast and hierarchy without becoming noisy
- the user likes soft neutrals, pale greens, and restrained emphasis

Do not use this skill when:

- the product already has a very different established brand system
- the task is a public marketing site rather than an internal/product UI
- the user explicitly wants a loud, saturated, or heavily themed direction

## Visual Rules

### 1. Background Atmosphere

Do not leave the whole page on a flat solid white.

Use a subtle page atmosphere:

- soft off-white base
- faint radial tint or gradient near the top
- very low-contrast green wash only when it helps framing

The background should be felt more than noticed.

### 2. Surface Hierarchy

Use three surface levels only:

1. `Primary surfaces`
Bright white or warm white cards for main content, lists, forms, and data-heavy blocks.

2. `Support surfaces`
Very pale green or warm neutral blocks for secondary groupings, empty states, helper cards, or low-pressure summaries.

3. `Contrast surfaces`
Dark cards only for high-importance moments:
- live status
- previews
- guidance
- launch/create actions
- operational summaries

If everything gets contrast, nothing has contrast.

### 3. Accent Discipline

Green should mostly show up in:

- badges
- selected states
- icons
- subtle glows
- call-to-action emphasis
- positive status cues

Do not flood cards, borders, headings, and backgrounds with the same accent.

### 4. Card Rhythm

Within a page:

- keep most cards white
- let some alternate into pale green support surfaces
- reserve one dark block for emphasis

Good rhythm:

- white
- white
- pale green
- white
- dark emphasis

Bad rhythm:

- green tint everywhere
- dark cards everywhere
- every card trying to be the hero

### 5. Typography

For admin/product surfaces:

- strong headline weight
- compact tracking on main headings
- small uppercase labels for section framing
- medium-weight body copy
- avoid decorative typography unless the whole product supports it

Typography should create hierarchy before color does.

## Layout Pattern

For most dashboard/admin pages, prefer:

1. `Hero shell`
- rounded high-level container
- short label badge
- strong headline
- practical supporting copy
- 1 dark contrast block or preview block alongside

2. `Main content grid`
- large white content area
- smaller support rail or summary rail

3. `Card system`
- content cards in white
- selected/support cards in pale green
- one darker card for urgency, live state, or guidance

## Component Guidance

### Headers

Headers should feel editorial but practical:

- one eyebrow label
- one strong headline
- one clear paragraph
- metrics or actions grouped cleanly

### Metrics

Metrics should not all look identical.

Use:

- white cards for normal metrics
- pale green for positive/live/supportive metrics
- amber or slate for secondary variation
- dark background only for the single most important operational block

### Lists

Lists should live on clean white cards.

Use pale green for:

- selected states
- highlighted rows
- filtered-empty helper blocks

Do not make the whole list area tinted unless there is a strong reason.

### Detail Panes

A detail pane is a great place for the dark treatment.

This works especially well for:

- conversation detail
- call detail
- preview panels
- operational summaries

The adjacent list stays light. The drill-in surface gets the stronger contrast.

### Forms

Forms should stay mostly white.

Use pale green around:

- framing cards
- grouped helper content
- preview boxes
- success or readiness hints

Do not color every field wrapper.

## Implementation Rules

- Preserve existing UI primitives when possible.
- Prefer utility classes for most styling.
- Use inline style only when colors must react to live state or user input.
- Keep borders soft and low-contrast.
- Favor rounded corners and layered spacing over heavy decoration.
- Shadows should be soft and atmospheric, not sharp and busy.

## Default Palette Behavior

You do not need these exact hex values, but keep the relationships:

- page background: warm white / off-white
- primary cards: white
- support cards: very pale green
- accent green: medium natural green
- contrast block: deep charcoal-green
- secondary warning/support: soft amber or muted slate

## Page Conversion Workflow

When upgrading an existing page:

1. Identify the page's main job.
2. Decide which block deserves the strongest emphasis.
3. Keep core content bright and readable.
4. Move support content into pale green surfaces.
5. Add at most one dark emphasis block.
6. Check the page for overuse of the accent color.
7. Remove any repeated "special" treatment that weakens hierarchy.

## Smell Checks

If the page feels wrong, check these first:

- Too much green? Pull most of it back to white.
- Too many dark cards? Leave only one.
- Everything looks equally important? Strengthen hierarchy in typography and surface selection.
- Still feels generic? Improve the hero shell and the one emphasis block.

## Final Check

Before calling the UI done, confirm:

- the page feels brighter than it feels tinted
- pale green is present but not dominant
- dark contrast appears only where it matters
- the hierarchy is understandable at a glance
- the page matches surrounding admin surfaces instead of fighting them
- the result still works on mobile
