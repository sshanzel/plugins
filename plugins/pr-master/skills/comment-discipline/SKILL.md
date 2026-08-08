---
name: comment-discipline
description: How much to comment when writing or editing code. Use whenever a fix, review response, or conflict resolution adds or changes code.
user-invocable: false
---

# Comment Discipline

## Match the repo, not a habit

Check the target repo's own documented convention first — its root or module
`AGENTS.md` / `CONTRIBUTING.md` often states one explicitly (e.g. "no
comments unless truly necessary," "comment only the why"). Follow that over
the default below. Only fall back to the default when the repo is silent.

## Default (when the repo has no stated convention)

Write no comment by default. Add one only when it captures something the
code itself cannot express:

- a hidden constraint or invariant
- a workaround for a specific bug or platform quirk
- the *why* behind a non-obvious choice
- behavior that would surprise a reader

## Don't

- Restate what the code already says through clear names — `// increment
  counter` above `counter++` is noise, not documentation.
- Narrate the current task, fix, or PR — `// fixed per review comment`,
  `// handles the case from issue #123`, `// added for the X flow`. That
  context belongs in the commit message and PR description; it rots as the
  code moves on and the comment doesn't.
- Comment every function or block reflexively. A comment on every line
  signals fear of the code, not clarity.
- Leave a comment where a rename or a small extraction would make it
  redundant — prefer the rename.

## Applies everywhere code changes

Not test-only or fix-only — it covers new code, edited code, and code moved
during a merge-conflict resolution. A resolved conflict is not license to
sprinkle explanatory comments across the merged result; keep the same
discipline as if writing it fresh.
