# sshanzel/plugins

Coding-agent plugins for **[Claude Code](https://code.claude.com)** and **[Codex](https://developers.openai.com/codex)** — one repo, one source of truth, each agent installs from its own marketplace.

## Claude Code

```
/plugin marketplace add sshanzel/plugins
/plugin install pr-master@sshanzel
/plugin install plex@sshanzel
```

## Codex

Codex uses the same `SKILL.md` format and a parallel marketplace flow:

```
codex plugin marketplace add sshanzel/plugins
# update later with:  codex plugin marketplace upgrade
```

`pr-master`'s commands ship to Codex as skills — `pr-master-create`, `pr-master-respond`, `pr-master-postmortem`, `pr-master-fix-ci`, `pr-master-fix-conflicts` (+ `test-writing`). They carry conservative trigger descriptions so the code-changing ones don't auto-fire; invoke them explicitly via `/skills` or `$`.

`plex` ships its own Codex plugin from its repo (a `plex-review` skill + `plex-parallel-review`): `codex plugin marketplace add sshanzel/plex`.

## Plugins

### `pr-master` — the PR lifecycle suite

The whole pull-request loop. Agent-agnostic; gets smarter when [Plex](https://github.com/sshanzel/plex) is present (it auto-closes Plex's review-learning loop).

| Claude command | Codex skill | What it does |
|---|---|---|
| `/pr-master:create` | `pr-master-create` | Draft / update the PR description in a clean, consistent structure |
| `/pr-master:respond` | `pr-master-respond` | Work through review feedback end-to-end — **human-gated** (stops for your `go`) |
| `/pr-master:postmortem` | `pr-master-postmortem` | Turn a merged PR's recurring review patterns into durable `AGENTS.md` guardrails |
| `/pr-master:fix-ci` | `pr-master-fix-ci` | Diagnose + fix a failing CI run from its GitHub Actions logs |
| `/pr-master:fix-conflicts` | `pr-master-fix-conflicts` | Resolve merge conflicts by understanding both sides, validate, report |

### `plex` — local-first, unbiased AI code reviewer

A fresh-context reviewer grounded in a blast-radius code graph + accumulated review knowledge, plus a parallel-review orchestrator. The MCP engine is auto-fetched from npm (`@sshanzel/plex`) via `npx`. Source + docs: **[sshanzel/plex](https://github.com/sshanzel/plex)**.

```
/plugin install plex@sshanzel
```
Then `/plex:review` in any repo.

## How it's built (single source of truth)

The pr-master **commands** (`plugins/pr-master/commands/*.md`) are canonical. Codex has no "commands" type, so its skills are **generated** from them:

```
node plugins/pr-master/scripts/gen-codex-skills.mjs   # commands/*.md → plugins/pr-master/codex/skills/pr-master-*/SKILL.md
```

Edit a command, re-run the generator, commit. The Claude plugin reads `commands/` + `skills/`; the Codex plugin (`.codex-plugin/plugin.json`) reads `codex/skills/`. The two manifests (`.claude-plugin/` + `.codex-plugin/`) live side by side in one plugin dir — each agent ignores the other's.

## Updates

Plugins are git-SHA versioned (no pinned version), so a `git push` here is an update. Claude: `/plugin marketplace update sshanzel` (or auto-update) + `/reload-plugins`. Codex: `codex plugin marketplace upgrade`.

## License

MIT © Lee Solevilla
