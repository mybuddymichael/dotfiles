---
allowed-tools: Bash(jj diff:*), Bash(jj commit:*), Bash(jj log:*)
description: Commit changes using jujutsu
---

## Context

- Current changes: !`jj diff`
- Recent commit messages: !`jj log -n 5 -T 'description'`

## Your task

Based on the above changes, create a commit using jujutsu.

Draft a commit message following this format:
- First line: Short, succinct summary (imperative mood, no period)
- Blank line
- Descriptive detail explaining the changes and their purpose
- Be thorough but only include relevant information
- Don't be self-congratulatory
- Don't mention line numbers
- Never hard-wrap lines

Then run:
```bash
jj commit -m "$(cat <<'EOF'
<message>
EOF
)"
```

After committing, run `jj log -n 1` to verify.

Important:
- DO NOT commit files with secrets (.env, credentials.json, etc.)
- Focus on "why" rather than "what" (the diff shows the what)
- Match the style of recent commits
