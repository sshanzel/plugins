---
name: pr-review-documenter
description: Use when handling PR review feedback to decide whether review comments reveal reusable engineering patterns, guardrails, or product invariants that should be captured in root or module AGENTS.md documentation, creating module documentation when needed.
---

# PR Review Documentation Skill

Use this skill while responding to PR reviews when a comment is about a recurring pattern rather than only a one-off defect.

## Goal

Turn durable review lessons into durable docs so the same issue does not need to be rediscovered in the next PR.

## What Counts As A Pattern

Document review feedback when it teaches or reinforces:

- a repo-wide convention, guardrail, or anti-pattern
- a module-specific invariant, lifecycle rule, transaction/idempotency rule, or state-machine behavior
- a shared contract or source-of-truth decision across API, mobile, shared packages, clients, or infrastructure
- a repeated testing, validation, error-handling, cache, media, auth, or database access pattern
- a product behavior decision that future engineers would otherwise have to infer from code or PR discussion

Do not document:

- typos, local naming nits, or one-off cleanup
- feedback that was rejected or left unresolved
- implementation details likely to change immediately
- reviewer preferences that are not accepted project direction

## Workflow

1. During PR feedback assessment, flag any comment that looks like a reusable pattern.
2. Include the documentation action in the proposed action before making changes, for example: `Fix the upload validation and add the file-size source-of-truth rule to apps/mobile/AGENTS.md`.
3. After user approval, update docs in the same change as the code fix or reply.
4. In the final PR summary, mention documentation updates alongside the fixed review item.

## Choosing Where To Document

- Use the root `AGENTS.md` for repo-wide rules, shared contracts, conventions, or review-learned guardrails that affect more than one app or package.
- Use the nearest relevant module `AGENTS.md` for behavior owned by one app, package, feature module, service, flow, or subsystem.
- If the relevant module has no `AGENTS.md`, create one. Prefer a concise module doc over adding module-specific rules to the root file.
- If understanding the module required broad code reading, use the `document-module` skill to produce a fuller module-level `AGENTS.md`.

## Writing Guidance

- Write the rule as a forward-looking instruction, not as PR history.
- Include enough context to make the rule actionable: what to protect, where it applies, and what to avoid.
- Keep additions small when updating existing docs.
- When creating a new module `AGENTS.md`, include at least:
  - module purpose / ownership
  - key files or entry points
  - invariants and review-learned guardrails
  - testing guidance for the documented behavior
- Do not add compatibility guidance for pre-MVP behavior unless the user explicitly asks for compatibility.
