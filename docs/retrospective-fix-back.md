# Retrospective and Fix-Back Loop

A retrospective is part of feature completion, not a note written after shipping. It converts surprises from implementation and QA into corrections while the context is still fresh.

## Run it after the first complete journey

Once the feature works end to end and has initial browser evidence, review:

- Where did the design contract leave ambiguity?
- Which boundary was hard to use or easy to bypass?
- Which bug escaped the smallest responsible test layer?
- What failed under mobile, keyboard, back/reset, retry, refresh, long content, or slow network?
- Did analytics, errors, privacy, authorization, or feature flags behave as intended?
- Was CI slow, flaky, or unable to reproduce local behavior?
- Did the implementation require modifying unrelated code that should have been encapsulated?

Record the answers in [`templates/retrospective/RETROSPECTIVE.md`](../templates/retrospective/RETROSPECTIVE.md).

## Fix back before handoff

Fix high-confidence findings that are in scope and affect correctness, usability, accessibility, security, maintainability, or reliable delivery. Add the smallest durable guard: code correction, clearer contract, focused test, fixture, documentation, or CI change.

Do not bury known defects under a future-work heading merely to make the PR appear complete. Defer only when the work is truly out of scope, requires a product decision, depends on another owner, or has a disproportionate migration risk. For every deferred item, record evidence, impact, owner or decision needed, and acceptance criteria.

After fixes:

1. Rerun the smallest affected checks.
2. Repeat the relevant manual desktop and mobile journey.
3. Recapture screenshots that no longer match.
4. Run required repository gates.
5. Update the PR description with what the retrospective changed.

## Turn repetition into system improvement

When a failure pattern repeats, improve the reusable workflow rather than relying on memory. Examples include adding a missing export field to the handoff contract, introducing a stable adapter boundary, rebalancing a slow test shard, creating a deterministic visual fixture, or adding a review item to `AGENTS.md`.

Keep the retrospective concise and evidenced. Its purpose is to improve the feature and the system that produced it.
