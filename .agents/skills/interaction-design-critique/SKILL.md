---
name: interaction-design-critique
description: >-
  Reviews how an interface behaves, communicates state, and supports user flow, then creates a self-contained DocuSketch°-style HTML report. Use when the user asks to audit UX, navigation, wayfinding, feedback, affordance, flows, states, mental models, usability, or whether a screen or prototype makes sense to users.
---

# Interaction Design Critique

## Overview

Review whether an interface is learnable, navigable, predictable, and responsive to user action. Focus on behavior and user understanding, not visual polish alone. Create a self-contained DocuSketch°-style HTML report by default.

## When to use

Use this skill when the user asks about:

- UX or interaction critique
- wayfinding, navigation, or flow
- system state, loading, empty, success, or error behavior
- feedback after actions
- affordance and discoverability
- mental models, mapping, progressive disclosure, or usability
- screen sequences, prototypes, flow descriptions, screenshots, URLs, Figma/spec links, local UI files, or pasted code

## When not to use

- The user asks only about visual hierarchy, typography, color, layout, or polish. Use `ui-design-critique`.
- The user asks only about UI copy. Use `content-design-critique`.
- The user wants all lenses. Use `design-critique-pipeline`.
- The user wants source edits. Do critique/reporting only and offer implementation as a follow-up.
- The target is non-UI backend/test/build code. Say so and stop.

## Core workflow

### 1. Resolve the target

Accept any combination of screenshot/image, URL, local path, directory path, pasted code, Figma/spec link, prototype notes, or flow description.

Inspect available evidence:

- For paths, read UI structure and nearby state/handler code when it affects interaction behavior.
- For screen sequences or flow descriptions, evaluate the sequence as a whole.
- For screenshots, critique visible affordances and state communication; mark unobserved behavior as needing runtime check.
- For URLs/Figma links, inspect only if tooling permits. Otherwise list as provided but not inspected.
- If motion, focus, hover, loading, or multi-step state is required to judge the issue and unavailable, label it `Needs runtime check`.
- If there is no usable target, ask for one.

Checkpoint: record inspected evidence, uninspected inputs, runtime limitations, and any screenshot/image/rendered regions that can support focused unannotated crops in the findings.

### 2. Evaluate the interaction lens

Use this compact checklist. Report only relevant issues.

- **Wayfinding** — user knows where they are, where they can go, and how to get back/out.
- **Feedback** — every action has visible, timely response; slow operations show progress.
- **Visibility of state** — current mode/state is apparent; empty/loading/error/success states are distinct.
- **Consistency** — similar controls and flows behave consistently across the surface.
- **Affordance** — controls communicate how to use them without trial and error.
- **Progressive disclosure** — primary path is not buried under advanced or rare choices.
- **80/20 task fit** — common actions are easiest; edge cases do not dominate the happy path.
- **Mental model fit** — terminology, grouping, and sequence match how users think about the task.
- **Mapping** — controls sit near what they affect and produce predictable outcomes.
- **Recovery and exits** — users can undo, cancel, retry, or escape risky/failed states.

### 3. Assign severity

Use:

- **Critical** — blocks task completion, causes likely wrong action, hides essential state, or traps the user.
- **Warning** — causes hesitation, extra work, ambiguity, or fragile understanding.
- **Info** — lower-risk usability refinement, clearer state labeling, or small consistency improvement.

Every finding also needs an evidence basis: `Direct`, `Inferred`, `Needs runtime check`, or `Not inspected`.

### 4. Create the HTML artifact

Before writing HTML, read `../design-critique-pipeline/docusketch-html-report.md` and follow it.

Required report content:

- title and target metadata
- target evidence and limitations
- severity sections: `Critical`, `Warning`, `Info`
- finding cards tagged `Interaction`
- principle, issue, fix, evidence basis, and source when available
- enough focused unannotated visual evidence for each finding that references a visible control, affordance, state, region, or flow step to substantiate the claim, unless the finding includes an explicit `No visual evidence` reason
- multiple visual excerpts when comparison, sequence, state changes, spatial relationship, or multiple affected controls require more than one image
- systemic patterns
- what’s working/no action

Keep critique labels/captions outside images; do not add reviewer-drawn boxes, arrows, highlights, or labels to the image.

Lightly validate the file, including the visual-evidence exit gate from the report recipe, then open it in the browser best-effort.

### 5. Respond in chat

Return only the artifact path, browser-open status, top findings summary, and confirmation that no source files were changed.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| “I can tell how it behaves from one screenshot.” | Single-screen evidence supports affordance/state critique, not complete behavior. Label runtime-dependent claims. |
| “Visual hierarchy is weak, so I’ll critique typography here.” | Stay on interaction unless visual treatment affects affordance, feedback, or state comprehension. |
| “The flow probably has a back button elsewhere.” | If the exit is not in evidence, say it is unobserved instead of assuming it exists. |
| “I should fix the handlers while reading the file.” | This skill reports critique only; edits require a separate request. |
| “This is a behavior issue, so screenshots do not matter.” | If the behavior issue is about a visible control, state, affordance, or flow step, include enough focused unannotated visual references to substantiate the claim or explain why they are unavailable. |
| “I’ll mark the screenshot with arrows.” | Do not alter the original visual evidence. Put the explanation in the caption or finding text. |

## Verification

Before finishing, confirm:

- [ ] Target evidence, flow scope, and runtime limitations were recorded.
- [ ] The interaction checklist was applied selectively and findings are not padded.
- [ ] Findings use `Critical / Warning / Info`.
- [ ] Each finding has evidence basis.
- [ ] Each finding that references a visible UI element/region/state includes enough inline visual evidence to substantiate the claim, or an explicit `No visual evidence` reason.
- [ ] Visual evidence uses unannotated original screenshots/crops, with critique labels outside the image.
- [ ] `../design-critique-pipeline/docusketch-html-report.md` was read.
- [ ] HTML exists in `/tmp/design-critiques/` and follows the self-contained artifact rules in the report recipe, with only approved Google Fonts and Lucide imports.
- [ ] HTML contains `<!doctype html>`, `<title>`, and findings or no-findings section.
- [ ] Browser open was attempted best-effort.
- [ ] Final chat includes artifact path and says no source files were changed.
