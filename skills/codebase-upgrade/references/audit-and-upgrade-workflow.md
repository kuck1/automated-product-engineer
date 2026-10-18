# Audit and Upgrade Workflow

## 1. Pin the codebase

Read repository instructions and record the current branch, dirty state, runtime targets, package manager, deployment path, active pull requests, and the user's authority. Reuse active work instead of starting a competing implementation.

Run the local static audit when available:

```bash
pnpm dlx automated-product-engineer audit --json
```

The report is discovery input, not a verdict. It reads bounded source and documentation files without loading application modules. A package, keyword, or missing directory can suggest where to inspect; only traced behavior supports an upgrade.

## 2. Trace real workflows

Choose two or three workflows that carry the most product or operational risk. Include the user entry point, every state owner, network boundary, policy decision, durable write, external writer, failure state, and existing evidence. Prefer flows that reveal several boundaries at once: a shared counter, a saved filter, a privileged mutation, OAuth return, offline replay, multi-user editing, or a component used across product areas.

For each flow answer:

| Question | Evidence |
| --- | --- |
| What does the user believe happened? | copy, visible state, recovery affordance |
| What is authoritative? | URL, component, query cache, service, database, external system |
| Who may read and write it? | verified actor, tenant/object rule, RLS or equivalent |
| What happens twice or out of order? | cancellation, revision, idempotency, transaction |
| What survives refresh, termination, or reconnect? | persistence and reconciliation contract |
| How is it proved? | focused tests, browser/device journey, logs, screenshots |

## 3. Classify without inventing work

- **Preserve** when the path has one clear owner, explicit failure behavior, and current evidence.
- **Risk** only when an observed path can cause incorrect authority, data loss, security exposure, or false user confirmation.
- **Opportunity** when a better pattern would reduce repeated cost, but the product value or migration priority still needs a decision.
- **Unknown** when the answer depends on external policy, production behavior, or an absent owner.

Avoid scores that imply precision the evidence does not support. Use confidence, impact, affected workflow, and concrete source paths.

## 4. Recommend at product scale

Each recommendation should fit on one review card:

- **Outcome:** what becomes easier, safer, faster, or clearer for the user or team.
- **Current evidence:** exact files, callers, tests, and reproduced behavior.
- **Pattern and anti-pattern:** the target contract and what it replaces.
- **Owner:** specialist skill and application layer.
- **Slice:** the smallest end-to-end change that proves the pattern.
- **Compatibility:** migration, mixed versions, fallback, and rollback.
- **Proof:** focused tests and a real journey, including failure or race behavior.

Order at most three cards. Prefer a high-impact, reversible slice that exercises a real workflow over a repository-wide rewrite.

## 5. Ask the user

Ask after the evidence and recommendation cards exist. Offer the recommended first slice and up to two alternatives. The question should expose a real product or risk tradeoff, for example:

- fix a verified authorization or data-loss path first;
- make one high-friction workflow resilient across races and retries;
- reduce repeated product work through a governed component or state pattern.

If authority, persistence lifetime, or migration compatibility remains unknown, ask that focused question before implementation. Otherwise, the user chooses the priority rather than re-explaining the repository.

## 6. Implement and re-audit

Load the owning specialist skill, write a small contract, and implement through the authoritative boundary. Add evidence at the narrowest useful layers, then exercise the integrated journey in a browser, simulator, or device. Run broad gates only after the design stabilizes.

Rerun the audit. The final handoff records the before signal, implemented contract, current evidence, preserved behavior, remaining recommendation, and trigger for revisiting it.
