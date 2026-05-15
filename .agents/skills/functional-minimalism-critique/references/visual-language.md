# Visual Language Reference

Use this reference when critiquing a UI's visual implementation. Prefer the project's existing design system, token files, component library, and documented conventions over ad-hoc values.

## Source of truth

Before flagging visual implementation issues, look for project-specific sources such as:

- Design-system documentation
- Storybook stories
- Component examples
- Token files
- Theme files
- CSS variables
- Tailwind config
- Figma/design references if provided by the user

If no source of truth is available, critique against general interface principles rather than inventing token names.

## Typography

- Use established text styles or type tokens when available.
- Avoid hand-rolled font size, line height, and weight combinations when the project has named text styles.
- Maintain a clear hierarchy between page title, section heading, body text, metadata, and supporting text.
- Avoid decorative type treatments that reduce readability.
- Keep body reading width comfortable; long lines make scanning and comprehension harder.

## Color

- Prefer semantic color tokens over raw hex/RGB values when a token system exists.
- Use status colors consistently: success, warning, danger/error, info, default/neutral.
- Do not communicate status by color alone; pair color with text, icons, or another perceivable cue.
- Avoid competing accent colors on the same surface.
- Preserve sufficient contrast for text, icons, controls, and focus indicators.

## Spacing

- Use the project's spacing scale when one exists.
- Flag off-scale spacing when it creates inconsistency or weakens grouping.
- Use tighter spacing for related items and larger spacing between sections.
- Prefer consistent internal padding within a component family.

## Elevation and shadows

- Use documented elevation or shadow tokens when available.
- Avoid arbitrary custom shadows, glow effects, and decorative depth.
- Elevation should clarify layering, not decorate the interface.
- Overlapping surfaces should have a clear stack order and obvious dismissal path when interactive.

## Border radius

- Use the project's radius scale when one exists.
- Keep radius consistent within a component family.
- Avoid mixing many radius values on the same screen.
- Pill shapes are appropriate when the component role calls for them; otherwise prefer the established system radius.

## Interactive states

- Interactive elements need clear default, hover, active, focus, disabled, loading, and error states where applicable.
- Focus states must be visible and accessible.
- Disabled states should explain why the action is unavailable when the reason is not obvious.
- Loading states should preserve layout stability and communicate whether the user can continue interacting.
- Error states should pair visual treatment with specific, actionable text.

## Layout principles

### Alignment

- Use a clear dominant axis per component.
- Align related content consistently.
- Reserve centered alignment for display, hero, or intentionally symmetric content.
- Use right alignment primarily for numerical data or explicit layout needs.

### Hierarchy

A screen should make priority visible before the user reads every word:

1. Primary content or page title
2. Primary action
3. Supporting content
4. Metadata and tertiary information
5. System UI and low-frequency controls

## What to flag

Common visual-language issues:

- Raw colors where semantic tokens exist.
- Off-scale spacing, radius, or type.
- Inconsistent component styling.
- Custom shadows or effects that do not match the system.
- Weak visual hierarchy.
- Status conveyed only by color.
- Multiple primary actions competing for attention.
- Missing or low-contrast focus states.
- Disabled controls with no discoverable explanation.
