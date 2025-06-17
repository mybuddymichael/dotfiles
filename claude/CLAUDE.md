## Git and Jujutsu

- Use jujutsu and the `jj` command for all git-related work.
- Every jj command has a -h flag to show help. Use this if you need to know how to use a command.
- `jj -h` will show all the commands.
- Jujutsu primarily operates on revision IDs and revsets.
- The revset language is documented at https://jj-vcs.github.io/jj/latest/revsets/
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
│   │     │              │                                           │      "Use the new view/edit guidelines for proposal buttons"
│   │     │              │                                           └─ Commit ID
│   │     │              │                                              "abd"
│   │     │              └─ Bookmarks and Tags
│   │     │                 "ado-241730-update-proposal-buttons git_head()"
│   │     └─ Timestamp
│   │        "18 hours ago"
│   └─ Author
│      "👋 Me"
└─ Revision ID
   "vxu"
<!-- prettier-ignore-end -->
