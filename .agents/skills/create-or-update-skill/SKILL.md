---
name: create-or-update-skill
description: Creates new agent skills and updates existing skills so they follow the documented SKILL.md format and Addy Osmani-style skill guidance. Use when the user wants to create a skill, change a skill's behavior, audit a skill, improve a skill's trigger description, convert guidance into a skill, or make an existing skill more workflow-driven and verifiable.
---

# Create or Update Skill

## Overview

This skill turns intended agent behavior into a focused, executable skill. It enforces the documented skill anatomy and Addy Osmani's core guidance: skills are workflows, not essays; verification is non-negotiable; progressive disclosure beats context dumping; and agents need anti-rationalization guardrails.

## When to Use

Use this skill when:

- Creating a new `SKILL.md`.
- Updating an existing skill's behavior, trigger description, workflow, verification, or structure.
- Converting advice, notes, a blog post, a checklist, or team practice into an agent skill.
- Auditing whether a skill is actionable, scoped, and verifiable.
- Reviewing a skill for compliance with the required frontmatter and recommended skill anatomy.

Do not use this skill for:

- General product discovery or vague requirement elicitation. If the intended behavior is unclear, use `interview-me` or `grill-me` first.
- Implementing the feature that a skill describes. This skill authors the workflow; it does not perform the target workflow.
- Adding generic scaffolding, eval systems, scripts, or directories not required by the specific skill.

## Core Workflow

### 1. Establish the target contract

Before writing or editing, identify:

- The skill name and target directory.
- Whether this is a new skill or an update.
- The behavior the skill should enable.
- The situations that should trigger it.
- The situations that should not trigger it.
- The expected output or end state when the skill is followed.

If these are not knowable from the prompt or repository, stop and use an appropriate discovery skill. Do not hide uncertainty inside a draft.

### 2. For updates, preserve before improving

When updating an existing skill:

1. Read the existing `SKILL.md` completely.
2. Preserve the existing directory name and frontmatter `name` unless the user explicitly authorizes a rename.
3. Extract the current contract: triggers, workflow, outputs, required tools, verification, and exclusions.
4. Audit against `skill-quality-rubric.md`.
5. Classify proposed edits as:
   - **Required format fix** — needed for valid skill anatomy.
   - **Preserving improvement** — clearer wording, better ordering, stronger verification, or tighter anti-rationalizations without changing behavior.
   - **Behavior change** — different trigger scope, required process, output format, tools, strictness, or success criteria.
6. Make surgical edits by default. Do not rewrite the whole skill unless the existing structure prevents a coherent workflow or the user asks for a rewrite.

Behavior-changing edits require explicit user authorization.

### 3. Validate frontmatter first

Every `SKILL.md` must start with YAML frontmatter:

```yaml
---
name: lowercase-hyphen-separated
description: Guides agents through [task/workflow]. Use when [specific trigger conditions].
---
```

Check:

- `name` is lowercase and hyphen-separated.
- `name` matches the directory name.
- `description` says what the skill does and when to use it.
- `description` is 1024 characters or fewer.
- `description` does not summarize the whole workflow. If it includes process steps, agents may follow the summary instead of reading the skill.

### 4. Convert reference prose into workflow

Reject drafts that are mainly background knowledge, principles, or advice. Convert them into actions the agent can perform.

A usable skill has:

- Ordered steps or phases.
- Decision points with clear branches.
- Specific techniques only where they change behavior.
- Checkpoints that produce evidence.
- Exit criteria that can be verified.

If source material is long, extract the workflow and move only genuinely necessary reference material into supporting files.

### 5. Include the functional components

Use the documented section pattern or equivalent headings that serve the same purpose:

- Overview / purpose.
- When to use and when not to use.
- Core workflow or process.
- Specific techniques, patterns, templates, or examples where useful.
- Common rationalizations.
- Red flags.
- Verification.

The headings may vary, but the functions should be present unless there is a clear reason they do not apply.

### 6. Add anti-rationalization guardrails

Include a `Common Rationalizations` table for any step an agent is likely to skip.

Use this pattern:

```markdown
| Rationalization | Reality |
|---|---|
| "This is simple enough to skip verification." | Simple changes still need evidence. A passing check or explicit inspection is cheaper than debugging a bad skill later. |
```

Target excuses the agent is likely to make, not generic motivational slogans.

### 7. Define evidence-based verification

Every skill needs a verification section that answers: "What evidence proves this workflow was followed?"

Good verification items are observable:

- The required command output was captured.
- The edited file contains valid frontmatter.
- The generated artifact exists at the stated path.
- The user approved an explicit behavior change.
- The final response lists changed files and evidence.

Avoid unverifiable items like "the skill is good" or "the guidance is clear" unless paired with concrete checks.

External eval files, scripts, or review tools are optional. Add them only when the specific skill needs them.

### 8. Apply progressive disclosure

Keep `SKILL.md` as the entry point. Add supporting files only when they reduce context load or keep the main workflow focused.

Create supporting files when:

- Reference material is long enough to distract from the workflow.
- A template or checklist is reused across multiple steps.
- Runnable helper scripts are genuinely part of the skill's workflow.

Do not create empty `scripts/`, `references/`, `evals/`, or assets directories just to mirror a template.

### 9. Enforce scope discipline

Touch only what the user asked to change and what the documented skill format requires.

Do not add:

- New conventions not requested by the user or required by the skill anatomy.
- Generic benchmarking systems.
- Schemas or scripts unrelated to the target skill's workflow.
- Refactors to neighboring skills.
- Renames of existing skills without approval.

If you notice adjacent improvements, report them as follow-up options instead of making them silently.

### 10. Final review against the rubric

Before finishing, read `skill-quality-rubric.md` and check the skill against it. Fix failures before presenting the result, or explicitly explain why a rubric item does not apply.

## Skill Authoring Patterns

### New skill structure

```text
.agents/skills/<skill-name>/
  SKILL.md
  optional-supporting-file.md
```

`SKILL.md` is required. Supporting files are optional and should earn their existence.

### Update report structure

When presenting an update, summarize:

- Files changed.
- Whether the skill's behavior changed.
- Any user-approved behavior changes.
- Verification performed.
- Follow-up improvements noticed but not made.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I'll just write a helpful essay; the agent will infer the workflow." | Agents skip invisible process. Skills must contain steps, checkpoints, and exit criteria. |
| "This skill is simple, so it does not need verification." | Simple skills still need evidence that the workflow was followed and the file format is valid. |
| "A longer description will make triggering more reliable." | The description is a router, not the workflow. Overloading it causes agents to skip reading the body. |
| "I'll add scripts/evals/templates because good skills have them." | Supporting files are optional. Add them only when the specific workflow needs them. |
| "This existing skill is messy, so I'll rewrite and rename it." | Updates preserve name, directory, and contract unless the user authorizes behavior changes. |
| "The source material is valuable, so it all belongs in SKILL.md." | Skills use progressive disclosure. Keep the workflow inline and move or omit reference material that does not change agent behavior. |

## Red Flags

- The draft reads like a blog post, policy, or best-practices essay.
- The description lists workflow steps instead of trigger conditions.
- There is no `When NOT to use` guidance.
- The workflow contains vague instructions like "ensure quality" without concrete actions.
- Verification relies on "seems good" rather than evidence.
- Supporting files exist but are not referenced by the workflow.
- An update changes triggers, outputs, strictness, or required tools without calling it a behavior change.
- The agent adds folders or machinery not requested and not required.

## Verification

Before completing a create/update task, confirm:

- [ ] `SKILL.md` has valid frontmatter with `name` and `description`.
- [ ] The `name` matches the skill directory.
- [ ] The description includes what the skill does and when to use it, without becoming a workflow summary.
- [ ] The body is an actionable workflow, not reference prose.
- [ ] The skill includes use and non-use guidance.
- [ ] The skill includes anti-rationalizations for likely skipped steps.
- [ ] The skill includes evidence-based verification criteria.
- [ ] Supporting files are present only when justified and referenced.
- [ ] Existing skills preserve name, directory, and behavior unless changes were explicitly approved.
- [ ] The final response lists changed files and verification evidence.
