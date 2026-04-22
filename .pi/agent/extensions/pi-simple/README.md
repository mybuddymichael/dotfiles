# pi-simple

A bundled Pi extension that combines the UI/style customizations from this dotfiles repo into a single extension.

## Includes

- `assistant-style`
- `startup-header`
- `status-message-style`
- `tool-one-line`
- `user-message-style`

## Excludes

- `handoff`
- `questionnaire`

## Current structure

This version is intentionally implemented as a thin composition layer over the existing extensions so behavior stays unchanged while the bundle is prepared for extraction into a standalone open-source repo.

## Next steps

1. Verify the combined extension loads correctly.
2. Add screenshots / examples.
3. Decide whether to keep composition or move shared code into this package.
4. Extract to its own repository.
