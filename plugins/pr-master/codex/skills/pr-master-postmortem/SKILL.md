---
name: pr-master-postmortem
description: >-
  After a PR merges, cluster its review comments into recurring themes and turn them into durable AGENTS.md guardrails. Use when the user asks for a PR retro / post-mortem / 'what did we learn from PR #N'. Not for unreviewed or trivial PRs.
---

<!-- GENERATED from commands/postmortem.md by scripts/gen-codex-skills.mjs — do not edit here; edit the source and re-run. -->

# PR Post-Mortem Skill

Use this skill to extract durable engineering lessons from a finished PR's review history. Judging comments one at a time, as they land, misses cluster patterns — "the same low-level nit got flagged on six different files" only becomes a rule when you see them together.

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
- Optional: a focus area ("auth", "billing", "a specific module") to scope the analysis.

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

Group every comment by the underlying concern, **not** by file. The same theme can hit multiple files (the same rule violated across several components is one cluster, not three).

Common cluster axes:

- **Shared-helper duplication** — re-implementing what a shared package, utility, or design-token module already exposes.
- **Boundary normalization gaps** — empty string, whitespace-only, `Number('')` → `0`, cleared inputs, empty query params, trailing slashes; the same edge handled inconsistently across call sites.
- **Authorization wiring** — auth-check ordering/stacking, re-querying already-resolved auth state inside handlers, role checks bypassed on an alternate transport or path.
- **Schema / contract consistency** — read-vs-write invariant drift, two write paths for the same field, related schemas with diverging constraints.
- **Lifecycle / state machine** — terminal-state downgrades, illegal transitions, idempotency gaps.
- **Atomic write races** — read-then-insert, a pre-flight check without the mutation, missing locks.
- **UI primitive correctness** — invalid nesting or attributes, accessibility state derived from a different source than the visual state, spacing off the design scale.
- **UI-framework staleness** — imperative DOM/state mutation without a re-render, missing effect cleanup, stale closures/dependencies.
- **Doc / config drift** — config referencing missing files, runbook steps that don't match the code, `AGENTS.md` self-contradiction.
- **Test naming / coverage** — tests whose name describes a different code path than the fixture exercises.
- **Migration safety** — a destructive migration with no reverse path, constraint relaxation without a backfill.

If a comment doesn't fit a known cluster, name a new one. Don't force-fit.

### 3. Rank clusters by signal strength

Strong signal (write a guardrail):

- **≥3 comments in one cluster, same PR** — the rule is missing or not enforced.
- **Repeat from an earlier PR** — cross-reference the most recent root `AGENTS.md` to see if the rule already exists. If yes, the rule isn't *trigger-able* — add a grep-step / pre-commit check that would have caught it.
- **Cross-module pattern** — one root cause showed up in two or more modules or apps.
- **Security / money / lifecycle / auth** — even one comment is worth documenting; these are non-recoverable categories.

Weak signal (don't document):

- Single nit, one-off cleanup, typo, naming preference.
- Reviewer preference that wasn't accepted.
- Implementation detail that's clearly transient.

### 4. Decide placement (root vs module)

Use this decision tree:

```
Is the rule cross-cutting (reaches multiple modules/apps)?
├── Yes → the root AGENTS.md ("Required Pre-Review Checks" or the equivalent section)
└── No  → the AGENTS.md of the one module that owns it
         ├── Module has an AGENTS.md → add to its "easy to get wrong" / "hard rules" section
         └── Module has no AGENTS.md → create one (write a full module guide if it needs
                                       full coverage; otherwise stub the file with the new bullet)
```

Tactical guidance:

- A rule that applies to *every* module or app of a kind is cross-cutting → root.
- A rule specific to one layer or framework (e.g. one service's request handlers) → that module's `AGENTS.md`.
- When the same concern spans variants whose *implementation* differs (e.g. one platform vs another), prefer per-module rules over one root rule that goes stale — or keep a short pointer at root.
- Avoid putting one-module rules at root — the root section bloats and the per-module context goes stale faster.

### 5. Check for duplicates before writing

For every proposed bullet, grep every `AGENTS.md` in the repo (root + modules) for the rule already existing in some form:

```bash
rg -i "<key term 1>|<key term 2>" $(git ls-files '**/AGENTS.md' 'AGENTS.md')
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

- **Imperative, forward-looking.** "Normalize undefined / '' / whitespace through one boundary helper." Not "PR #15 had a preprocessor bug."
- **Concrete failure mode.** "`Number('')` returns `0`, not `NaN`, so a blank price input silently creates a free unit." Not "validate numeric inputs."
- **Show the trigger.** Either the shared helper's name, the grep command that finds offenders (`rg '<pattern>' <dir>`), or the framework API that enforces it.
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
- billing: <bullets>
- shared-types: <bullet>
```

Include the PR # and bug commit refs where the trigger lives, but keep the message under ~25 lines.

## What To Skip

- **Don't restate the PR description.** The PR body lives in GitHub; the retro lives in `AGENTS.md`. The two are different artifacts.
- **Don't write a per-PR retro file** (`docs/retro/pr-15.md`). The output is updates to `AGENTS.md` files, not a new doc.
- **Don't document rejected feedback.** A reviewer suggestion that the author declined is not a guardrail.
- **Don't bloat the root.** If you're adding more than 2 bullets to root from one PR, audit — most of them probably belong in module files.
- **Don't delete prior bullets while you're there.** Trim work is a separate task; mixing it with a retro makes the commit hard to review.

## Quality Bar

A finished post-mortem should:

1. Reduce the next similar PR's review-comment count for the same patterns. If you can't articulate which review comment a new rule would have prevented, the rule is too abstract.
2. Land rules where the engineer will *see* them — module file for module-specific work; root for cross-cutting.
3. Include the grep / helper / framework API that makes the rule actionable.
4. Leave the docs system more discoverable than it was — root pointer updated, module headings consistent.

## Related

- the `pr-master-respond` skill — fix-and-reply during review. Post-mortem runs after that finishes.
