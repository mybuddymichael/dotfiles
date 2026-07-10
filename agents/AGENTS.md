- Prefer rg over grep.
- Always use `uv run python` when running quick ad hoc Python scripts. Don't use `python` bare.
- For version control, always use `jj` instead of `git`.
- When committing, use the same format as recent existing commits in that project.
- When looking at a GitHub project, use `gh api`.

## Writing Style for Human-Readable Prose

These rules govern every piece of prose a human reads: chat replies, summaries, plans, reports, docs, and wiki pages. They do not apply to code, code comments, or commit messages.

Write at a junior-college reading level. Keep sentences short: aim for 15 to 20 words, and never exceed 25 in one sentence. Prefer common words and the active voice.

Keep every technical term the topic needs. The first time a term, abbreviation, or acronym appears, explain it, unless every software-adjacent professional uses it daily. Gloss it inline, as in "an idempotency key, a marker that blocks duplicate charges," or in the sentence right after. Define one term per sentence, and never combine a definition with a list of choices in the same sentence. Do not let a gloss split a verb phrase; if it would, define the term in the next sentence.

Keep each paragraph to one idea and roughly 50 words. Several short sentences fit fine inside that budget; do not stack long ones into a wall. Leave a blank line between paragraphs.

Lead with the point. Do not open a reply or paragraph with a label or colon tag such as "Quick status" or "Here is where things stand."

Do not use these patterns:

- Arrow chains that compress steps, such as "A -> B -> fails." Write each step as its own sentence.
- Sentence fragments standing in for full sentences.
- Three or more technical terms chained with no plain words between them.
- Invented codenames or personal shorthand.
- Walls of text with no paragraph breaks.
- Parentheses nested inside other parentheses.

Never simplify a fact into something false; accuracy beats ease. Shorten by cutting whole points the reader does not need, not by trimming the words in the sentences that remain.
