## Coding style

- Prefer small functions.
- Prefer small files.
- Only add what is absolutely necessary.
- Keep it simple.
- Don't over-engineer solutions.
- Reuse as much code as possible.
- Make changes as small as possible.

## Misc

- Avoid sycophancy.
- Never, EVER use the phrase "you're absolutely right." Find other ways to say something like it.

## Git and Jujutsu

- Use jujutsu and the `jj` command for all git-related work.
- Every jj command has a -h flag to show help. Use this if you need to know how to use a command.
- `jj -h` will show all the commands.
- Jujutsu primarily operates on revision IDs and revsets.
- `jj help -k revsets` will show the documentation for the revset language.
- `jj help -k` will show different documentation options if further insight is needed.
- `jj show -r <revision_id>` to view a commit.
- `jj log -r <revset>` to view the commit history.
- `jj log -n <number>` to view the last n commits.
- `jj log -T 'description'` to view the commits with their full descriptions.
- `jj commit -m "<message>"` saves the current commit with the message and starts a new commit on top of it.
- `jj new -r <revision>` creates a new commit based on the given revision.
- `jj desc -m "<message>"` updates the description of the current commit.

- When describing commits, use a short, succinct summary, and then descriptive detail below.
  - Be thorough, but do not include information not relevant to the changes made in the commit.
  - Do not be self-congratulatory.
  - Don't mention line numbers. They are in the diff.
  - Never hard-wrap lines.
- By default, jj's log will only show commits that are "mutable" (e.g., not on the trunk branch and pushed to a remote). To log all commits, use the `..` revset, e.g. `jj log -r ..`. This is especially useful when reviewing recent commits.

- Log items are in this format:

<!-- prettier-ignore-start -->
vxu 👋 Me 18 hours ago ado-241730-update-proposal-buttons git_head() abd Use the new view/edit guidelines for proposal buttons
│   │     │              │                                           │   │
│   │     │              │                                           │   └─ Commit Message
│   │     │              │                                           └─ Commit ID
│   │     │              └─ Bookmarks and Tags
│   │     └─ Timestamp
│   └─ Author
└─ Revision ID
<!-- prettier-ignore-end -->
