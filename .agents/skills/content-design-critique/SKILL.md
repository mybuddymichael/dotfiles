---
name: content-design-critique
description: >-
  Reviews UI copy and microcopy, then creates a self-contained DocuSketch°-style HTML report with specific rewrites. Use when the user asks to review, audit, or critique interface text, button labels, errors, empty states, onboarding copy, tooltips, modals, forms, pasted strings, screenshots, URLs, Figma/spec links, or code with user-facing strings.
---

# Content Design Critique

## Overview

Review user-facing interface text for clarity, specificity, actionability, tone, and consistency. Create a self-contained DocuSketch°-style HTML report by default, with concrete rewrites for every issue.

## When to use

Use this skill when the user asks to review or critique:

- UI copy or microcopy
- button labels, headings, field labels, helper text, tooltips
- empty states, errors, confirmations, toasts, banners, onboarding
- pasted strings, screenshots, URLs, Figma/spec links, local UI files, or code with rendered text

## When not to use

- The user wants new copy generated without critique. Help normally; do not auto-trigger this review workflow.
- The user asks about visual design. Use `ui-design-critique`.
- The user asks about UX flow or behavior. Use `interaction-design-critique`.
- The user wants all lenses. Use `design-critique-pipeline`.
- The user wants source edits. Do critique/reporting only and offer implementation as a follow-up.
- The text is legal/compliance copy and the issue depends on legal requirements. Note the constraint instead of rewriting as if unconstrained.

## Core workflow

### 1. Resolve the target

Accept raw strings, screenshots/images, URL, local path, directory path, pasted code, Figma/spec link, spreadsheet-like lists, or flow descriptions.

Inspect available evidence:

- For code, extract rendered user-facing strings. Ignore variable names, comments, and non-rendered text unless the user asks otherwise.
- For paths, read nearby component docs/examples if they affect copy patterns.
- For screenshots, review visible copy only.
- For URLs/Figma links, inspect only if tooling permits. Otherwise list as provided but not inspected.
- If component-specific copy guidance exists in the current project, apply it and cite the source. If not, continue with this skill’s principles.
- If there are no reviewable strings, ask for copy, screenshot, or relevant UI file.

Checkpoint: record inspected strings/evidence, uninspected inputs, and copy-scope limitations.

### 2. Evaluate the content lens

Use this compact checklist. Not every principle applies to every string.

- **Clear action** — users know what happens next and what to do.
- **Specificity** — vague nouns, generic errors, and ambiguous CTAs are replaced with concrete information.
- **Brevity** — remove words that do not change meaning.
- **Active voice** — prefer direct, active constructions.
- **User-centered voice** — speak as the product/platform, not as the user; avoid unnecessary “we.”
- **Front-loaded meaning** — the first words carry the message.
- **Errors need exits** — say how to recover, retry, or choose a different path.
- **Empty states onboard** — explain what appears here and give one clear next action.
- **Sentence case** — use sentence case unless a product term is intentionally proper-nouned.
- **No directional language** — avoid “click,” “tap,” “below,” “left,” “green button”; use “select,” “open,” “go to.”
- **Tone fits the moment** — no marketing copy inside task UI; match stakes and emotional state.
- **Name things once** — terminology stays consistent across surfaces.

### 3. Assign content severity

Individual content-design reports use:

- **Blocking** — misleading, missing, or contradictory copy may stop task completion or cause the wrong action.
- **Confusing** — users can continue, but copy creates friction, doubt, or trust loss.
- **Needs finesse** — polish issue: wordiness, tone, sentence case, or minor consistency.

Every finding also needs an evidence basis: `Direct`, `Inferred`, `Needs runtime check`, or `Not inspected`.

### 4. Write rewrites

For each finding, include:

- original copy
- principle violated
- why it matters in this UI moment
- rewrite
- severity
- evidence basis
- source when available

If a string is already good, do not manufacture critique. Capture good patterns under “What’s working.”

### 5. Create the HTML artifact

Before writing HTML, read `../design-critique-pipeline/docusketch-html-report.md` and follow it.

Required report content:

- title and target metadata
- target evidence and limitations
- severity sections: `Blocking`, `Confusing`, `Needs finesse`
- finding cards tagged `Content`
- original, issue, rewrite, evidence basis, and source when available
- repeated copy patterns
- what’s working/no action

Lightly validate the file, then open it in the browser best-effort.

### 6. Respond in chat

Return only the artifact path, browser-open status, top findings summary, and confirmation that no source files were changed.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| “This is only one button label, so no artifact is needed.” | The skill contract requires the HTML artifact; keep it brief for small inputs. |
| “I should rewrite everything to sound nicer.” | Critique only strings that violate a principle or materially improve task clarity. |
| “The code contains identifiers that look user-facing.” | Review rendered strings, not implementation names, unless the user asks for naming critique. |
| “Legal copy is wordy, so I’ll simplify it aggressively.” | Compliance text may have constraints. Flag the tradeoff and avoid unsupported rewrites. |
| “I can patch the string while I’m here.” | Do not edit source files in critique mode. |

## Verification

Before finishing, confirm:

- [ ] Reviewable user-facing strings were identified or missing input was requested.
- [ ] Component/project copy guidance was checked when discoverable and relevant.
- [ ] Findings use `Blocking / Confusing / Needs finesse`.
- [ ] Each finding has a concrete rewrite unless the finding is a pattern-level note.
- [ ] Each finding has evidence basis.
- [ ] `../design-critique-pipeline/docusketch-html-report.md` was read.
- [ ] HTML exists in `/tmp/design-critiques/` and is self-contained.
- [ ] HTML contains `<!doctype html>`, `<title>`, and findings or no-findings section.
- [ ] Browser open was attempted best-effort.
- [ ] Final chat includes artifact path and says no source files were changed.
