---
name: test-writing
description: Guidelines for writing thorough tests. Use when creating or modifying test files.
user-invocable: false
---

# Test Writing Guidelines

## Core principle

Verify end behavior, not only that an intermediate mock fired.

## No false-positive tests

A test exists to fail when the behavior it describes breaks. A green check that
can never go red is worse than no test — it manufactures confidence and hides
the regression it claims to guard. Never write a test just to turn the light
green.

Before keeping a test, confirm it can actually fail: mentally (or literally)
break the code under test and check the assertion would go red. If it still
passes, the test is asserting nothing — fix it or delete it.

Red flags that signal a false positive:

- asserting only that a mock was called, never the result the caller received from it
- asserting a value the test itself hard-coded or recomputed, instead of what the code produced
- `toBeDefined()` / `toBeTruthy()` on something that is always defined regardless of the bug
- mocking so broadly that the function under test is itself stubbed out
- `expect(true).toBe(true)`, empty `it()` bodies, or assertions placed after an early `return`/`throw` that never runs
- a `try/catch` (or swallowed rejection) that lets a thrown failure pass silently
- snapshots regenerated to match current output without reading whether that output is correct
- async tests that never assert the awaited outcome changed state

Prefer observable outcomes — returned values, final persisted/UI state, the
error a bad path throws — over interaction bookkeeping. When a mock interaction
is genuinely what matters, also assert what the caller did with the result.

## Requirements

- cover the main success path and the meaningful edge cases
- verify final state for write-heavy paths
- assert negative behavior when it matters
- use realistic values
- use literal expectations for URLs, cookie names, and route paths when those values are what the test is proving

## Common edge cases

- malformed input
- missing optional fields
- duplicate delivery / replay
- unauthorized access
- empty or null values
- boundary-value behavior

## Bug fixes

Every bug fix should land with a regression test.
