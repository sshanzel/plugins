---
description: Draft, prepare, create, or update a PR description in a clear, consistent structure.
argument-hint: "[pr-number-or-url]"
---

# Create / update a PR description

Use this when the user wants to open a PR, draft a description, or clean up PR presentation.

## Default behavior

- If `gh` is available and authenticated, create or update the PR directly.
- Default to ready-for-review unless the user explicitly asks for draft/WIP.
- If the current branch already has a PR, update it rather than creating a duplicate.

## PR template

Start from this structure and **drop any section that doesn't apply** to the change:

```markdown
## What changed

## Why

## API / schema changes
<!-- routes, request/response shapes, DB or model changes — only if the PR touches them -->

## Breaking changes

## How to test

## Linked issues

## Checklist

- [ ] Lint / format passes locally
- [ ] Tests added / updated
- [ ] Docs updated (if needed)
```

## Self-review before requesting review

Before opening (or re-requesting review on) a non-trivial PR, scan the diff for the kinds of issues
that cause repeated review back-and-forth. These are prompts to check, not a section to paste into
the PR body:

- **Contracts stay in sync** — when a shape changes in one place (shared types, the API response, a
  client consumer, mocks/seeds, docs), it changes everywhere it's mirrored.
- **State machines** — lifecycle states are named, transitions are validated, and a late or duplicate
  action can't downgrade a terminal state.
- **Retried / concurrent writes** are idempotent and safe under read-then-write or unique-constraint
  races (transactional where it matters).
- **Security defaults** — auth, visibility, CORS/origin, webhooks, uploads, and production toggles
  inherit the existing policy unless the PR documents a narrower exception.
- **Read efficiency** — list/table/notification paths batch related reads instead of per-row lookups
  or unbounded `IN` lists.
- **Client flows** — pending submissions lock, drafts/selections survive until success, errors are
  accurate, and timers/listeners/object URLs/sockets/async callbacks are cleaned up.
- **Schema / migration safety** — migrations are checked against both a fresh and an existing
  database when constraints or renames are involved, and destructive steps are reversible.
- **Capture the lesson** — a recurring review point is written into the relevant `AGENTS.md` before
  asking for another pass (see `/pr-master:postmortem`).

## Notes

- Organize the description by concern, not by file list.
- Keep "What changed" short and readable.
- The self-review list is a preparation step, not something pasted into every small PR.
