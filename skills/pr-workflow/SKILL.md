---
name: pr-workflow
description: Prepare and maintain small reviewable pull requests, including exact branch and base management, dependency topology, commits, descriptions, visual evidence, local and remote checks, review follow-up, and final handoff.
---

# Pull Request Workflow

Package the work so every pull request has a clear purpose, exact base, useful evidence, and safe review boundary. Never merge unless explicitly authorized.

Read [references/reviewable-delivery.md](references/reviewable-delivery.md) for branch topology, commit and PR structure, screenshot evidence, CI monitoring, and stacked-change rules.

## Establish topology

- Inspect current branches, worktrees, open pull requests, and task ownership before creating anything.
- Pin the requested base ref and SHA. Do not approximate a dependency branch.
- Prefer one cohesive pull request. Stack only when dependencies or review boundaries justify it, and record the dependency graph.
- Give parallel writers isolated worktrees and non-overlapping file ownership.
- Preserve uncommitted user changes; never rewrite an earlier shared branch or force-push without authority.

## Build reviewable changes

- Keep commits cohesive and name the behavior or boundary they change.
- Review the incremental diff before committing and pushing.
- Fix a defect on the earliest branch that owns it, then propagate the correction through dependents.
- Rebase or restack only with a verified plan for every descendant and rerun invalidated evidence afterward.

## Validate by risk

Run focused unit, integration, contract, migration, and visual checks while iterating. Once the feature stabilizes, run the repository's required type, lint, build, full-test, and diff-integrity gates. Inspect any visual diff before approving a baseline and rerun normally afterward.

Record commands, results, exact SHA, and links to CI or test reports. A green check on an older SHA is stale evidence.

## Create or update the pull request

Use a descriptive title and a body that explains:

- user outcome and scope
- how the implementation works and why the boundary is appropriate
- data, authorization, migration, caching, fallback, and rollback behavior where relevant
- branch/base relationship and dependency order
- exact validation evidence and remaining risk
- screenshots for meaningful visual states, a short video for important flows, and the test or preview link
- feature guide, retrospective, and deferred-work links when available

Monitor remote checks and review threads until green or a concrete external blocker is evidenced. Resolve valid feedback, update the current SHA's evidence, and avoid repeated review requests without meaningful changes.

When Slack or Linear communication is authorized, send a concise delta or terminal handoff with pull-request links, status, blocker or next action, test link, and the most useful screenshot/video evidence. Verify the message was delivered.
