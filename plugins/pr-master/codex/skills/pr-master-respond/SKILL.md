---
name: pr-master-respond
description: >-
  Work through a PR's review feedback end-to-end — fetch comments, classify, and (only on the user's explicit `go`) fix, test, reply, resolve, summarize, and re-request review. Human-gated. Use ONLY when the user explicitly asks to respond to or address PR review comments; never trigger on general edits.
---

<!-- GENERATED from commands/respond.md by scripts/gen-codex-skills.mjs — do not edit here; edit the source and re-run. -->

# Respond to PR review feedback

Work through a PR's review feedback end-to-end. Use the PR/branch from your request (else inferred from the current branch) as the PR (number or URL) if given, else detect it from the current branch. **Human-gated:** present an assessment and stop for the user's `go` before changing anything.

## Workflow

1. Detect or receive the PR URL.
2. Fetch inline comments, issue comments, and unresolved review threads via `gh`.
   - Ignore automated deployment/status comments that do not require code review action — e.g. deployment/preview-status bots (Vercel, Netlify, and the like). Do not number them, include them in the assessment table, reply to them, or include them in the final summary.
   - Treat low-confidence or suppressed review notes as regular feedback only the first time they appear or when they materially change. If a previous responder run already assessed or addressed that low-confidence note, do not list it again in later assessment tables or summary comments.
   - Cluster duplicate automated-review comments by root cause before presenting to the user. Copilot can repeat the same concern across commits or line anchors; keep the GitHub comment/thread IDs in your notes so each thread still gets a reply/resolution later, but do not flood the assessment with one row per duplicate when the proposed fix is identical.
3. Classify each item as:
   - `bug`
   - `improvement`
   - `minor`
   - `stale`
   - `question`
   - `discuss`
   While classifying, watch for comments that express a reusable pattern, guardrail, or module invariant — when one should change documentation (specs, runbooks, `AGENTS.md`), include that docs update in the proposed action.
   - When a comment creates a new `AGENTS.md` rule or points at an existing
     guardrail, do a same-pattern sweep before proposing or applying fixes.
     Search the touched module/package for equivalent code shapes, include all
     current violations in the same assessment row or coupled rows, and mention
     the sweep in the summary. Do not wait for the reviewer to rediscover
     sibling instances of the same rule in later rounds.
4. Present an assessment table before changing code or replying, then stop.
   - Use a concise title such as `PR Feedback Assessment`; do not title the section `Review Work`.
   - Number the review items for the current responder run with plain row numbers such as `1`, `2`, `3`, etc. These numbers only need to stay consistent between this round's assessment, replies, commits, and summary comment.
   - List each distinct current-round feedback root cause as its own numbered row. If multiple comments share the same root cause, proposed code change, and verification path, group them into one row and include the duplicate count and affected files/comment IDs in the feedback cell.
   - Use assessment columns in this order: `Item`, `Feedback`, `Class`, `Proposed action`.
   - Each proposed action must briefly explain what will change and where the change is likely to be made.
   - If multiple items must be fixed together but have different root causes, keep separate rows and mention the coupling inside each relevant `Proposed action`, e.g. `Shares the same helper as item 2; update the shared parser and group both into one commit.`
   - Do not use one-word actions such as `Fix`, `Update`, or `Reply`; write a short phrase or sentence instead, such as `Adjust the token refresh guard to return early when the cookie is missing`.
   - For comments that do not need a code change, describe the intended response, verification, or reason for no change.
   - Explicitly ask the user to confirm before proceeding with the exact `go` signal. Use this template sentence: Reply with `go` to apply these actions as-is — or tweak, adjust, discuss, or suggest a different fix on any specific item first and I'll redraft the relevant rows. I will not change code, reply, resolve threads, commit, push, or request review until you send `go`.
   - Do not perform any review-response actions after the assessment table until the user explicitly approves the proposed actions with `go`.
5. After explicit user confirmation, use this review-response loop:
   - load and follow the `comment-discipline` and `test-writing` skills before writing any code — they set how much to comment and what a thorough test looks like for every step below
   - apply fixes
   - add or extend a test for every item that pushes a code change where one is applicable (see the test-coverage rule below)
   - run checks
   - commit per comment or per shared root cause, keeping each item's test in the same commit as its fix
   - reply to each thread with the concrete fix, decision, or rationale
   - resolve fixed threads and threads that are not up for further discussion
   - leave unresolved any thread that still needs product/engineering discussion
   - verify that every review reply was submitted as an actual PR review/comment, not left in a pending review
   - submit any pending review with `COMMENT`, or delete it if it was created accidentally and contains no useful comments
   - close the Plex review loop if Plex reviewed this PR (see "Closing the Plex review loop" below) — autonomous bookkeeping, no extra user prompt
   - add a formatted PR summary comment, similar in quality to the assessment table shown to the user, that reports the outcome and what was done
   - re-request review from the relevant reviewer(s), including Copilot when Copilot reviewed the PR
   - request Copilot review through `gh` or the GitHub API; do not post `@copilot review` or any other trigger comment
   - mention in the final response whether the review request succeeded or was unavailable

## Rules

- Do not accept review feedback blindly; verify it against the code and product direction.
- Treat documentation as a future-reference contract. Specs, runbooks, `AGENTS.md`, and the PR description itself are read later as the source of truth, so an inaccurate reference (a wrong/incomplete route or a documented path prefix that doesn't match the framework's actual routing, wrong HTTP-status semantics, a stale design/ordering claim that no longer matches the shipped code, a missing ops step like an IAM grant or env var) is a real defect: classify it `bug`/`improvement`/`minor` and fix it, never dismiss it as noise. Apply the same accuracy bar to the PR body. Only down-classify a docs comment to a reply-without-change when the reviewer's wording is genuinely equivalent — it means the same thing — in which case say so and resolve.
- Group duplicate automated-review feedback in the user-facing assessment and summary, but still reply to and resolve every underlying GitHub thread/comment after fixes land.
- Proposed fixes should be complete, not incremental fragments.
- Every item that pushes a code change ships a test when one is applicable — not just `bug` items, but also `improvement`/`minor` and any change of behavior, contract, boundary, or edge case. Add or extend the test in the same commit as the fix, and name it in both the thread reply and the summary row. **Load and follow the `test-writing` skill for what a thorough test looks like** — don't hardcode a framework or repo-specific rule here. A test is genuinely *not* applicable only for docs-only edits, pure renames with no behavior change, config/comment tweaks, or changes already fully exercised by an existing test — in those cases state the reason in the reply/summary instead of silently shipping untested. When unsure whether a change is testable, default to writing the test.
- Match the target repo's own comment density when writing or editing code. **Load and follow the `comment-discipline` skill** before applying fixes — don't add comments beyond what it (or the repo's own stated convention) calls for.
- Commit per review item whenever the change is isolated. Group multiple items into one commit only when they converge on the same files, same root cause, or same coherent code change.
- Classify `discuss` only when the intended action is to reply or keep the thread open for discussion. If you propose a code or docs change, classify the item as `bug`, `improvement`, or `minor` instead.
- Run the repo checks before claiming a review item is fixed.
- Do not substitute a generic PR summary for the review round result summary; the result summary is an audit trail for the review round.
- Do not leave pending reviews or draft comments behind after resolving threads.
- Do not stop after resolving threads. A completed run ends with a summary comment and a re-review request unless the user explicitly says not to request review.
- Do not request Copilot review with a PR comment such as `@copilot review`; use reviewer assignment through the CLI or API.

## Closing the Plex review loop (if Plex reviewed the PR)

If a `plex` MCP server is connected and reviewed this PR, close its learning loop after fixes land — **silently and autonomously**, as part of the post-`go` loop. This is internal bookkeeping: never prompt the user about Plex verdicts, and **never report whether the close succeeded or failed** — it does not belong in a thread reply, the summary comment, or your final response to the user. The Plex tools document their own *how* (when to call, identity fields, that `accept` is inferred — read their descriptions); this command only triggers them:

- **After pushing fixes** → `mcp__plex__reconcile_outcomes` (auto-accepts what your commits addressed).
- **Explicit dismissal** (you replied "wrong/noise" and changed nothing) → `mcp__plex__record_outcome` `kind: "reject"`.
- **Awareness flag confirmed intentional** ("good catch, but deliberate") → `record_outcome` `kind: "acknowledge"` (not `reject`).

Don't hand-record `accept` — `reconcile_outcomes` infers it.

**A disconnected or deferred Plex is never a reason to skip this — and never something to surface to the user.** The stdio server idle-drops by design and re-spawns on the next call (~400ms), so just *make* the call (the call itself reconnects it — it is not "down" or "unable to reload"). If the `mcp__plex__*` tools aren't listed (deferred in a crowded MCP session), run `ToolSearch("mcp__plex__")` first to load them, then call. If after that it still can't complete this session, **drop it silently** — the next Plex review of the branch auto-accepts the fix by locality, so nothing is lost. Never tell the user a reconcile is pending, never ask them to reconnect Plex, and never offer to run it for them later. Skip entirely only when no `plex` server is configured at all.

## Requesting Copilot Re-Review

**Use the GraphQL `requestReviewsByLogin` mutation with `botLogins`.** The
common mistakes that look like "Copilot can't be requested via API" all
come from picking the wrong mutation / wrong endpoint / wrong field:

- REST `POST /repos/{owner}/{repo}/pulls/{n}/requested_reviewers` with
  `reviewers[]=copilot-pull-request-reviewer` returns 422 *"not a
  collaborator"*. The REST endpoint only accepts User collaborators —
  Copilot is a Bot, so this path is fundamentally wrong.
- GraphQL `requestReviews` with `userIds=[<bot node id>]` returns
  `NOT_FOUND: Could not resolve to User node`. The `userIds` field only
  accepts User nodes, not Bot nodes.
- `gh pr edit "$n" --add-reviewer "@copilot"` exits 0 but only calls
  `updatePullRequest` (metadata) — the reviewer assignment is silently
  dropped. Same for `--add-reviewer copilot-pull-request-reviewer`.

The mutation that actually works is **`requestReviewsByLogin`**, which has
a dedicated `botLogins` field. The canonical Copilot reviewer login is
**`copilot-pull-request-reviewer`** (it's a Bot in GraphQL, even though
the legacy REST `users/{login}` endpoint returns `"type": "Organization"`
— don't be fooled by that). Do **not** use `copilot-swe-agent` here —
that's the autonomous SWE agent, a different product.

```bash
PR_ID="$(gh pr view "$pr_number" --json id --jq .id)"
gh api graphql \
  -f query='mutation($prId: ID!, $botLogins: [String!]) {
    requestReviewsByLogin(input: {
      pullRequestId: $prId,
      botLogins: $botLogins,
      union: true
    }) {
      pullRequest { id }
    }
  }' \
  -f prId="$PR_ID" \
  -f 'botLogins[]=copilot-pull-request-reviewer'
```

A successful response returns the pull request id. Triggering a new
review request creates a `review_requested` timeline event on the PR.

### Verifying the request landed

`gh pr view --json reviewRequests` filters out Bot reviewers in most gh
versions — it'll show `[]` even after a successful mutation. Verify
through the GraphQL path instead:

```bash
gh api graphql -f query='query($owner:String!,$name:String!,$n:Int!){
  repository(owner:$owner,name:$name){
    pullRequest(number:$n){
      reviewRequests(first:10){
        nodes{
          requestedReviewer{
            __typename
            ... on User { login }
            ... on Bot { login }
          }
        }
      }
    }
  }
}' -f owner="$owner" -f name="$repo" -F n="$pr_number"
```

A node with `__typename: Bot` and `login: copilot-pull-request-reviewer`
in the result confirms the request is enrolled. Copilot polls and
delivers a new review shortly after.

### When it actually fails

If the GraphQL mutation returns an error (rather than a successful
payload), capture the exact `errors[].message` in the final response —
common real failures are auth scopes, archived repos, or the org
disabling Copilot via policy. Don't fall back to the REST endpoint or
alternate logins; they all fail for the same root reason described
above. In those cases instruct the user to click *"Re-request review"*
next to Copilot's row in the GitHub PR UI.

## Replying to and Resolving Threads

Each inline review comment lives in a `ReviewThread`. The reply and resolve
operations use different endpoints — get them both right or threads end up
stuck.

### Per-thread reply (REST, auto-submits)

`POST /repos/{owner}/{repo}/pulls/{n}/comments/{comment_id}/replies` posts
a reply directly to the thread containing that comment id. It does NOT
create a pending review (which is the trap with the `pending_review` flow
that has bitten earlier runs). One reply per item:

```bash
owner_repo="$(gh repo view --json nameWithOwner --jq .nameWithOwner)"
gh api \
  --method POST \
  "repos/$owner_repo/pulls/$pr_number/comments/$comment_id/replies" \
  -f body="Fixed in \`abc1234\`: concrete description of the change."
```

For batches, prefer an explicit `bash` heredoc (zsh's associative-array
iteration syntax differs and silently breaks the loop):

```bash
bash <<'BASH'
declare -A REPLIES=(
  [12345]="Fixed in \`abc1234\`: …"
  [12346]="Fixed in \`def5678\`: …"
)
for id in "${!REPLIES[@]}"; do
  gh api --method POST "repos/$owner_repo/pulls/$pr_number/comments/$id/replies" \
    -f body="${REPLIES[$id]}" --jq '.id' > /dev/null && echo "replied to #$id"
done
BASH
```

### Thread resolution (GraphQL)

Resolving uses the `resolveReviewThread` mutation against the thread node
id (not the comment id). Fetch unresolved thread ids first:

```bash
gh api graphql \
  -f query='query($owner:String!,$name:String!,$number:Int!){
    repository(owner:$owner,name:$name){pullRequest(number:$number){
      reviewThreads(first:50){nodes{id isResolved comments(first:1){
        nodes{databaseId path line body author{login}}}}}}}}' \
  -f owner="${owner_repo%%/*}" -f name="${owner_repo##*/}" \
  -F number="$pr_number" \
  --jq '[.data.repository.pullRequest.reviewThreads.nodes[]
    | select(.isResolved == false)
    | {threadId: .id, comment: .comments.nodes[0]}]'
```

Then resolve each:

```bash
gh api graphql \
  -f query='mutation($id:ID!){resolveReviewThread(input:{threadId:$id}){thread{isResolved}}}' \
  -f id="$thread_id"
```

Resolve threads where the fix is verified or the discussion has been
answered. Leave unresolved any thread that needs further product /
engineering discussion (see Rules).

## Summary Comment Format

The final PR comment must be formatted and outcome-oriented. It should include:

- a short opening line that says the review feedback has been addressed and is ready for re-review
- a concise table or clearly sectioned list mapping every assessed root-cause item to its outcome, including grouped duplicate comments fixed by the same commit
- the same current-round item numbers used in the assessment table so each outcome maps back to the assessment
- the actual commit hash that fixed each item, included in the outcome text when useful
- commit summaries when useful
- the test added or extended for each item that pushed a code change, or a short reason when a test was not applicable
- any items intentionally left open for product or engineering discussion
- checks that passed
- a final line noting that threads were replied to/resolved and review was re-requested

Use one row per assessed root cause. When duplicate comments were grouped,
include the count and/or comment IDs in that row, then make sure every
underlying GitHub thread received its own reply and resolution. The user-facing
audit trail should explain the real engineering work, not amplify automated
duplicate noise.

Prefer a table when there are several comments, for example:

| Item | Outcome |
| --- | --- |
| 1. Profile preview exposure | Fixed in `abc1234`: added visibility/safety gating and regression tests. |
| 2. Native purchase proof + restore schema | Fixed in `def5678`: required platform proof and gated placeholder verification outside production. |
| 3. Location exclusion discussion | Replied with product rationale and left the thread unresolved for discussion. |

## Posting Multiline GitHub Comments

When posting or editing PR summary comments with `gh`, preserve real newlines.
Do not pass a body string that contains literal escaped `\n` sequences, because
GitHub will render the table as one broken line.

### Tables render regardless of cell length

Long cell content does **not** break a Markdown table — GitHub renders it no
matter how wide the cell is. Only two things actually break table rendering, and
neither is length:

- **A raw newline inside a cell.** Every table row (header, the `| --- |`
  separator, and each data row) must sit on its own single physical line. Never
  wrap a long cell across multiple lines. If a cell genuinely needs a line
  break, use a literal `<br>`, not a real newline.
- **An unescaped `|` inside a cell.** A bare pipe is read as a column separator,
  which shifts every following column. Escape literal pipes in cell text as
  `\|`.

So the rule for assessment/summary tables: keep each row on one line however
long it gets, escape any literal `|`, and reach for `<br>` only when you
deliberately want an in-cell break. The literal-`\n` trap above is the third
failure mode — the heredoc + `--body-file` pattern below avoids all three.

**Terminal caveat (the in-terminal assessment table is different).** The
"length never matters" rule holds for GitHub's renderer, but the assessment
table you print in step 4 is rendered by the terminal's Markdown renderer, which
must fit columns into a fixed width and will fall back to printing raw `| ... |`
text when a single cell is very long/wide. So for the in-terminal assessment
table, keep cells short: put a one-line gist in the `Proposed action` cell (e.g.
"Deactivate before logout — details below") and move the full proposed action
into prose beneath the table. The posted GitHub summary comment is not subject to
this and can keep long cells.

Prefer a heredoc-backed temporary file and `--body-file` for issue comments:

```bash
summary_file="$(mktemp)"
cat > "$summary_file" <<'EOF'
Review feedback has been addressed and is ready for re-review.

| Item | Outcome |
| --- | --- |
| 1. Example item | Fixed in `abc1234`: describe the concrete outcome. |
| 2. Discussion item | Replied with rationale and left open for product decision. |

Checks passed:
- `npm test`
- `npm run lint`

Threads were replied to and resolved; re-review has been requested.
EOF

gh pr comment "$pr_number" --body-file "$summary_file"
rm "$summary_file"
```

For GraphQL `updateIssueComment` or review-thread replies, build the body with
real newlines using ANSI-C shell quoting or a file read, not backslash-escaped
text inside normal quotes:

```bash
body=$'Review feedback has been addressed and is ready for re-review.\n\n| Item | Outcome |\n| --- | --- |\n| 1. Example item | Fixed in `abc1234`: describe the concrete outcome. |'
gh api graphql \
  -f query='mutation($id:ID!,$body:String!){ updateIssueComment(input:{id:$id,body:$body}){ issueComment{ url } } }' \
  -f id="$comment_id" \
  -f body="$body"
```

After posting or editing a formatted summary comment, verify the stored body
contains real newline characters before considering the review-response round
complete:

```bash
gh pr view "$pr_number" --json comments --jq '.comments[-1].body'
```

If the output shows visible `\n` text instead of line breaks, edit the comment
before finalizing.
