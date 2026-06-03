---
name: design-critique-pipeline
description: >-
  Runs a full design critique across UI design, interaction design, and content design, then creates a self-contained DocuSketch°-style HTML report. Use when the user asks for an end-to-end UI review, design critique, screen audit, component critique, or shares a screenshot, URL, file path, code snippet, Figma/spec link, or flow and wants broad design feedback rather than one lens only.
---

# Design Critique Pipeline

## Overview

Run a full design critique across three lenses:

- `ui-design-critique` — visual composition, hierarchy, layout, typography, color, density, affordance, reduction.
- `interaction-design-critique` — wayfinding, feedback, visibility, states, consistency, mental models, mapping, flow behavior.
- `content-design-critique` — UI copy, labels, empty states, errors, tone, specificity, sentence case.

The output is critique/reporting only: a self-contained DocuSketch°-style HTML artifact plus a short chat summary and file path.

## When to use

Use this skill when the user asks for:

- “critique this component/screen/UI”
- “review this design end-to-end”
- “audit this screen”
- “run the design critique pipeline”
- broad feedback on a screenshot, URL, local path, code snippet, Figma/spec link, or flow description

## When not to use

- The user asks for one lens only. Use the matching individual skill.
- The user asks to implement fixes. Do not edit source files; offer implementation as a follow-up after the report.
- The user asks for DocuSketch design-system compliance specifically. Use the project’s design-system reviewer/check workflow if available; this skill uses DocuSketch-style artifact presentation, not a compliance audit.
- The target is clearly non-UI backend logic, tests, migrations, or build configuration. Say it is not a UI critique target and stop.

## Core workflow

### 1. Resolve the critique target

Accept any combination of:

- screenshot or image attachment
- URL
- local file or directory path
- pasted code or markup
- raw UI strings
- Figma/design/spec link
- flow description or screen sequence

If multiple inputs are provided, treat them as one target unless the user asks for comparison.

Inspect what is available:

- For paths, read relevant UI files and nearby styles/components.
- For directories, inspect representative UI files; ask the user to narrow scope if the directory is too large to review usefully.
- For screenshots, critique visible evidence and label inferred behavior.
- For URLs or Figma links, inspect only if available tooling permits. If inaccessible, list them as provided but not inspected and ask for a screenshot/export/code only if critique would otherwise be impossible.
- If there is no usable target, ask for one instead of manufacturing critique.

Checkpoint: record inspected evidence and limitations for the HTML report.

### 2. Run the three critique lenses

Use the individual skills as lens contracts:

1. Run `ui-design-critique` for visual/UI findings.
2. Run `interaction-design-critique` for behavior/flow findings.
3. Run `content-design-critique` for user-facing copy findings.

Do not duplicate their full workflows here. Apply each lens to the same resolved target and preserve lens tags in the findings.

### 3. Normalize severity

The pipeline report uses:

- **Critical** — likely blocks the user, causes wrong action, hides essential state/action, or materially damages trust.
- **Warning** — creates friction, ambiguity, cognitive load, or weakens the design but does not block the primary task.
- **Info** — polish, consistency, minor reduction, or low-risk improvement.

Map content severities:

- Blocking → Critical
- Confusing → Warning
- Needs finesse → Info

If a finding depends on missing runtime/flow context, keep the severity conservative and use an evidence-basis label.

### 4. Create the HTML artifact

Before writing the artifact, read `docusketch-html-report.md` in this skill directory and follow it.

Required behavior:

1. Write `/tmp/design-critiques/<slug>-<YYYYMMDD-HHMMSS>.html`.
2. Make the report fully self-contained.
3. Include target evidence and limitations.
4. Include findings grouped by `Critical`, `Warning`, and `Info`.
5. Include evidence basis for every finding: `Direct`, `Inferred`, `Needs runtime check`, or `Not inspected`.
6. Include source references only when available.
7. Include patterns observed and what’s working/no action.
8. Lightly validate the generated HTML.
9. Open it in the browser best-effort.

### 5. Respond in chat

Return only:

- artifact path
- whether browser opening succeeded or failed
- 3–5 top findings or “no findings” summary
- reminder that no source files were changed

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| “A chat critique is enough.” | This suite’s contract is an HTML artifact. Chat is only the summary. |
| “The URL probably shows the screen.” | If the URL was not inspected, list it as not inspected. Do not invent visual evidence. |
| “The component is small, so I can skip one lens.” | Small targets still need lens consideration; omit empty findings, not the lens pass. |
| “I should fix the obvious issues while I’m here.” | These skills critique only. Source edits require a separate explicit user request. |
| “I can use the DocuSketch design system as a checklist.” | The artifact should look DocuSketch-like; this is not a design-system compliance audit unless explicitly requested. |

## Verification

Before finishing, confirm with evidence:

- [ ] Target inputs were resolved, inspected where possible, and limitations recorded.
- [ ] UI, interaction, and content lenses were considered.
- [ ] Content severities were mapped into `Critical / Warning / Info`.
- [ ] `docusketch-html-report.md` was read before writing HTML.
- [ ] HTML file exists under `/tmp/design-critiques/`.
- [ ] HTML contains `<!doctype html>`, `<title>`, and a findings or no-findings section.
- [ ] HTML has no external stylesheet or script dependencies.
- [ ] Browser open was attempted best-effort, or failure was reported with the path.
- [ ] Final response includes the artifact path and states that no source files were changed.
