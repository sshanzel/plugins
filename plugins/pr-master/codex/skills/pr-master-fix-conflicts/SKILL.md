---
name: pr-master-fix-conflicts
description: >-
  Resolve the branch's merge conflicts against its base WITHOUT losing either side's work, asking before resolving any genuinely incompatible hunk. Use when the user asks to fix/resolve merge conflicts or an interrupted rebase/merge.
---

<!-- GENERATED from commands/fix-conflicts.md by scripts/gen-codex-skills.mjs — do not edit here; edit the source and re-run. -->

# Fix merge conflicts

Resolve the conflicts blocking the current branch from merging. Base = the PR/branch from your request (else inferred from the current branch) if given, else the PR's base (`gh pr view --json baseRefName`), else `origin/main` / `origin/master`.

## Cardinal rule: lose no work

Every change on **both** sides of every conflict must survive the resolution. A conflict almost always means both sides edited the same area **on purpose** — your job is to **combine both intents**, not to pick a winner. Dropping one side's change to make the file build is a **failed** resolution *even if the tests pass*.

The ONLY exception is a **genuinely incompatible** hunk — where the two sides cannot both be true (e.g. the same constant set to two different values, two mutually-exclusive implementations of one function, a line one side deleted that the other rewrote). **Do not guess these.** Stop, show the user **both sides** (what each does + why), and ask how they want it resolved. Guessing is exactly how work silently disappears — so when in doubt, ask.

## Procedure

1. **Sync + identify the base.** `git fetch origin`. Confirm the base branch and whether this branch is normally **rebased** or **merged** (repo convention / PR history).
2. **Reproduce the conflict.** `git rebase origin/<base>` (rebase-style) or `git merge origin/<base>` (merge-style); let it stop at the conflicts.
3. **For each conflicted file:** read the **whole** file plus both sides of every `<<<<<<<` / `=======` / `>>>>>>>` hunk. Work out what each side changed and *why* (inspect the commits/diff behind each side if it isn't obvious).
   - If both changes **can coexist** → merge them so both survive, and remove the markers.
   - If they're **truly incompatible** → leave the markers, finish reading the rest, then **ask the user** (per the cardinal rule): present each unresolved hunk with both sides and a one-line summary of the trade-off, and resolve only what they decide.
4. **Continue.** `git add` the resolved files → `git rebase --continue` (or commit the merge). Repeat for each subsequent conflicted commit in a rebase.
5. **Validate.** Run the repo's gates (build + tests + lint/format — discover them from `package.json` / `Makefile` / CI). A green build with a silently-dropped change is still a **failed** resolution — re-check that both sides' behavior is actually present.
6. **Report — don't auto-push.** Summarize what conflicted, what you combined, and anything the user decided. Push only when asked, with `git push --force-with-lease` for a rebased branch — **never** plain `--force`.

## Rules

- **No work lost** — preserve both sides; combine, don't pick (the cardinal rule above).
- **Ask, don't guess** on any genuinely incompatible hunk — surface both sides and let the user decide.
- If tests fail after resolving, the resolution is wrong — fix it, don't push.
- `--force-with-lease`, never `--force`.
