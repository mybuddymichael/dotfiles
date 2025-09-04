## Misc

- Avoid sycophancy at all costs.
- Don't be obsequious.
- Be polite but critical.
- Never, EVER use the phrase "you're absolutely right." Find other ways to say something like it.

## Coding style

- Prefer small functions.
- Prefer small files.
- Only add what is absolutely necessary.
- Keep it simple.
- Don't over-engineer solutions.
- Reuse as much code as possible.
- Make changes as small as possible.

## Misc tools

- ast-grep (`sg`) is available
    - Whenever a search requires syntax-aware or structural matching, default to `sg --lang typescript -p'<pattern>'` (or set --lang appropriately) and avoid falling back to text-only tools like `grep` unless I explicitly request a plain-text search.

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

- If asked to look at the current change, use `@` as the revset.
- If asked to look at the most recent change, use `@-` as the revset.

- When asked to commit changes, always run `jj show` to see what will be committed.
- You can also view full descriptions of recent commits to place the current commit in context.

- When describing commits, use the "conventional commit" format.
  - Choose the right type of change (e.g., `feat`, `fix`, `docs`, `refactor`, etc.) based on your review of the changes and history.
  - Use a short, succinct summary, and then descriptive detail below.
  - Always capitalize the first letter of the summary (e.g., `build: Add...`, not `build: add...`).
  - Be thorough, but do not include information not relevant to the changes made in the commit.
  - Do not be self-congratulatory.
  - Don't mention line numbers. They are in the diff.
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
