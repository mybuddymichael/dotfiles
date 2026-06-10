---
name: jj-commit
description: Guides agents through safe targeted JJ commit preparation, execution, and verification. Use when preparing, reviewing, or making a Jujutsu commit with jj.
---

# JJ Commit

## Overview

This skill is the JJ commit mechanics workflow for any project. It keeps commits intentional when the working copy may contain unrelated changes, when paths contain spaces or punctuation, and when the current directory is not the workspace root.

JJ path arguments for `diff` and `commit` are filesets. For exact file paths, use workspace-root-relative exact filesets with `root-file:"..."`.

## When to Use

Use this skill when:

- Preparing a JJ commit.
- Reviewing which files should be included in a JJ commit.
- Running `jj diff` as part of commit preparation.
- Running `jj commit` for a known set of intended files.
- Verifying that a targeted JJ commit contains what it should.

Do not use this skill when:

- Deciding how to edit files or what changes should be made; finish the editing task first.
- The repository is not using JJ.
- The user only wants a summary of current changes and did not ask to prepare or make a commit.
- You cannot identify the intended file list; stop and clarify rather than guessing.

## Core Workflow

### Step 1: Check the working copy

Run:

```sh
jj status
```

Use this to identify all current changes. Unrelated changes are allowed; leave them untouched.

### Step 2: Build the explicit intended file list

Create a concrete list of every file that should be included in this commit.

Rules:

- Include only files intentionally changed for this task.
- Use the paths shown by JJ, normalized to workspace-root-relative paths.
- Handle added, modified, deleted, and renamed files through the same explicit file-list process.
- For renames, include the exact path or paths needed for JJ to capture the intended rename, then verify with targeted diff before committing.
- Never rely on a bare commit, even if `jj status` appears to show only intended changes.
- If the intended file list is ambiguous, stop and ask before committing.

### Step 3: Convert each exact path to a JJ fileset

For every intended exact path, use this form:

```sh
'root-file:"path/from/workspace/root.ext"'
```

Use `root-file:"..."` for every exact path, including simple paths like `README.md`.

Syntax notes:

- `root-file:"..."` is a workspace-root-relative exact file pattern.
- `file:"..."` is cwd-relative; avoid it for this workflow.
- `file("path")` is invalid because `file` is not a JJ fileset function.
- Shell quoting alone is not enough; wrap exact paths in `root-file:"..."`.

### Step 4: Review the targeted diff

Run a targeted stat diff for the intended files:

```sh
jj diff --stat \
  'root-file:"path/one.ext"' \
  'root-file:"path/two.ext"'
```

When useful, inspect the targeted full diff:

```sh
jj diff \
  'root-file:"path/one.ext"' \
  'root-file:"path/two.ext"'
```

If a fileset or path fails to parse, or does not match the intended file, stop and fix the exact workspace-relative path. Rerun the targeted diff. Do not broaden the command as a workaround.

### Step 5: Match local commit message style

Inspect recent commits before choosing the message:

```sh
jj log -n 8
```

Use the same style as recent commits in that repository. Keep the message concise and specific to the intended change.

### Step 6: Commit when requested

If the user asked you to commit, run a targeted commit with every intended file listed as `root-file:"..."`:

```sh
jj commit -m 'Commit message' \
  'root-file:"path/one.ext"' \
  'root-file:"path/two.ext"'
```

If commit was not requested or authorized, stop after the review and ask for confirmation. Show the intended command when asking.

Never run a bare `jj commit -m ...` in this workflow.

### Step 7: Verify the commit

After committing, run:

```sh
jj status
```

Confirm the intended files are no longer listed as working-copy changes.

Then inspect the new commit:

```sh
jj show @-
```

Verify the new commit contains exactly the intended change. If the intended files remain uncommitted or the new commit does not match the intended change, stop and report the problem. Do not make follow-up commits or broad corrective commands without understanding what happened.

### Step 8: Report briefly

Final response should include:

- The commit summary or change/commit identifier.
- The verification performed, including `jj status` and inspection of `jj show @-`.

Do not enumerate unrelated remaining changes unless the user asks or they block the workflow.

## Command Templates

Targeted diff:

```sh
jj diff --stat \
  'root-file:"path/one.ext"' \
  'root-file:"path/two.ext"'
```

Targeted commit:

```sh
jj commit -m 'Commit message' \
  'root-file:"path/one.ext"' \
  'root-file:"path/two.ext"'
```

Post-commit verification:

```sh
jj status
jj show @-
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I can use a bare commit because `jj status` only shows my files." | This workflow always uses explicit targeted commits. Working-copy state can change or be misread. |
| "Shell quotes should be enough for paths with spaces." | JJ positional path arguments are filesets. Use `root-file:"..."` for every exact path. |
| "The path syntax failed, so I’ll just commit the whole working copy." | A fileset problem is a reason to fix the targeted fileset, not to broaden the commit. |
| "I already edited these files, so I know what will be committed." | Run the targeted diff. Verification must inspect what JJ will commit, not what you remember editing. |
| "Renames/deletions are special, so targeted commits are risky." | They still need an explicit intended file list and targeted diff verification. |
| "The message style is obvious." | Check `jj log -n 8`; local convention beats memory. |
| "Tests did not run, so I cannot use this skill." | Testing belongs to the task workflow. This skill only controls commit mechanics; mention relevant checks if already performed. |

## Red Flags

- Running `jj commit -m ...` with no filesets.
- Using `file("path")` function syntax.
- Using `file:"..."` instead of `root-file:"..."` for exact paths.
- Relying on plain path arguments or shell quoting instead of `root-file:"..."`.
- Skipping targeted diff review before committing.
- Committing files not on the intended file list.
- Omitting an intended file from the targeted commit.
- Failing to inspect the new commit after committing.

## Verification

Before considering the commit complete, confirm:

- [ ] `jj status` was run before committing.
- [ ] An explicit intended file list was built.
- [ ] Every intended exact path was passed as `root-file:"..."`.
- [ ] Targeted `jj diff --stat` was run for the intended files.
- [ ] Targeted full `jj diff` was run when needed to understand the change.
- [ ] `jj log -n 8` was used to match recent commit message style.
- [ ] Commit was requested/authorized, or the agent stopped to ask.
- [ ] `jj commit` included only the intended files.
- [ ] Fileset/path failures were fixed with targeted paths, not broad fallback commands.
- [ ] Post-commit `jj status` showed the intended files were no longer listed.
- [ ] `jj show @-` was inspected to verify the new commit contains what was intended.
- [ ] The final response briefly reports the commit summary/identifier and verification performed.
