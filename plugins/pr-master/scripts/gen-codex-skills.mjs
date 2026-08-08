#!/usr/bin/env node
// Generate Codex skills from the canonical Claude commands.
//
// The pr-master *commands* (commands/*.md) are the single source of truth. Codex has no
// "commands" type — its reusable unit is a skill (SKILL.md under .agents/skills). This script
// emits one Codex skill per command into codex/skills/, plus copies of the shared reference
// skills, so the Codex plugin (.codex-plugin/plugin.json -> "skills": "./codex/skills/") and the
// npx installer can ship them. Edit the command, then re-run: `node scripts/gen-codex-skills.mjs`.
//
// They live in their OWN dir (not the plugin's top-level skills/) on purpose: Claude Code
// auto-discovers every skills/ subdir, and we do NOT want these surfaced as auto-triggering
// Claude skills alongside the explicit /pr-master:<name> commands.

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'codex', 'skills');

// command file -> { name, description }. Descriptions are written for Codex's implicit matcher:
// front-load the trigger, and bound it ("use ONLY when explicitly asked") so a code-changing
// skill never fires on routine edits.
const SKILLS = {
  'create.md': {
    name: 'pr-master-create',
    description:
      'Draft or update a pull request description in a clean, consistent structure. Use when the user explicitly asks to open/create a PR, or to draft or clean up a PR description — not for routine commits or edits.',
  },
  'respond.md': {
    name: 'pr-master-respond',
    description:
      "Work through a PR's review feedback end-to-end — fetch comments, classify, and (only on the user's explicit `go`) fix, test, reply, resolve, summarize, and re-request review. Human-gated. Use ONLY when the user explicitly asks to respond to or address PR review comments; never trigger on general edits.",
  },
  'postmortem.md': {
    name: 'pr-master-postmortem',
    description:
      "After a PR merges, cluster its review comments into recurring themes and turn them into durable AGENTS.md guardrails. Use when the user asks for a PR retro / post-mortem / 'what did we learn from PR #N'. Not for unreviewed or trivial PRs.",
  },
  'fix-ci.md': {
    name: 'pr-master-fix-ci',
    description:
      "Diagnose and fix failing CI checks for the current branch's PR from the GitHub Actions logs, validating with the repo's own scripts. Use when the user asks to fix failing CI or a red check. Commits but does not push unless asked.",
  },
  'fix-conflicts.md': {
    name: 'pr-master-fix-conflicts',
    description:
      "Resolve the branch's merge conflicts against its base WITHOUT losing either side's work, asking before resolving any genuinely incompatible hunk. Use when the user asks to fix/resolve merge conflicts or an interrupted rebase/merge.",
  },
};

function stripFrontmatter(src) {
  const m = src.match(/^---\n[\s\S]*?\n---\n?/);
  return m ? src.slice(m[0].length).replace(/^\n+/, '') : src;
}

function adaptBody(body) {
  return body
    // /pr-master:respond -> the `pr-master-respond` skill (Codex has no slash-namespaced commands).
    // Consume optional surrounding backticks so `/pr-master:respond` doesn't yield nested backticks.
    .replace(/`?\/pr-master:([a-z-]+)`?/g, 'the `pr-master-$1` skill')
    // Codex skills take no inline args; the body must infer the target instead of reading $ARGUMENTS.
    // Consume surrounding backticks too, so a `$ARGUMENTS` token doesn't leave a backticked clause.
    .replace(/`?\$ARGUMENTS`?/g, 'the PR/branch from your request (else inferred from the current branch)');
}

function emit(name, description, body, sourceNote) {
  const dir = join(OUT, name);
  mkdirSync(dir, { recursive: true });
  const fm = `---\nname: ${name}\ndescription: >-\n  ${description}\n---\n`;
  const banner = `<!-- GENERATED${sourceNote ? ` from ${sourceNote}` : ''} by scripts/gen-codex-skills.mjs — do not edit here; edit the source and re-run. -->\n\n`;
  writeFileSync(join(dir, 'SKILL.md'), fm + '\n' + banner + body.trimEnd() + '\n');
  return name;
}

rmSync(OUT, { recursive: true, force: true });

const written = [];
for (const [file, meta] of Object.entries(SKILLS)) {
  const src = readFileSync(join(ROOT, 'commands', file), 'utf8');
  written.push(emit(meta.name, meta.description, adaptBody(stripFrontmatter(src)), `commands/${file}`));
}

// Shared reference skills the commands above defer to by name (e.g. respond.md loads both) —
// Codex needs its own copy of each since it has no cross-plugin skill lookup.
const SHARED_SKILLS = ['test-writing', 'comment-discipline'];
for (const name of SHARED_SKILLS) {
  const src = readFileSync(join(ROOT, 'skills', name, 'SKILL.md'), 'utf8');
  mkdirSync(join(OUT, name), { recursive: true });
  writeFileSync(
    join(OUT, name, 'SKILL.md'),
    src.replace(/(\n---\n)/, `$1\n<!-- COPIED from skills/${name} by scripts/gen-codex-skills.mjs — edit the source and re-run. -->\n`),
  );
  written.push(name);
}

console.log(`Generated ${written.length} Codex skills in codex/skills/:`);
for (const n of written) console.log(`  - ${n}`);
