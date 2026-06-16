---
name: pi-ui-renderer
description: Guides agents to validate visible Pi UI changes with the pi-ui-render CLI. Use when creating or editing Pi extensions, themes, renderers, monkeypatches, or TUI components that affect tool rows, user/assistant messages, custom messages, widgets, footers, editors, dialogs, status, or working indicators.
---

# Pi UI Renderer

## Overview

Use the Pi UI renderer whenever you change code that can affect what Pi displays. The renderer must show the same ANSI terminal output Pi would show with the user's global extensions loaded.

The source of truth in this repo is:

```bash
node pi/agent/extensions/pi-ui-renderer/src/cli.mjs <fixture.json> --extensions-dir pi/agent/extensions
```

For installed/global use, omit `--extensions-dir` so the renderer loads `~/.pi/agent/extensions`.

## When to Use

Use this skill when working on:

- Pi extensions that render or override tools.
- Built-in tool UI overrides (`bash`, `read`, `edit`, `write`, `grep`, `find`, `ls`).
- Assistant, user, or custom message rendering.
- Themes or styling that change visible Pi output.
- TUI components, widgets, footers, editor UI, dialogs, overlays, status lines, or working indicators.
- Any user request like “does this render correctly?”, “change Pi UI”, “validate the Pi UI”, or “use pi-ui-renderer”.

## When NOT to Use

Do not use this skill for:

- Non-UI Pi extension changes, unless the changed behavior also affects visible output.
- General TypeScript refactors with no visible Pi UI impact.
- Browser or web UI validation.
- Replacing proper runtime validation with a static code review.

## Core Workflow

### 1. Identify every touched UI surface

Before editing or before final validation, list which surfaces the change can affect:

| Change type | Fixture surface |
|---|---|
| Assistant message UI | `surface: "message", role: "assistant"` |
| User message UI | `surface: "message", role: "user"` |
| Custom message renderer | `surface: "message", customType: "..."` |
| Tool renderer or tool override | `surface: "tool"` |
| Built-in tool override | `surface: "tool"` with the actual tool name, e.g. `bash`, `read`, `edit` |
| Collapsed/expanded behavior | `expanded: "both"` |
| Execution-sensitive output | `mode: "execute"` |
| Deterministic visual state | `mode: "fixture"` |

If the touched surface is not supported by `pi-ui-renderer`, stop and either extend the renderer or clearly tell the user validation is incomplete. Do not pretend unsupported rendering is verified.

### 2. Create or update a strict fixture

Use a hand-written JSON fixture. Put it in `/tmp` for one-off exploration, or commit it near the renderer/extension when it is useful regression coverage.

Tool fixture example:

```json
{
  "surface": "tool",
  "tool": "bash",
  "mode": "execute",
  "cwd": ".",
  "width": 100,
  "expanded": "both",
  "args": { "command": "echo hello" }
}
```

Assistant message fixture example:

```json
{
  "surface": "message",
  "role": "assistant",
  "width": 100,
  "content": "Here is **markdown** with `code`."
}
```

User message fixture example:

```json
{
  "surface": "message",
  "role": "user",
  "width": 100,
  "content": "How did this render?"
}
```

Custom message fixture example:

```json
{
  "surface": "message",
  "customType": "my-extension",
  "width": 100,
  "expanded": "both",
  "content": "Custom message text",
  "details": {}
}
```

### 3. Render through the same extension loading path Pi uses

From this dotfiles repo before stow, run:

```bash
node pi/agent/extensions/pi-ui-renderer/src/cli.mjs /tmp/fixture.json --extensions-dir pi/agent/extensions --metadata
```

For installed/global validation, run:

```bash
node ~/.pi/agent/extensions/pi-ui-renderer/src/cli.mjs /tmp/fixture.json --metadata
```

Requirements:

- Preserve ANSI output. Do not pipe through tools that strip color/style unless doing a secondary plain-text sanity check.
- Use `cat -v` only as an inspection aid; raw ANSI stdout is the source of truth.
- Confirm relevant global extensions loaded. In this setup, message rendering should include `pi-simple` chrome such as `AGENT`, `USER`, `┃`, and `╱╱╱` when validating user/assistant messages.
- Do not validate only against base Pi components when global extensions affect the surface.

### 4. Inspect the rendered output against the intended UI

Check concrete markers, not vibes:

- Labels and chrome are present (`AGENT`, `USER`, tool labels, custom labels).
- Borders/gutters/separators are present (`┃`, `╱╱╱`, boxes, spacing).
- ANSI styling is present where color/style matters.
- Collapsed and expanded states differ correctly when `expanded: "both"` is used.
- Executed tool output appears where Pi would show it.
- Width-sensitive wrapping/padding looks correct at the fixture width.

If output is wrong, fix the extension or renderer, then rerun. Do not finalize based on a stale or mismatching render.

### 5. If the renderer itself changed, validate the harness

When editing `pi/agent/extensions/pi-ui-renderer`, run:

```bash
cd pi/agent/extensions/pi-ui-renderer
npm run validate
```

This must pass before trusting renderer output. For ordinary Pi UI extension edits, run targeted fixtures; use `npm run validate` if the renderer behavior seems suspect.

### 6. Treat live Pi observations as authoritative

If the user says live Pi renders differently than `pi-ui-renderer`:

1. Re-check `--extensions-dir` or global extension location.
2. Ensure symlinked/global extension directories are loaded.
3. Ensure lifecycle hooks needed for monkeypatches are run.
4. Check whether the surface is actually supported by the renderer.
5. Fix or extend `pi-ui-renderer`, then rerun validation.

Do not proceed with UI changes using a renderer known to mismatch live Pi.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| “The code change is obvious; I can inspect it statically.” | Pi UI often depends on runtime extension loading, monkeypatches, theme state, width, and ANSI behavior. Render it. |
| “Base Pi components render fine, so this is validated.” | The user's UI includes global extensions. Missing `AGENT`, `USER`, `┃`, or `╱╱╱` means the harness is not matching their Pi. |
| “I can strip ANSI to make the output easier to read.” | ANSI is part of the UI. Plain text can help inspection, but raw ANSI output is the validation artifact. |
| “Only collapsed state matters.” | Pi users can expand tool/message output. If expanded behavior can change, render `expanded: "both"`. |
| “The renderer does not support this surface, but the code looks right.” | Unsupported surfaces are unverified. Extend the renderer or report incomplete validation. |
| “The user’s live Pi output is probably stale.” | Treat the user’s live observation as authoritative until the renderer proves it matches. |

## Red Flags

- Final response says “should render” without a renderer command and observed markers.
- Fixture uses the wrong extension directory or omits global extensions when validating this repo.
- Output lacks expected global chrome for user/assistant messages.
- Validation only covers one state when the change affects collapsed and expanded states.
- The fixture executes a mutating tool unintentionally in the wrong `cwd`.
- Renderer warnings/errors are ignored.
- Unsupported UI surfaces are described as validated.

## Verification

Before finishing UI-affecting Pi extension work, confirm:

- [ ] Each touched visible surface has a fixture or an explicit unsupported-surface note.
- [ ] The renderer command was run with the correct extension loading path.
- [ ] Raw ANSI output was inspected, not only stripped/plain output.
- [ ] Expected visual markers were observed and recorded.
- [ ] If editing `pi-ui-renderer`, `npm run validate` passed.
- [ ] Any mismatch with live Pi was resolved before relying on the renderer.
- [ ] The final response lists fixture path(s), command(s), and evidence markers checked.
