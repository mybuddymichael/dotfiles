---
name: jujutsu
description: Use Jujutsu (jj) for version control operations. Provides guidance on jj commands, revsets, commit messages, and workflow. Use when working with version control, making commits, or when git/jj/Jujutsu is mentioned.
---

# Jujutsu Version Control

## Core Principles

- Use `jj` command for all git work.
- jj primarily operates on revision IDs and revsets.

## Help

- `jj -h` shows all commands
- Every jj command has a `-h` flag
- `jj help -k revsets` shows revset language documentation
- `jj help -k` shows all documentation options

## Commands

### Viewing History

```bash
jj show -r <revision_id> # View a commit
jj log -r <revset>       # Commit history matching revset
jj log -n <number>       # Last n commits
jj log -T 'description'  # Commits + full descriptions
jj log -r ..             # All commits (not just mutable ones)
```

**Note**: By default, `jj log` only shows "mutable" commits (not on trunk branch and pushed). Use `jj log -r ..` to see all commits.

### Creating and Updating Commits

```bash
jj commit -m "<message>" # Save current commit and start new one on top
jj new -r <revision>     # Create new commit based on a revision
jj desc -m "<message>"   # Update description of current commit
```

## Commit messages

- Use short, succinct summary line, then descriptive detail below
- Be thorough, but only include information relevant to the changes
- Do not be self-congratulatory
- Don't mention line numbers (they're in the diff)
- Never hard-wrap lines

## Log Format

Log items appear in this format:

```
vxu 👋 Me 18 hours ago ado-241730-update-proposal-buttons git_head() abd Use the new view/edit guidelines for proposal buttons
│   │     │              │                                           │   │
│   │     │              │                                           │   └─ Commit Message
│   │     │              │                                           └─ Commit ID
│   │     │              └─ Bookmarks and Tags
│   │     └─ Timestamp
│   └─ Author
└─ Revision ID
```

## Revsets

Revsets are expressions that select sets of revisions. Use `jj help -k revsets` for full documentation.

Common patterns:
- `@` - current revision
- `..` - all revisions
- `<revision>..` - revision and all ancestors
- `@..` - current revision and ancestors
