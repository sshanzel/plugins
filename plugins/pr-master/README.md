# pr-master

A pull-request lifecycle suite for coding agents (Claude Code and Codex). It handles the work *around* a PR that isn't writing the feature itself: drafting the description, working through review feedback, fixing CI, resolving merge conflicts, and turning recurring review themes into lasting guardrails.

pr-master is agent-agnostic and runs on the subscription you already have. It uses the GitHub CLI (`gh`), so have that installed and authenticated. When a [Plex](https://github.com/sshanzel/plex) MCP server is connected, pr-master also closes Plex's review-learning loop for you (see [Working with Plex](#working-with-plex)).

## Commands

In Claude Code these are slash commands. In Codex they ship as skills with the same names, prefixed `pr-master-` (Codex has no command type). Most take an optional PR number or URL; without one they detect the PR from the current branch.

### `/pr-master:create`

Draft, prepare, or update a PR description in a clear, consistent structure. Use it when you open a PR, or when an existing description has drifted from what the branch actually does.

### `/pr-master:respond`

Work through a PR's review feedback end to end. It fetches the inline comments, issue comments, and unresolved threads, clusters duplicates, classifies each item (bug, improvement, minor, stale, question, or discuss), and presents an assessment table. Then it stops. **Nothing changes until you reply `go`** (see [Human-gated](#human-gated-by-default)). After your go it applies the fixes, adds or extends a test for each change that needs one, runs the repo's checks, replies to and resolves each thread, posts a summary comment, and re-requests review (including Copilot).

### `/pr-master:fix-ci`

Diagnose and fix a failing CI run for the current branch's PR. It pulls the failed GitHub Actions logs, applies fixes locally, and validates them with the repo's own scripts before pushing.

### `/pr-master:fix-conflicts`

Resolve the branch's merge conflicts against its base without losing anyone's work. It reads both sides and combines them, and asks before resolving any hunk that is genuinely incompatible.

### `/pr-master:postmortem`

Run this after a PR merges, or against any finished PR. It pulls every review comment, clusters the themes, and converts recurring patterns into durable `AGENTS.md` guardrails so the next PR avoids the same review tax. A single comment rarely justifies a rule; six of the same one do, and that pattern is only visible after the fact.

## Human-gated by default

`respond` never edits, replies, resolves, commits, or pushes on its own. It shows you an assessment of every review item first (what it is, how it's classified, and the exact action it proposes) and waits. You reply `go` to apply everything as-is, or adjust any row first. You stay in control of what lands on the PR.

## Working with Plex

If a [Plex](https://github.com/sshanzel/plex) MCP server is connected and reviewed the PR, pr-master closes its review-learning loop automatically, as silent bookkeeping. It never prompts you about Plex verdicts:

- After you push fixes, it reconciles the findings your commits addressed, which Plex records as accepted.
- When you reply that a finding is wrong and change nothing, it records a reject.
- When you confirm a flagged item is intentional, it records an acknowledge.

If no Plex MCP is present, pr-master skips this step. Plex is not required to use pr-master.

## The test-writing skill

Every change that pushes code ships with a test when one applies. The bundled `test-writing` skill carries the guidance for what a thorough test looks like, so the bar isn't hardcoded to one framework. It runs automatically as part of `respond` and the fixers; you don't invoke it directly.

## Install

pr-master lives in the `sshanzel/plugins` marketplace, alongside the `plex` reviewer. They are separate plugins, installed individually.

**Claude Code**

```
/plugin marketplace add sshanzel/plugins
/plugin install pr-master@sshanzel
```

**Codex**

```
codex plugin marketplace add sshanzel/plugins
```

The commands then appear as the `pr-master-*` skills; invoke them explicitly through `/skills` or `$`.

## Updating

The plugin updates with a marketplace pull. Claude: `/plugin marketplace update`, then `/reload-plugins`. Codex: `codex plugin marketplace upgrade`.

## License

[MIT](../../LICENSE)
