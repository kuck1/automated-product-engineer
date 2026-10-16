---
name: pr-review
description: Review an existing GitHub pull request by number using its remote metadata, exact base, diff, checks, and discussion. Use for a teammate's or explicitly named pull request; use code-review for local branch changes.
---

# Pull Request Review

Review the pull request GitHub actually contains. Do not substitute the local working diff.

Read [references/remote-review-playbook.md](references/remote-review-playbook.md) for exact remote evidence, review angles, line-comment rules, stale-head handling, and the recommended output structure.

## Gather authoritative context

- Fetch the title, body, author, state, base and head refs, exact SHAs, labels, commits, changed files, and check results.
- Fetch the complete remote diff. Inspect full files and callers locally only when needed to understand a contract.
- Read repository instructions and linked product, architecture, design, migration, or incident context.
- Read unresolved human review threads so the review adds new signal rather than duplicating resolved discussion.

If the head changes during review, refresh the diff and invalidate conclusions tied to the old SHA.

## Review the change

Check:

- behavioral correctness and failure handling
- compatibility across API, schema, type, and persistence boundaries
- authorization, privacy, and security exposure
- concurrency, caching, retry, and idempotency behavior
- architecture fit, reuse, and unnecessary complexity
- performance risks supported by a realistic workload
- whether tests prove the new behavior and important negative paths
- whether migrations, rollout, rollback, and operational notes match the risk

Only report issues introduced by the pull request. Verify every proposed finding against surrounding code and describe a concrete failure scenario.

## Output and comments

Lead with actionable findings ordered by severity, each with a precise file and line reference, impact, reproduction conditions, and suggested direction. Follow with a short change summary and any residual test or rollout risk. If no finding survives verification, say so directly.

Post inline comments or submit a GitHub review only when authorized. Keep each comment self-contained and anchor it to the current head. Do not approve, merge, close, or modify the pull request unless explicitly requested.
