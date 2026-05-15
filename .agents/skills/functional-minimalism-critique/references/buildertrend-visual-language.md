# Buildertrend Visual Language Reference

This is a project-specific reference for Buildertrend/Blueprint/BDS work. Do not use it for general UI critique unless the user is working in a Buildertrend or Blueprint codebase.

Design token shapes for critique. Buildertrend's Blueprint Design System (BDS) is the source of truth, with **BTNet's `@btnet/blueprint-design-tokens` package** as the authoritative copy (the standalone `@buildertrend/design-tokens` repo is being retired in favor of the BTNet-hosted version). Authoritative path in BTNet: `frontend/packages/blueprint/design-tokens/src/tokens/`. This doc summarizes the token surface so findings can name the correct token instead of a hex code or px value. When a design uses an ad-hoc value (hardcoded color, off-grid spacing, non-BDS radius, custom shadow), flag it and point at the BDS token it should resolve to.

## Typography

BDS exposes text styles, not raw type ramps. Use the style tokens — don't compose font-size + line-height + weight ad hoc.

### Style families
```
text.normal.{sm, md, lg}        Body and UI text, font = {font.product}
text.distinct.{sm, md, lg}      Emphasized UI text (medium/semibold weights)
text.heavy.{sm, md, lg, xl}     Display and headings, font = {font.brand}
```

### Font families
```
{font.product}    Product UI       resolves to 'Inter-bds' (Inter)
{font.brand}      Brand / display  resolves to 'GTWalsheimPro-bds' (GT Walsheim)
```

### Type primitives (referenced by `text.*` styles)
```
font.size:       sm 12 / md 14 / lg 16 / xl 20 / 2xl 24 / 3xl 30 / 4xl 34 / 5xl 42  (px)
font.lineHeight: sm 16 / md 20 / lg 24 / xl 32 / 2xl 36 / 3xl 44 / 4xl 48           (px)
font.weight:     normal 400 / medium 500 / semibold 600 / bold 700 / black 900
```

These are exposed for completeness; in component code you should bind to a `text.*` style token rather than composing size + line-height + weight directly.

### Type rules
- Use a `text.*` style token; don't hand-roll font-size + line-height + weight.
- `text.heavy.*` is for display and headings only — not for inline emphasis.
- No italics unless quoting or emphasis is essential.
- No underlines except interactive links.
- Body reading width: 65–75 characters.

## Color

BDS color is alias-based. Components and pages should bind to semantic aliases, not raw palette steps (e.g. `color.brand.primary1`, not `color.blue.90`). Raw palette tokens are an implementation detail of the aliases.

### Core aliases
```
color.base.background        Page background
color.base.foreground        Primary text on base background

color.brand.primary1         Primary brand
color.brand.primary2         Primary accent
color.brand.secondary1/2/3   Secondary brand colors

color.success.{background, foreground}
color.warning.{background, foreground}
color.danger.{background, foreground}
color.info.{background, foreground}
color.default.{background, foreground}
```

### Dark mode
Every alias has a `color.dark.*` counterpart. Surfaces that flip with theme should bind to the alias and let BDS resolve the mode, not branch in component code.

### Color rules
- One brand color carries primary action emphasis per screen.
- Status uses the matching alias pair (`color.danger.foreground` on `color.danger.background`, etc.) — don't mix and match.
- Never: colored shadows, gradient backgrounds, more than one brand accent fighting for attention, raw hex in component code where an alias exists.

## Spacing

BDS spacing scale uses step numbers, **not** literal pixel values, on a 4px base. `spacing.4` is 16px, not 4px.

### Component scale (steps used in practice)
```
spacing.0    0px
spacing.05   2px
spacing.1    4px
spacing.2    8px
spacing.3   12px
spacing.4   16px
spacing.5   20px
spacing.6   24px
spacing.8   32px
spacing.10  40px
spacing.12  48px
spacing.16  64px
spacing.20  80px
spacing.24  96px
```

Fractional steps exist for fine-tuning — `spacing.025` (1px), `spacing.1-2-5` (5px), `spacing.1-5` (6px), `spacing.6-5` (26px), `spacing.7` (28px), `spacing.9` (36px) — but should be rare in component code.

### Layout scale
BTNet extends the spacing tokens for layout-level spacing: `spacing.25` (100px), `.28` (112px), `.30` (120px), `.32` (128px), `.34` (136px), `.36` (144px), `.37` (148px), `.60` (240px), `.70` (280px), `.90` (360px), `.160` (640px). Use these for page-level structure (column gutters, hero block heights, max-width gates) rather than hand-rolling large `px` or `rem` values.

### Spacing rules
- Use a BDS step. Off-scale values (e.g. 18px, 26px) need justification or are a finding.
- Component internal padding: `spacing.4`–`spacing.6` (16–24px) by default.
- Inline element gaps: `spacing.2`–`spacing.4` (8–16px).
- Major section gaps: `spacing.8`–`spacing.16` (32–64px).

## Elevation & shadows

BDS elevation is named by **role**, not size — there is no `shadow.sm/md/lg/xl`.

### Tokens
```
elevation.sunken      Inset / pressed surfaces
elevation.default     Flat (no shadow)
elevation.raised      Cards, buttons at rest
elevation.floating    Modals, dropdowns, popovers
elevation.overflow    Scroll-edge / overflow indicator
```

Dark mode has its own variant (`elevation.dark.sunken`).

### Elevation rules
- Pick the role, not a magnitude. A "slightly more shadow than the card" pattern is a finding — choose `raised` or `floating`.
- No colored shadows, no glow effects, no parallax stacking outside of BDS roles.

## Border radius

```
radius.none   0
radius.xs     2px
radius.sm     4px
radius.md     8px
radius.lg    12px
radius.xl    16px
radius.2xl   20px
radius.half  50%   (circular elements only — avatars, dots)
```

### Radius rules
- Pick a BDS step. Custom radii (e.g. 6px, 10px, 14px) are findings.
- Keep radius consistent within a component family — don't mix `radius.sm` and `radius.md` on parts of the same card.
- Pill buttons OK when the component's role calls for it; otherwise prefer `radius.sm`–`radius.md`.

## Interactive states

State patterns aren't tokenized as primitives but follow these rules. Concrete values come from the component's BDS bindings (`color.brand.*`, `elevation.raised`, etc.).

### Buttons
- Default: solid background using a `color.brand.*` or `color.default.*` alias, `cursor: pointer`.
- Hover: subtle darken via BDS hover variant — not an ad-hoc `rgba()` overlay.
- Active: brief depression, typically `elevation.sunken` or a scale transform ≤ 0.98.
- Disabled: `opacity` reduction + `cursor: not-allowed`. Disabled state must explain *why* somewhere reachable.
- Focus: visible ring using BDS focus token — never `outline: none` without a replacement.

### Inputs
- Default: subtle border/background via BDS alias.
- Focus: border darkens to brand/focus token.
- Error: border uses `color.danger.foreground` with adjacent error text — color alone is not sufficient.
- Disabled: opacity + `color.default.*` background.

### Links
- Underline by default; color inherits or uses brand alias.
- Hover keeps underline; visited may darken.

## Layout principles

### Alignment
- Single dominant axis per component.
- Left-aligned by default (LTR).
- Right-alignment only for numerical data or explicit purpose.
- Center-alignment only for hero/display content.

### Hierarchy
1. One hero element (largest type, often `text.heavy.*`).
2. Primary action (highest contrast — typically `color.brand.primary1` background).
3. Supporting content (`text.normal.*` on `color.base.foreground`).
4. Tertiary information (reduced opacity or `color.default.foreground`).
5. System UI (near-invisible until needed).

## What to flag

When critiquing a design or component, the most common BDS deviations:
- Hardcoded hex codes or RGB values where a `color.*` alias exists.
- Off-scale spacing (anything not in the `spacing.*` ladder above).
- Off-scale radii.
- Ad-hoc shadows (custom `box-shadow` instead of `elevation.*`).
- Hand-composed type instead of `text.*` style tokens.
- Mixing `color.brand.primary1` with another brand alias on the same surface for emphasis (only one carries the primary action).
- Status communicated by color alone (no icon, no label, no matching alias pair).
