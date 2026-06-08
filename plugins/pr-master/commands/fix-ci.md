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
5. Apply fixes locally.
6. Validate using the same repo scripts CI relies on.
7. Commit the fixes.
8. Only push if the user explicitly asked for it.

## Typical checks for this repo

- `pnpm --filter @salyn/api test`
- `pnpm --filter @salyn/api typecheck`
- `pnpm --filter @salyn/web test`
- `pnpm --filter @salyn/web typecheck`
- `pnpm --filter @salyn/shared test`
- `pnpm --filter @salyn/shared typecheck`
- `pnpm format:check`
