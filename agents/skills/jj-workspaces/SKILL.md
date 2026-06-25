---
name: jj-workspaces
description: Manages ephemeral JJ workspaces for isolated streams of work. Use when the user asks to start, resume, inspect, clean up, or prune a separate workspace, parallel work stream, or isolated experiment in a Jujutsu repository.
---

# JJ Workspaces

## Overview

Use JJ workspaces as disposable filesystem sandboxes around history stored in one shared JJ repository. The JJ workspace name is the durable identity; the directory under `$TMPDIR` is ephemeral storage.

This skill has three modes:

1. Start or resume a workspace.
2. Inspect workspaces without changing them.
3. Clean up or prune workspaces when explicitly requested.

## When to Use

Use this skill when:

- The user asks to start or resume a separate JJ workspace for a task or experiment.
- Parallel agents, test suites, or dev servers need separate working directories.
- The user asks where a JJ workspace lives or what workspaces exist.
- The user explicitly asks to clean up, forget, or prune JJ workspaces.

Do not use this skill when:

- The repository is not using JJ.
- The user only wants a new commit in the current workspace.
- The task is read-only and does not need an isolated working directory.
- The user asks for Git worktrees or separate clones specifically.
- Cleanup was not requested; workspaces intentionally survive across agent sessions.

## Core Workflow

### Step 1: Determine the mode

Classify the request before running workspace commands:

- **Start or resume:** Follow Steps 2-5.
- **Inspect:** Follow Step 6.
- **Clean up or prune:** Follow Step 7.

If the request is ambiguous between inspecting and removing, inspect only and report what could be removed.

### Step 2: Establish repository context

Run:

```sh
jj workspace root
jj status
jj workspace list
```

Confirm that:

- The current directory belongs to the intended JJ repository.
- The current workspace and its changes are understood.
- Existing workspace names are known before choosing a new one.

Do not modify, commit, or reorganize current changes merely to make workspace creation convenient.

### Step 3: Choose the workspace identity

Derive:

- A short lowercase hyphenated task slug, such as `try-streaming-parser`.
- A one-line human-readable summary, such as `Try streaming parser`.
- The current repository folder name.
- A destination of `$TMPDIR/jj-workspaces/<repo-folder>/<task-slug>`, falling back to `/tmp` when `$TMPDIR` is unset.

Use the task slug as both the JJ workspace name and the destination basename. Quote paths and values in shell commands.

Check `jj workspace list` for the exact name:

- If it does not exist, continue to Step 4.
- If it exists, resolve it with `jj workspace root --name <task-slug>` and inspect its working-copy commit with `jj log -r '<task-slug>@'`.
- Resume it only when its path and commit description clearly identify the same stream of work.
- If the name belongs to different work, choose a more specific human-readable slug. Do not attach a random suffix unless meaningful names cannot disambiguate the streams.
- If two agents race to create the same name, relist workspaces after the failed creation. Resume the winner only if it is the same stream; otherwise choose a more specific slug.

### Step 4: Choose the base and create

For a fresh independent stream, use `jj workspace add` without `--revision`. JJ will create the new working-copy commit beside the current working-copy commit, on the same parent or parents:

```sh
tmp_root="${TMPDIR:-/tmp}"
destination="${tmp_root%/}/jj-workspaces/<repo-folder>/<task-slug>"
mkdir -p "$(dirname "$destination")"
jj workspace add --name '<task-slug>' --message '<summary>' "$destination"
```

The sibling default isolates the new experiment from changes currently in the original working-copy commit. If the new stream must include those changes, do not silently add `--revision @` or create a commit boundary. Explain that `--revision @` makes the new workspace descend from a mutable working-copy commit and may cause automatic rebases as that commit changes. Ask the user which base they want when the intended base cannot be inferred safely.

Use an explicit `--revision <revset>` only when the user chose a known base or the task unambiguously requires it.

### Step 5: Enter and verify

Change into the resolved or newly created directory. All subsequent file edits, builds, tests, and dev servers for this stream must run from that workspace.

Run:

```sh
jj workspace root
jj status
jj log -r @ -n 1
```

Verify that the root is the intended temporary path and that `@` is the intended workspace commit. Report the workspace name, absolute path, and chosen base to the user.

Remember that filesystem isolation does not isolate external resources. When parallel processes could collide, namespace ports, Docker Compose project names, databases, test accounts, or similar resources with the workspace name.

### Step 6: Inspect workspaces

Inspection is read-only. Start with:

```sh
jj workspace list
```

For each relevant workspace, resolve and inspect it from the current workspace:

```sh
jj workspace root --name '<workspace-name>'
jj log -r '<workspace-name>@' -n 1
```

Report:

- Workspace name.
- Registered path, or that the path is missing.
- Working-copy change and description.
- Whether it appears relevant to the user's requested stream.

Do not run `jj status` inside another existing workspace merely to inspect it. That command snapshots its working copy and may race with an active agent. Do not infer inactivity from timestamps or an old-looking description.

### Step 7: Clean up or prune

Run cleanup only when explicitly requested. First run `jj workspace list`, resolve each candidate path, and inspect its registered working-copy commit with `jj log -r '<workspace-name>@'`.

Classify every candidate:

- **Missing directory:** stale registry entry, but inspect the registered commit before forgetting it.
- **Existing and empty:** potentially removable after confirming no agent or process is using it.
- **Existing with meaningful changes:** retain unless the work is integrated, otherwise reachable, or the user explicitly authorizes abandoning it.
- **Possibly active:** retain it.

For an existing candidate that the user explicitly asked to remove, first confirm its agent, tests, and servers are stopped. Only then run `jj status` from that workspace to snapshot and inspect its final filesystem state.

Before forgetting a workspace with meaningful changes, show the user what would lose its workspace reference. A commit can disappear from the ordinary visible log after `jj workspace forget` if no bookmark, descendant, or other reference keeps it visible. Do not create a bookmark, rebase work, or commit changes as an unrequested cleanup side effect.

When removal is authorized and safe:

1. Run `jj workspace forget '<workspace-name>'` from another workspace.
2. Delete the temporary workspace directory only if the user requested filesystem cleanup and destructive-command approval requirements are satisfied.
3. Run `jj workspace list` again.
4. Verify that the removed name is absent and report separately which registry entries were forgotten and which directories were deleted.

For broad pruning, default to reporting candidates. Do not bulk-remove existing workspaces based only on age, naming, or location under `$TMPDIR`.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The matching name probably belongs to this task." | Human-readable names can collide. Resolve its path and inspect its workspace commit before resuming. |
| "Using `--revision @` includes everything I need." | It also makes the new stream descend from a mutable working-copy commit. Resolve the base deliberately. |
| "I can inspect another workspace with `jj status`." | `jj status` snapshots that working copy and may race with the agent editing it. Inspect its registered commit from the current workspace first. |
| "It is under `$TMPDIR`, so deleting it is harmless." | The directory can contain unsnapshotted files, and its workspace commit may be the only visible reference to useful work. |
| "This workspace looks old, so it must be abandoned." | Age and descriptions do not prove that an agent or process is inactive. |
| "I should clean up when I finish." | These workspaces intentionally survive across agent sessions. Clean up only when the user asks. |

## Red Flags

- Creating a workspace without checking `jj workspace list`.
- Resuming an existing name without resolving its path and inspecting its commit.
- Using `--revision @` by default.
- Continuing edits or commands from the original workspace after creating the new one.
- Running `jj status` in another possibly active workspace during read-only inspection.
- Treating `$TMPDIR` persistence as guaranteed.
- Forgetting or deleting a workspace because it merely appears old.
- Forgetting a meaningful working-copy commit without explaining its visibility risk.
- Automatically cleaning up a workspace at the end of an agent session.

## Verification

For start or resume, confirm:

- [ ] `jj workspace list` was checked before choosing the name.
- [ ] Any existing matching workspace was resolved and inspected before reuse.
- [ ] `jj workspace root` in the selected workspace returned the intended absolute path.
- [ ] `jj status` and `jj log -r @ -n 1` verified the selected working copy.
- [ ] The workspace name, path, and base were reported.
- [ ] Subsequent work runs from the selected workspace.

For inspection, confirm:

- [ ] Workspace names, registered paths, and working-copy commits were read without snapshotting another possibly active workspace.
- [ ] Missing paths and uncertain ownership were reported instead of silently repaired.

For cleanup or pruning, confirm:

- [ ] Cleanup was explicitly requested.
- [ ] Each candidate's path and registered commit were inspected.
- [ ] Meaningful changes or visibility risks were reported before forgetting.
- [ ] Existing workspaces were not classified as inactive from age alone.
- [ ] Deleted directories were explicitly authorized under applicable destructive-command rules.
- [ ] A final `jj workspace list` verified every forgotten name is absent.
- [ ] The final response distinguishes forgotten registry entries from deleted directories.
