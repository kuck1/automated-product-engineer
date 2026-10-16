# Automated Delivery and Demo Evidence

Automation should make a feature easier to review without taking release authority away from people. The target output is a pushed feature branch, deterministic screenshots, a useful draft PR, and green evidence. Automation must never merge, deploy production, approve its own changes, or hide failed checks.

## Delivery sequence

1. Confirm the exact base branch, existing task or PR, scope, and feature flag.
2. Implement through the repository's existing contracts and extension points.
3. Run focused tests while behavior is changing.
4. Stabilize deterministic fixture data, route, viewport, clock, fonts, and animation.
5. Capture desktop and mobile screenshots for each meaningful step and result state.
6. Complete the retrospective and fix high-confidence, in-scope findings.
7. Rerun affected tests and recapture any stale evidence.
8. Run full required gates, review the diff, and verify a clean worktree.
9. Push the branch and open or update a draft PR with evidence attached.
10. Let CI and reviewers evaluate the branch. A human decides whether and when to merge.

## Screenshot contract

Use [`templates/automation/demo.frames.json`](../templates/automation/demo.frames.json) as a manifest and [`templates/automation/capture-demo.mjs`](../templates/automation/capture-demo.mjs) as a starting point. Each frame specifies:

- a stable name and product step;
- a deterministic route;
- desktop or mobile viewport dimensions;
- an optional accessible locator that proves the screen is ready;
- full-page or viewport capture.

Capture the beginning, important decisions, successful result, and one meaningful recovery state when relevant. Use seeded non-sensitive data. Inspect console and network failures during manual QA. Screenshots prove visible behavior; they do not replace assertions, accessibility checks, or API tests.

Store evidence in a predictable folder such as `docs/demo/<feature>/`. Include the manifest or generated metadata in the PR so reviewers know the URL, viewport, and capture time. Recreate evidence when the feature changes.

The capture script expects Playwright in the target repository:

```bash
npm install --save-dev playwright
npx playwright install chromium
```

Use the repository's existing Playwright dependency and browser cache when they already exist.

## Draft PR automation

[`templates/automation/open-draft-pr.sh`](../templates/automation/open-draft-pr.sh) verifies a clean, non-default branch, pushes it, and opens a draft PR using [`templates/automation/PR_BODY.md`](../templates/automation/PR_BODY.md). It deliberately refuses to merge.

Before running it:

```bash
node templates/automation/capture-demo.mjs \
  templates/automation/demo.frames.json

bash templates/automation/open-draft-pr.sh \
  develop \
  "feat: add the reviewed experience" \
  templates/automation/PR_BODY.md
```

Adapt validation commands and screenshot routes to the target repository. The PR description should state the problem and resulting behavior, architecture boundaries, data and fallback behavior, feature flag, analytics, screenshots, exact validation, retrospective fixes, material risks, and rollback path.

## Safe automation boundaries

- Fail on dirty worktrees so unrelated user changes cannot be swept into a PR.
- Refuse default-branch heads.
- Use an explicit base and existing authenticated Git remote.
- Keep secrets and customer data out of URLs, screenshots, fixtures, logs, and PR bodies.
- Create draft PRs; do not auto-approve, merge, or deploy production.
- If required evidence is missing or checks fail, report the concrete gate instead of claiming readiness.
