## Coding style

- Prefer small functions.
- Prefer small files.
- Only add what is absolutely necessary.
- Keep it simple.
- Don't over-engineer solutions.
- In Typescript, use functions instead of classes.

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
- `jj show -r <revision>` to view a commit.
- `jj log -r <revset>` to view the commit history.
- `jj commit -m "<message>"` saves the current commit with the message and starts a new commit on top of it.
- `jj new -r <revision>` creates a new commit based on the given revision.
- `jj desc -m "<message>"` describes the current commit.

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
