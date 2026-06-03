---
name: ui-design-critique
description: >-
  Reviews UI visual design and composition, then creates a self-contained DocuSketch°-style HTML report. Use when the user asks to critique or improve how a screen, component, screenshot, mockup, code path, URL, or design comp looks: hierarchy, layout, alignment, density, typography, color, visual affordance, polish, or reduction.
---

# UI Design Critique

## Overview

Review the visual design of an interface: what the user sees, what draws attention, how information is arranged, and whether the surface feels resolved. Create a self-contained DocuSketch°-style HTML report by default.

## When to use

Use this skill when the user asks about:

- visual design critique
- layout or alignment
- hierarchy and focal point
- typography, color, spacing, density, or polish
- whether a UI looks clean, minimal, professional, or visually coherent
- screenshots, mockups, local UI files, pasted code, URLs, Figma/spec links, or design comps

## When not to use

- The user wants flow behavior, navigation, feedback, or state logic reviewed. Use `interaction-design-critique`.
- The user wants UI copy reviewed. Use `content-design-critique`.
- The user wants all lenses. Use `design-critique-pipeline`.
- The user wants source edits. Do critique/reporting only and offer implementation as a follow-up.
- The target is non-UI backend/test/build code. Say so and stop.

## Core workflow

### 1. Resolve the target

Accept any combination of screenshot/image, URL, local path, directory path, pasted code, Figma/spec link, or written description.

Inspect available evidence:

- For paths, read the UI file and nearby styles/components that affect visual output.
- For directories, inspect representative UI files and ask to narrow scope if too broad.
- For screenshots/mockups, critique visible evidence only.
- For URLs/Figma links, inspect only if tooling permits. Otherwise list as provided but not inspected.
- If the input is insufficient for visual critique, ask for a screenshot, mockup, rendered HTML, or relevant UI file.

Checkpoint: record inspected evidence, provided-but-not-inspected evidence, and limitations.

### 2. Evaluate the UI design lens

Use this compact checklist. Do not force every item into the report; report what affects the design.

- **Hierarchy** — one clear focal point; primary action recognizable quickly; visual weight matches importance.
- **Layout and alignment** — stable grid/axis; reading order is obvious; spatial relationships match meaning.
- **Density and rhythm** — spacing supports the user’s task; dense areas stay scannable; whitespace has a job.
- **Typography** — type scale has purpose; weights are sparing; labels/body/headings are distinguishable.
- **Color and contrast** — color has semantic purpose; states are distinguishable; accent use is restrained.
- **Visual affordance** — interactive elements look interactive; static content does not look clickable.
- **Grouping** — related items are near each other; unrelated items are separated.
- **Reduction** — remove decoration, duplicate labels, or redundant chrome that does not help the task.
- **Aesthetic resolution** — the screen feels deliberate rather than assembled from arbitrary parts.

### 3. Assign severity

Use:

- **Critical** — visual structure can cause wrong action, hides primary task/action, or makes the screen hard to use.
- **Warning** — visual friction, weak hierarchy, ambiguous grouping, or inconsistent treatment slows comprehension.
- **Info** — polish, simplification, small consistency issue, or low-risk refinement.

Every finding also needs an evidence basis: `Direct`, `Inferred`, `Needs runtime check`, or `Not inspected`.

### 4. Create the HTML artifact

Before writing HTML, read `../design-critique-pipeline/docusketch-html-report.md` and follow it.

Required report content:

- title and target metadata
- target evidence and limitations
- severity sections: `Critical`, `Warning`, `Info`
- finding cards tagged `UI`
- principle, issue, fix, evidence basis, and source when available
- patterns observed
- what’s working/no action

Lightly validate the file, then open it in the browser best-effort.

### 5. Respond in chat

Return only the artifact path, browser-open status, top findings summary, and confirmation that no source files were changed.

## Optional supporting references

This skill directory may include legacy visual reference files. Read them only when they are relevant to the current target:

- `references/visual-language.md` — when reviewing code/styles against a project’s existing visual conventions.
- `references/component-patterns.md` — when the target matches one of the documented component patterns and examples would sharpen the critique.

Do not let these references override the required HTML artifact workflow.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| “The screenshot is enough to infer the whole flow.” | Screenshot-only critique is visual evidence. Label behavior as inferred or defer it to interaction review. |
| “This is just a small component, so no HTML report is needed.” | The skill contract requires the artifact even for small critiques; keep the report short instead. |
| “I should mention copy and flow issues too.” | Note only visual issues here unless they directly affect visual comprehension; route broader review to the pipeline. |
| “I can fix spacing while I’m looking at the file.” | Do not edit source files in critique mode. |

## Verification

Before finishing, confirm:

- [ ] Target evidence and limitations were recorded.
- [ ] The visual checklist was applied selectively and findings are not padded.
- [ ] Findings use `Critical / Warning / Info`.
- [ ] Each finding has evidence basis.
- [ ] `../design-critique-pipeline/docusketch-html-report.md` was read.
- [ ] HTML exists in `/tmp/design-critiques/` and is self-contained.
- [ ] HTML contains `<!doctype html>`, `<title>`, and findings or no-findings section.
- [ ] Browser open was attempted best-effort.
- [ ] Final chat includes artifact path and says no source files were changed.
