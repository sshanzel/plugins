# sshanzel/plugins

A [Claude Code](https://code.claude.com) plugin **marketplace** — a small shelf of coding-agent
plugins. Add the marketplace once, then install whichever you want:

```
/plugin marketplace add sshanzel/plugins
```

## Plugins

### `pr-master` — the PR lifecycle suite

On-demand commands for the whole pull-request loop. Agent-agnostic; gets smarter when [Plex](https://github.com/sshanzel/plex) is present (it auto-closes Plex's review-learning loop).

```
/plugin install pr-master@sshanzel
```

| Command | What it does |
|---|---|
| `/pr-master:create` | Draft / update the PR description in your standard structure |
| `/pr-master:respond` | Work through review feedback end-to-end — **human-gated** (stops for your `go`) |
| `/pr-master:postmortem` | Turn a merged PR's recurring review patterns into durable `AGENTS.md` guardrails |
| `/pr-master:fix-ci` | Diagnose + fix a failing CI run from its GitHub Actions logs |
| `/pr-master:fix-conflicts` | Resolve merge conflicts by understanding both sides, validate, report |

### `plex` — local-first, unbiased AI code reviewer

A fresh-context reviewer grounded in a blast-radius code graph + accumulated review knowledge, plus a parallel-review orchestrator. The MCP engine is auto-fetched from npm (`@sshanzel/plex`) via `npx`. Source + docs: **[sshanzel/plex](https://github.com/sshanzel/plex)**.

```
/plugin install plex@sshanzel
```
Then `/plex:review` in any repo.

## Updates

Plugins are git-SHA versioned (no pinned version), so a `git push` here is an update. Users get it via `/plugin marketplace update sshanzel` (or auto-update) + `/reload-plugins`.

## License

MIT © Lee Solevilla
