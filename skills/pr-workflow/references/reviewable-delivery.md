# Reviewable Delivery

## Establish topology

Before editing or pushing, record the repository, worktree, current branch, dirty state, intended base ref and SHA, related PRs, dependency order, and task owner. Reuse existing work rather than opening a duplicate branch or implementation.

One cohesive PR is the default. Split when reviewers would otherwise need to reason about unrelated product surfaces, migrations mixed with large visual churn, infrastructure mixed with production replacement, or separate rollback boundaries. A stack should name every base and landing order.

## Commit shape

Commits should describe a behavior or architecture boundary and be independently understandable. Useful groups include foundation, feature implementation, focused tests, visual evidence, and documentation. Avoid repository-wide formatting or generated churn during focused work.

Stage exact files when a worktree may contain concurrent work. Review `git status`, the staged diff, and `git diff --check` immediately before commit and push. Do not force-push shared history without explicit authority.

## PR body

Lead with the concrete trigger and resulting behavior. Include:

- scope and accepted user outcome;
- implementation and ownership across layers;
- state, data, authorization, migration, fallback, and rollback behavior;
- feature flag and analytics when present;
- desktop and compact screenshots for meaningful visual states;
- short flow media when interaction cannot be assessed from stills;
- exact validation commands, results, SHA, and CI links;
- retrospective fixes, deferred decisions, and residual risk;
- base/head relationship and stack order.

## Validation order

Run focused checks during iteration. After behavior and design stabilize, run static checks, unit and integration tests, build, critical E2E, targeted visuals, manual browser QA, and migration or security checks required by risk. A passing check on an older SHA is stale.

For a visual diff, inspect the artifact and classify the cause before updating. For flaky CI, reproduce or inspect logs, distinguish product failure from infrastructure, and avoid repeated blind reruns.

## Remote loop

After push, verify the remote head SHA, PR base, mergeability, required checks, preview state, and unresolved review threads. Batch review fixes, rerun invalidated evidence, and request rereview only after the branch is stable. Fix defects on the earliest stack layer that owns them and propagate forward.

The terminal handoff states the PR URL, branch/base, current SHA, behavior delivered, validation, review status, evidence links, blockers, and next human action. Never imply that a draft, stale preview, or partially green check set is ready to merge.
