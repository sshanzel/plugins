---
description: Diagnose and fix CI failures for the current branch's PR by fetching failed GitHub Actions logs, applying fixes locally, and validating with repo scripts.
argument-hint: '[PR URL]'
---

# Fix CI

Use this when the user wants failing GitHub Actions checks diagnosed and repaired.

## Workflow

1. Identify the PR from the provided URL or current branch.
2. Fetch failed checks with `gh`.
3. Download failed logs.
4. Diagnose each failing check, not only the aggregate workflow result.
5. Apply fixes locally. Load and follow the `comment-discipline` skill first for how much to comment.
6. Validate using the same repo scripts CI relies on.
7. Commit the fixes.
8. Only push if the user explicitly asked for it.

## Discover the repo's checks — don't assume them

Don't hardcode the commands. Read the failing job's steps — from the workflow file under
`.github/workflows/`, or from the logs you downloaded — and run the **same** commands locally
(the test / typecheck / lint / format scripts the job invoked, e.g. from `package.json`,
`Makefile`, or the workflow itself). Validate against those exact scripts before committing, so
"green locally" means the same thing CI checks.
