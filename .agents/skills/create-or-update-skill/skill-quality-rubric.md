# Skill Quality Rubric

Use this rubric before drafting and during final review of any created or updated skill.

## 1. Required Format

- `SKILL.md` exists in its own skill directory.
- YAML frontmatter is the first content in the file.
- Frontmatter includes `name` and `description`.
- `name` is lowercase, hyphen-separated, and matches the directory name.
- `description` includes both:
  - what the skill does
  - when the agent should use it
- `description` is 1024 characters or fewer.
- The description routes the agent to the skill; it does not replace the workflow.

## 2. Process Over Prose

A strong skill is a runbook, not a reference article.

Check that the skill contains:

- A sequence of actions the agent can follow.
- Decision points where different contexts require different behavior.
- Specific commands, file paths, templates, or examples where they change execution.
- Checkpoints that prevent the agent from skipping invisible work.
- Defined exit criteria.

Weak signs:

- Mostly principles, background, or philosophy.
- Long explanations with no required actions.
- Advice like "be careful," "ensure quality," or "think deeply" without evidence-producing steps.
- A list of facts the model might already know.

## 3. Trigger Quality

The description is the primary discovery mechanism.

Good trigger descriptions:

- Start with what the skill does in third person.
- Include clear "Use when" conditions.
- Mention realistic user intents and contexts.
- Include important near-synonyms when they affect triggering.
- Avoid process details better kept in the body.

Audit questions:

- Would an agent know when to use this from the description alone?
- Are there obvious false positives that need exclusion in the body?
- Are there common user phrasings missing from the trigger conditions?
- Is the description concise enough to fit in the system skill list without becoming noise?

## 4. Scope Discipline

The skill should do one job clearly.

Check:

- The workflow stays within the stated purpose.
- The skill references other skills instead of duplicating their workflows.
- Supporting files are only added when they reduce context or enable execution.
- Scripts are only added when runnable helpers are actually part of the workflow.
- The skill does not introduce repo conventions beyond the documented format unless the user requested them.

Redundant material should be removed or moved to supporting files only if still needed.

## 5. Progressive Disclosure

`SKILL.md` should be the entry point. Supporting files are for material that is useful only sometimes.

Use supporting files when:

- Reference material would make `SKILL.md` hard to scan.
- A long checklist is only needed during final review.
- Domain-specific variants would otherwise crowd the main workflow.
- A template is large enough to distract from the steps.

Do not use supporting files when:

- The material is under roughly 50 lines and directly needed every time.
- The file would be an empty placeholder.
- The file exists only because another skill had a similar folder.

## 6. Anti-Rationalization

Every skill should anticipate the excuses an agent will use to skip the senior-engineering work.

Good rationalizations are:

- Specific to the workflow.
- Written as plausible agent excuses.
- Paired with factual rebuttals.
- Focused on steps that are tempting to skip.

Examples of useful targets:

- Skipping a spec because a task seems small.
- Writing tests after implementation.
- Treating passing tests as the only evidence.
- Refactoring adjacent code while touching a file.
- Adding abstractions before there are multiple real uses.
- Shipping without a human-reviewable summary.

## 7. Evidence-Based Verification

Verification is the exit gate. It should require proof, not confidence.

Good verification items produce evidence such as:

- Command output.
- File existence at a path.
- Valid frontmatter.
- A completed checklist.
- A screenshot or runtime trace.
- User confirmation for a behavior-changing decision.
- A summary of changed files and why they were touched.

Weak verification items:

- "The result is good."
- "The agent considered edge cases."
- "The implementation seems correct."
- "The user should be satisfied."

Rewrite weak items into observable checks.

## 8. Update Safety

When changing an existing skill, protect existing users.

Check:

- Name and directory are preserved unless the user explicitly asked for a rename.
- Existing triggers are not narrowed or broadened silently.
- Output formats are not changed silently.
- Required tools or commands are not added silently.
- Strictness is not increased silently.
- Behavior changes are called out separately from preserving improvements.

If an edit changes what future agents will do, it is a behavior change.

## 9. Final Review Questions

Before calling a skill done, answer:

1. Is this a workflow the agent can execute, or just advice?
2. Does the frontmatter correctly route the agent to the workflow?
3. Does the skill say when not to use it?
4. Does every important step have an evidence-producing checkpoint?
5. Are the anti-rationalizations specific enough to stop likely shortcuts?
6. Did we avoid adding files, scripts, or conventions not required by the task?
7. For updates, did we preserve the existing contract unless authorized to change it?
