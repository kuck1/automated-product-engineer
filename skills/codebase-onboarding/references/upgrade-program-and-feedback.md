# Upgrade program and feedback loop

## Slice contract

Every slice names:

- user or operator outcome;
- current behavior and concrete evidence;
- product requirement and acceptance states;
- authority and state owner;
- target pattern and anti-pattern removed;
- migration and rollback;
- tests in execution order;
- documentation and local-skill updates;
- completion trigger and deferred work.

## Evidence order

1. Reproduce or characterize current behavior. For visible work, add a focused component or UI contract test first when it protects a meaningful interaction.
2. Add the narrowest domain, service, repository, schema, auth, or component proof.
3. Implement the boundary change.
4. Add integration proof for handoffs.
5. Add E2E only after the product requirement and cross-boundary contract are stable.
6. Perform real-browser or native manual QA.
7. Run the repository's full required gates once the design is stable.

Tests preserve accepted behavior, not accidental implementation. Update a test only after the decision record explains why the contract changed.

## Retrospective loop

After each slice record:

- expected and observed outcome;
- evidence that passed or failed;
- surprises, defects, and debugging path;
- strong pattern preserved;
- code, test, documentation, or skill fix-back completed;
- remaining risk and next trigger.

Rerun the static audit and compare it with `analysis.latest.json`. Refresh current practices and inconsistencies from verified evidence. If the lesson is repository-specific, update `project-engineering-context`. If it is general, propose a focused change to the owning shared skill with an example or test.

## Safe autonomous operation

The agent may continue through repository inspection, reversible edits, focused tests, documentation, commits, and draft pull-request preparation when already authorized. It must stop for destructive migrations, production secrets or access, material product-policy choices, external communication without authority, release, or merge.
