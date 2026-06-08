#!/usr/bin/env node
// Vendor the pr-master skills into a `.agents/skills/` folder, for Codex and any other agent
// that reads the `.agents/skills` convention (Codex scans it from CWD up to the repo root, plus
// ~/.agents/skills for personal global skills).
//
//   npx github:sshanzel/plugins install            # into ./.agents/skills (this project)
//   npx github:sshanzel/plugins install --global   # into ~/.agents/skills (all your projects)
//   npx github:sshanzel/plugins install --dry-run   # show what would be written
//
// Claude Code users don't need this — install the plugin instead (richer: explicit /pr-master:*
// commands): `/plugin marketplace add sshanzel/plugins` then `/plugin install pr-master@sshanzel`.

import { cpSync, mkdirSync, readdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));

// Skill source sets bundled in this repo. (Plex's reviewer skills ship via the plex plugin / its
// own npx engine, not here.)
const SOURCES = [join(HERE, 'plugins', 'pr-master', 'codex', 'skills')];

const args = process.argv.slice(2).filter((a) => a !== 'install'); // `install` is optional sugar
const global = args.includes('--global') || args.includes('-g');
const dryRun = args.includes('--dry-run') || args.includes('-n');
const help = args.includes('--help') || args.includes('-h');

if (help) {
  console.log(`sshanzel-plugins — install pr-master skills into .agents/skills

Usage:
  npx github:sshanzel/plugins install            into ./.agents/skills (current project)
  npx github:sshanzel/plugins install --global   into ~/.agents/skills (all your projects)
  npx github:sshanzel/plugins install --dry-run   preview without writing

Claude Code users: install the plugin instead for the /pr-master:* commands —
  /plugin marketplace add sshanzel/plugins  →  /plugin install pr-master@sshanzel`);
  process.exit(0);
}

const destBase = global ? homedir() : process.cwd();
const destSkills = join(destBase, '.agents', 'skills');

const planned = [];
for (const src of SOURCES) {
  if (!existsSync(src)) continue;
  for (const name of readdirSync(src)) {
    const from = join(src, name);
    if (!statSync(from).isDirectory()) continue;
    planned.push({ name, from, to: join(destSkills, name) });
  }
}

if (planned.length === 0) {
  console.error('No skills found to install (expected plugins/pr-master/codex/skills). Aborting.');
  process.exit(1);
}

console.log(`${dryRun ? '[dry-run] would install' : 'Installing'} ${planned.length} skill(s) into ${destSkills}${global ? '  (global)' : ''}:`);
for (const { name, to } of planned) {
  console.log(`  - ${name}  →  ${relative(destBase, to) || to}`);
}

if (dryRun) process.exit(0);

mkdirSync(destSkills, { recursive: true });
for (const { from, to } of planned) {
  cpSync(from, to, { recursive: true, force: true });
}

console.log(`\nDone. Codex picks these up automatically from ${global ? '~/.agents/skills' : '.agents/skills'}.`);
if (!global) {
  console.log('Commit .agents/skills/ to share them with everyone who clones this repo.');
}
