---
name: codebase-onboarding
description: Onboard an existing repository into Automated Product Engineer. Use when first analyzing a codebase, recording its local engineering contracts, selecting upgrade priorities, or creating a staged modernization program and project-specific skill overlay.
---

# Codebase Onboarding

Turn an unfamiliar repository into an explicit, team-owned operating system before broad implementation. Preserve what works, expose contradictions, and make later agent work follow the repository's real product and engineering decisions.

Start with `.automated-product-engineer/onboarding/README.md` when it exists. Run `pnpm dlx automated-product-engineer onboard` to create the initial workspace and refresh `analysis.latest.json`. Treat generated signals as hypotheses until callers, runtime behavior, tests, and documentation confirm them.

Read [references/onboarding-workflow.md](references/onboarding-workflow.md) for the full sequence. Use [references/domain-review-matrix.md](references/domain-review-matrix.md) to inspect each system boundary, [references/local-skill-overlay.md](references/local-skill-overlay.md) to adapt the shared skills without forking them, and [references/upgrade-program-and-feedback.md](references/upgrade-program-and-feedback.md) when executing selected upgrades.

## Establish the baseline

Read repository instructions and all product, architecture, ADR, API, schema, design-system, security, testing, release, and runbook documentation before drawing conclusions. Trace representative user journeys from UI through state, transport, policy, persistence, and recovery. Compare written claims with code and tests; record contradictions rather than silently choosing one.

Maintain these project-owned artifacts:

- `CURRENT_PRACTICES.md`: verified conventions, owners, evidence, and exceptions;
- `INCONSISTENCIES.md`: conflicts between docs, code, runtime behavior, and tests;
- `PRODUCT_REQUIREMENTS.md`: journeys, policies, failure recovery, and acceptance evidence;
- `DECISIONS.md`: accepted local choices and rejected alternatives;
- `UPGRADE_PROGRAM.md`: selected, ordered, reversible slices;
- `TEST_STRATEGY.md`: characterization, focused, UI, E2E, native, and operational proof;
- `RETROSPECTIVES.md`: observed results and fix-back changes.

Do not rewrite every installed skill. Keep reusable guidance upstream and put repository-specific differences in `project-engineering-context`, which every specialist must read before acting.

## Let the user choose the program

Return a compact current-system brief: strengths to preserve, verified risks, useful opportunities, contradictions, and material unknowns. Group recommendations by product effect. Recommend at most three starting slices and ask only when the choice changes product behavior, authority, data lifetime, security, compatibility, or recovery. If the user has already selected the outcome, continue.

## Execute in reviewable slices

For each selected slice:

1. Pin the product requirement and current behavior.
2. Add the smallest useful characterization or UI contract test before structural change.
3. Add focused domain, transport, persistence, or component proof at the owning boundary.
4. Implement one reversible vertical slice with explicit migration and rollback behavior.
5. Add E2E coverage after the product contract and cross-boundary behavior are stable.
6. Inspect the real browser or native runtime and run the relevant repository gates.
7. Update the local engineering context, decisions, program, and retrospective from evidence.

Share progress through committed documentation, reviewable commits, and a draft pull request when authorized. Continue autonomously through safe, reversible work and verification. Stop for destructive data work, production access, release, merge, or a genuinely undecided material contract.
