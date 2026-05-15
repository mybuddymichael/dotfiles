---
name: design-critique-pipeline
description: Run the full UI critique pipeline on a component — visual design, interaction design, and UI copy — and return a consolidated severity-ranked report. Use when the user asks to "critique this component," "review this UI end-to-end," "run the design critique pipeline," "audit this screen," or shares a component file/path and asks for a full design review. Accepts a file path as argument, or falls back to the most recently edited component. Distinct from the individual critique skills (functional-minimalism-critique, essential-human-interfaces, content-design-critique) — those run a single lens; this skill orchestrates all three. Do NOT trigger for single-lens requests ("just check the copy," "is the layout aligned") — defer to the matching individual skill.
---

# Design Critique Pipeline

Run the full UI review pipeline on a component. Accepts a file path as argument, or uses the most recently edited component.

## Steps

1. **Resolve the target.** Read the target component and any related files it imports. If no path was provided, identify the most recently edited component file in the working tree.
2. **Visual design audit.** Run the `functional-minimalism-critique` skill. Evaluate hierarchy, alignment, information architecture, affordances, typography, color, and reduction. Flag Critical / Warning / Info issues.
3. **Interaction design audit.** Run the `essential-human-interfaces` skill. Evaluate wayfinding, feedback, visibility, consistency, affordance, progressive disclosure, mental models, mapping, and grouping. Flag issues by impact on the user's ability to complete their task.
4. **Copy audit.** Run the `content-design-critique` skill on every user-facing string in the component. It applies product-agnostic UI writing principles — sentence case, active voice, no directional language, clear empty-state guidance, actionable errors — and ranks findings as Blocking / Confusing / Needs finesse.
5. **Consolidated report.** Output a single report with all findings grouped by severity (Critical > Warning > Info), then by lens within each severity tier. For each finding, include the file, line, the principle violated, what's wrong, and a concrete fix. When mapping `content-design-critique` findings: Blocking → Critical, Confusing → Warning, Needs finesse → Info.
6. **Offer to implement.** Ask whether to apply the fixes automatically. Default to no — surface the findings first so the user can prioritize.

## Output structure

```
## Design Critique — <component name>

### Critical
- **[file:line] Principle violated** (lens)
  Issue: ...
  Fix: ...

### Warning
- ...

### Info
- ...

### What's working
- 2–3 bullets noting solid patterns worth preserving.

### Next steps
- A short ordered list of recommended fixes, highest-impact first.
```

## Judgment calls

- If the component is small (e.g. a single button or input), don't pad the report — return only the lenses that surfaced findings.
- If the file isn't a UI component (server-only logic, utility, test), say so and stop rather than manufacturing critique.
- If the user has explicitly asked for only one lens, defer to the matching individual skill instead of running the full pipeline.
