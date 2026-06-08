---
description: Resolve the current branch's merge conflicts against its base — understand both sides, resolve correctly, validate, then report.
argument-hint: "[base-branch]"
---

# Fix merge conflicts

Resolve the conflicts blocking the current branch from merging. Base = `$ARGUMENTS` if given, else the PR's base branch (`gh pr view --json baseRefName`), else `origin/main`/`origin/master`. Resolve by **understanding both sides** — never blindly pick one to make it compile.

## Procedure

1. **Sync + identify the base.** `git fetch origin`. Confirm the base branch and whether this branch is normally **rebased** or **merged** (check the repo's convention / PR history).
2. **Reproduce the conflict.** `git rebase origin/<base>` (rebase-style) or `git merge origin/<base>` (merge-style). Let it stop at the conflicts.
3. **For each conflicted file:** read the **whole** file plus both sides of every `<<<<<<<` / `=======` / `>>>>>>>` hunk. Work out what each side changed and *why* (inspect the commits/diff behind each side if it isn't obvious). Resolve so **both intents survive** — don't drop one side's change to make it build, and don't keep both literally when they're alternatives. Remove every conflict marker.
4. **Continue.** `git add` the resolved files → `git rebase --continue` (or commit the merge). Repeat for each subsequent conflicted commit in a rebase.
5. **Validate.** Run the repo's gates (build + tests + lint/format — discover them from `package.json` / `Makefile` / CI config). A clean resolution still passes; a green build with a silently-dropped change is a **failed** resolution.
6. **Report — don't auto-push.** Summarize what conflicted and how each was resolved (call out any semantic judgment). Push only when asked, and use `git push --force-with-lease` for a rebased branch — **never** plain `--force`.

## Rules

- Conflicts usually mean both sides changed the same area *on purpose* — never resolve by taking one side wholesale without reading both.
- If resolving requires a real judgment call (two incompatible behaviors), **stop and ask** — don't guess.
- If tests fail after resolving, the resolution is wrong — fix it, don't push.
- `--force-with-lease`, never `--force`.
