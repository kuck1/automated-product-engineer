# Remote Pull Request Review Playbook

## Authoritative evidence

Capture the PR URL or number and retrieve:

- title, body, author, state, labels, draft state, mergeability;
- exact base and head refs and SHAs;
- commits, changed files, additions and deletions;
- full remote diff, not the current checkout's incidental diff;
- check runs, preview state, unresolved review threads, and linked issue or design context.

When a local checkout is useful, fetch the exact head SHA into an isolated or clean worktree. Do not switch or reset a user's active branch for a read-only review.

## Review in passes

1. **Intent:** Does the implementation match the PR description and accepted behavior?
2. **Correctness:** Trace normal, boundary, failure, retry, and out-of-order paths.
3. **Cross-layer contracts:** Compare callers, DTOs, routes, services, schema, migrations, jobs, and external writers.
4. **Authorization and privacy:** Distinguish read scope, write authority, tenant boundaries, and data exposed to the browser or logs.
5. **Architecture:** Check ownership, encapsulation, reuse, state authority, and whether the change extends an established seam.
6. **Operational behavior:** Review rollout, mixed versions, flags, fallback, idempotency, observability, and rollback.
7. **Evidence:** Determine whether tests and screenshots prove the changed behavior and important negative paths on the current SHA.

## Check the discussion

Read unresolved human threads before reporting. Confirm whether an apparent defect is already fixed on the current head, accepted as a product decision, or covered by another layer. Do not repeat stale automated comments without revalidating them.

If the head SHA changes, refresh the diff and invalidate line numbers, test results, and conclusions tied to the old head.

## Inline comments

Post only when authorized. One comment should contain one actionable finding with:

- a short severity-bearing title;
- the concrete trigger and impact;
- why another layer does not prevent it;
- the smallest robust correction direction;
- a tight line range on the current diff.

Avoid praise-only comments, broad architecture essays on one line, duplicate bot feedback, and suggestions that are merely personal style.

## Final review

Lead with findings ordered by severity. Then provide:

- a two- or three-sentence summary of the change;
- current validation and check status;
- residual test, migration, rollout, or review risk;
- whether the PR appears ready, needs changes, or is blocked on external evidence.

No findings is a valid result when the review was thorough. Say what evidence was inspected and identify any scope that could not be verified.
