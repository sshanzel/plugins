---
description: Draft, prepare, create, or update PR descriptions using the team's standard structure.
---

# PR Skill

Use this when the user wants to open a PR, draft a description, or clean up PR presentation.

## Default behavior

- If `gh` is available and authenticated, create or update the PR directly.
- Default to ready-for-review unless the user explicitly asks for draft/WIP.
- If the current branch already has a PR, update it rather than creating a duplicate.

## PR template

```markdown
## What changed

## Entity changes

| Entity | Field | Change | Before | After |
| ------ | ----- | ------ | ------ | ----- |

## Schema changes

| Schema | Field | Change | Before | After |
| ------ | ----- | ------ | ------ | ----- |

## Endpoints

| Method | Path | Status | Description |
| ------ | ---- | ------ | ----------- |

## Breaking changes

## Linked issues

## Checklist

- [ ] Lint passes locally
- [ ] Tests added / updated
- [ ] Docs updated (if needed)
- [ ] Pre-review checklist considered
```

## Pre-review checklist

Before creating or re-requesting review on a non-trivial PR, scan the change for
the review patterns that have caused repeated back-and-forth:

- Shared contracts stay synchronized across `packages/shared`, API presenters,
  frontend consumers, mocks/seeds, and docs.
- Durable workflows name their lifecycle states and prevent stale or duplicate
  actions from downgrading terminal state.
- Retryable writes are idempotent, transactional where needed, and safe under
  concurrent requests or unique-constraint races.
- Auth, visibility, CORS/origin, webhook, media, and production-default
  boundaries inherit the existing security policy unless the PR documents a
  narrower exception.
- List, table, notification, and media presenters batch related reads instead
  of doing per-row lookups or unbounded parameter lists.
- Frontend flows lock pending submissions, preserve drafts/selections until
  success, show accurate errors, and clean up timers, listeners, object URLs,
  sockets, and async callbacks.
- Entity-driven schema changes use generated TypeORM migrations and are checked
  against both fresh and existing database shapes when constraints or renames
  are involved.
- Reusable review lessons are captured in the root or module `AGENTS.md` before
  the PR asks for another review pass.

## Notes

- Organize changes by concern, not by file list.
- Keep "What changed" short and readable.
- Drop template sections that are irrelevant to the PR.
- Keep the PR body focused; the pre-review checklist is usually a preparation
  step, not a section that must be pasted into every small PR.
