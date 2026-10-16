---
name: code-review
description: Review the current working diff or branch for correctness defects and worthwhile reuse, simplification, and efficiency improvements. Use before opening or updating a pull request. Use pr-review for a remote pull request and security-review for a dedicated security pass.
---

# Code Review

Review the change, not the entire repository. Prefer a few verified findings with concrete failure paths over speculative advice or style nits.

## Establish scope

- Identify the exact base, head, staged changes, and uncommitted changes that are in scope.
- Read the repository instructions and the architecture, feature, or test documents that govern changed files.
- Inspect enough surrounding code and call sites to understand the contract; a diff alone is often insufficient.
- Preserve unrelated user changes and distinguish new defects from pre-existing behavior.

## Review angles

- **Correctness:** wrong conditions, edge cases, null handling, async races, partial failures, stale state, and error propagation.
- **Contracts:** type, API, schema, serialization, authorization, cache, and migration assumptions across boundaries.
- **Architecture:** misplaced responsibility, leaky abstractions, duplicate sources of truth, and changes that bypass established seams.
- **Maintainability:** existing helpers that should be reused, dead paths, unnecessary branching, and avoidable complexity.
- **Efficiency:** repeated queries, unbounded work, needless allocations or renders, and work performed at the wrong layer.
- **Tests:** missing coverage for behavior introduced by the diff, especially failure and concurrency paths.

Route a change with meaningful security exposure through `security-review` as a separate pass.

## Verify proposed findings

For each proposed finding:

1. Trace a specific input or state to the incorrect outcome.
2. Confirm the problem is introduced or exposed by this change.
3. Check whether another layer already prevents the failure.
4. Cite the narrowest changed line that owns the defect.

Drop anything that cannot survive this verification. Do not report compiler, formatter, or linter output as a review finding unless it reveals a deeper behavioral problem.

## Output

Lead with findings ordered by severity. For each, include `file:line`, the violated contract, a concrete failure scenario, and the smallest safe correction. Then note residual test risk or say plainly that no actionable findings survived review.

Only edit, comment, commit, or push when the request authorizes that action. When asked to fix findings, rerun the focused checks affected by each fix.
