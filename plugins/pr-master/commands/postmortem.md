---
description: Use after a PR merges (or against any finished PR) to pull every review comment, cluster the themes, and convert recurring patterns into durable AGENTS.md guardrails so the next PR avoids the same review tax. Complements pr-review-documenter (which judges one comment at a time during review); this skill judges the whole PR after the fact, where cluster patterns finally become visible.
---

# PR Post-Mortem Skill

Use this skill to extract durable engineering lessons from a finished PR's review history. Per-comment judgment in real time (`pr-review-documenter`) misses cluster patterns — "this primitive got six 4-pt-grid comments" only becomes a rule when you see them together.

## When To Use

- After a non-trivial PR merges (≥10 review comments, or ≥2 review rounds).
- When a teammate (or you) explicitly asks for a "retro" / "post-mortem" / "what did we learn from PR #N".
- When repeat review tax shows up across consecutive PRs — pull the most recent merged PR and look for the source of the noise.

Do **not** run this for:

- One-line typo / nit PRs.
- PRs that have not actually been reviewed yet — there's nothing to cluster.
- PRs whose review feedback was rejected. Only document accepted patterns.

## Inputs

- PR number (required). Repo is derived from `git remote get-url origin` unless the user gives it.
- Optional: a focus area ("auth", "host UI", "money math") to scope the analysis.

## Workflow

### 1. Pull the raw data

Run these in parallel via `gh`:

```bash
gh pr view <N> --repo <owner/repo> --json title,body,baseRefName,headRefName,mergedAt,additions,deletions,changedFiles,commits
gh api repos/<owner>/<repo>/pulls/<N>/comments --paginate | jq '[.[] | {user: .user.login, path, line: (.line // .original_line), body, in_reply_to_id, created_at}]'
gh api repos/<owner>/<repo>/pulls/<N>/reviews --paginate | jq '[.[] | select(.body != "" and .body != null) | {user: .user.login, state, body, submitted_at}]'
gh api repos/<owner>/<repo>/issues/<N>/comments --paginate | jq '[.[] | {user: .user.login, body, created_at}]'
```

What each gives you:

- `pulls/N/comments` — inline review threads (file + line). The primary source.
- `pulls/N/reviews` — top-level review submissions (Copilot summaries, "Approved" / "Changes requested" bodies). Useful for the bird's-eye reviewer take.
- `issues/N/comments` — PR-level conversational comments. Sometimes the actual fix discussion happens here.
- Author replies inside `pulls/N/comments` usually cite the fix commit ("Fixed in `abc1234`") — use that to trace the change.

### 2. Cluster by theme

Group every comment by the underlying concern, **not** by file. The same theme can hit multiple files (six 4-pt-grid violations across `Input`, `Select`, `Tabs` is one cluster, not three).

Common cluster axes:

- **Shared-helper duplication** — re-implementing what `@playright/shared` / `@playright/api-client` / `@playright/ui-tokens` already exposes.
- **Boundary normalization gaps** — `''`, whitespace-only, `Number('')`, `<input type="date">` clears, query-param `''`, env trailing slashes.
- **Authorization wiring** — guard stacking, guard ordering, guard-resolved state re-queried in handlers, role checks bypassed by transport-specific paths.
- **Schema / DTO consistency** — read-vs-write invariant drift, two write paths for the same field, related schemas with diverging constraints.
- **Lifecycle / state machine** — terminal-state downgrades, illegal transitions, idempotency gaps.
- **Atomic write races** — read-then-insert, pre-flight-without-mutation predicate, missing pessimistic locks.
- **UI primitive correctness** — half-step spacing, nested HTML elements, invalid attributes on `asChild` targets, ARIA derived from a different source than visual state.
- **React staleness** — imperative listeners that mutate DOM without updating state, missing cleanup, stale closure dependencies.
- **Doc / config drift** — `_headers` referencing missing files, runbook step paths that don't match the code, AGENTS.md self-contradiction.
- **Test naming / coverage** — tests whose name describes a different code path than the fixture exercises.
- **Migration safety** — destructive `up()` without paired `down()`, constraint relaxation without backfill.

If a comment doesn't fit a known cluster, name a new one. Don't force-fit.

### 3. Rank clusters by signal strength

Strong signal (write a guardrail):

- **≥3 comments in one cluster, same PR** — the rule is missing or not enforced.
- **Repeat from an earlier PR** — cross-reference the most recent root `AGENTS.md` to see if the rule already exists. If yes, the rule isn't *trigger-able* — add a grep-step / pre-commit check that would have caught it.
- **Cross-app pattern** — one root cause showed up in two or more apps (host + web both had the same listener-stale bug).
- **Security / money / lifecycle / auth** — even one comment is worth documenting; these are non-recoverable categories.

Weak signal (don't document):

- Single nit, one-off cleanup, typo, naming preference.
- Reviewer preference that wasn't accepted.
- Implementation detail that's clearly transient.

### 4. Decide placement (root vs module)

Use this decision tree:

```
Is the rule reach-multiple-apps-or-modules?
├── Yes → root AGENTS.md "Required Pre-Review Checks"
└── No  → one module owns it
         ├── Module has AGENTS.md → add to its "Things that are easy to get wrong"
         │                          or "Hard Rules" section
         └── Module has no AGENTS.md → create one (use the document-module skill
                                       if the module needs full coverage; otherwise
                                       stub the file with the new bullet)
```

Tactical guidance:

- A rule that applies to *every* React app (web + host + mobile) is cross-cutting → root.
- A rule that applies only to NestJS controllers (e.g., guard composition) → `apps/api/src/<module>/AGENTS.md`.
- A rule about shadcn primitives is host-specific today but will apply to `apps/web` and future `apps/console` → either duplicate to both files, or keep at root with a short pointer. Prefer per-app if the *implementation* differs (web uses Tailwind, mobile uses StyleSheet).
- A rule about shared contracts → `packages/shared/AGENTS.md`. A rule about the HTTP client → `packages/api-client/AGENTS.md`. A rule about design tokens → `packages/ui-tokens/AGENTS.md`.
- Avoid putting one-app rules at root — the root section bloats and the per-app context (Tailwind utility names, Radix component, etc.) goes stale faster.

### 5. Check for duplicates before writing

For every proposed bullet, grep the candidate target file AND the root for the rule already existing in some form:

```bash
rg -i "<key term 1>|<key term 2>" AGENTS.md apps/*/AGENTS.md apps/api/src/*/AGENTS.md packages/*/AGENTS.md
```

If the rule already exists and was still missed, the right action is usually one of:

- **Strengthen** the existing bullet with the new example (one PR # reference is enough; don't list every offender).
- **Add a grep / pre-commit step** that would have caught it. The rule existed; the trigger didn't.
- **Skip** if the existing rule is fine and the reason for the miss was inattention, not docs.

Do not add a near-duplicate. Two rules saying the same thing in different words is worse than one.

### 6. Write the bullet

Format every new rule as:

```markdown
- **<imperative rule>** — <concrete failure mode>. <how to detect / what helper to use>. PR #<N>: <one-line example>.
```

Rules:

- **Imperative, forward-looking.** "Boundary preprocessors collapse undefined / '' / whitespace via one helper." Not "PR #15 had a preprocessor bug."
- **Concrete failure mode.** "`Number('')` returns `0`, not `NaN`, so blank price input silently creates a free unit." Not "validate numeric inputs."
- **Show the trigger.** Either the shared helper name (`nullableTrimmed`, `preserveDateInputValue`), the grep command (`rg '\-[0-9]+\.5' src/components/ui`), or the framework API (`getFieldState(name, formState)`).
- **One PR reference.** Cite the source PR for traceability; don't enumerate every fix commit. Future readers want to know "this rule has history", not the full audit trail.
- **No emoji.** No "TODO" / "FIXME" markers. Forward-looking instructions only.

### 7. Update the pointer block (root only)

If you added rules to a module file that didn't previously appear in the root's pointer block at the top of "Required Pre-Review Checks", add a short subject line so agents reading the root know where module rules live:

```markdown
- <Module short name> (<key subjects, comma-separated>): `<path/to/AGENTS.md>`
```

Keep the subjects to the new themes only — the pointer is a TOC, not a recap.

### 8. Commit

One commit per post-mortem, scope `docs(agents)`. Title format:

```
docs(agents): PR #<N> retrospective — <one-line theme summary>
```

Body lists each rule added, grouped by destination file. Example:

```
Root:
- <bullet 1 short summary>
- <bullet 2 short summary>

Modules:
- auth: <bullet>
- host: <bullets>
- shared: <bullet>
```

Include the PR # and bug commit refs where the trigger lives, but keep the message under ~25 lines.

## What To Skip

- **Don't restate the PR description.** The PR body lives in GitHub; the retro lives in AGENTS.md. The two are different artifacts.
- **Don't write a per-PR retro file** (`docs/retro/pr-15.md`). The output is updates to AGENTS.md files, not a new doc.
- **Don't document rejected feedback.** A reviewer suggestion that the author declined is not a guardrail.
- **Don't bloat the root.** If you're adding more than 2 bullets to root from one PR, audit — most of them probably belong in module files.
- **Don't delete prior bullets while you're there.** Trim work is a separate task; mixing it with a retro makes the commit hard to review.

## Quality Bar

A finished post-mortem should:

1. Reduce the next similar PR's review-comment count for the same patterns. If you can't articulate which review comment a new rule would have prevented, the rule is too abstract.
2. Land rules where the engineer will *see* them — module file for module-specific work; root for cross-cutting.
3. Include the grep / helper / framework API that makes the rule actionable.
4. Leave the docs system more discoverable than it was — root pointer updated, module headings consistent.

## Related Skills

- `pr-review-documenter` — same goal but during the review cycle, one comment at a time. Use both. The post-mortem catches what per-comment review missed.
- `document-module` — when a module needs a fuller AGENTS.md before module-specific rules can land.
- `pr-review-responder` — fix-and-reply during review. Post-mortem runs after that finishes.
