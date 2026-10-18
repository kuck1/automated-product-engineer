# Product Engineering Pattern Atlas

This document defines how the toolkit turns repeated product-engineering failures into inspectable, teachable, and testable guidance. It is the design contract for the pattern catalog, executable examples, codebase audit, specialist skills, and conductor.

## Thesis

Patterns should begin with the product situation a team recognizes, not with a framework feature. “The total in the top bar is stale after checkout” is a better entry point than “use query invalidation.” “Two operators edited the same record” is a better entry point than “add optimistic concurrency.” The technical pattern follows from the user-visible failure, the authority boundary, and the recovery contract.

Every atlas entry must answer seven questions:

1. **Situation:** what is the user trying to do, and where does it become difficult?
2. **Failure:** what incorrect, unsafe, or confusing result appears without a deliberate contract?
3. **Ownership:** which layer owns the durable truth, projection, navigation, or transient interaction?
4. **Pattern:** what small set of boundaries and transitions prevents the failure?
5. **Anti-pattern:** what tempting implementation produces the failure?
6. **Proof:** which focused test demonstrates the invariant, race, retry, or recovery?
7. **Intervention:** which skill should inspect or implement the change?

## Content architecture

The atlas has four synchronized forms. Each has a different job.

### 1. Typed registry

`src/patterns/catalog.ts` is the canonical machine-readable index. It carries stable IDs, product situations, observable signals, decisions, anti-patterns, evidence requirements, executable-example IDs, and owning skills. Other tooling should import or serialize this registry instead of copying lists.

### 2. Executable references

`src/patterns/examples/` contains framework-light reference algorithms. They model the hard part of a behavior without pretending to be a drop-in application framework. Tests exercise the invariant and the failure mode side by side.

The first set covers:

- minimal and derived UI state;
- latest-intent wins for out-of-order reads;
- optimistic patch, exact rollback, and canonical reconciliation;
- versioned writes and idempotent replay;
- multi-tab invalidation and single-leader work;
- offline outbox replay and conflict states;
- realtime echo deduplication with client nonces;
- identity-scoped cache removal;
- authorization at object and tenant boundaries;
- webhook receipt verification and replay protection;
- background-job state machines;
- feature-flag enforcement on both presentation and authority paths;
- resumable upload checkpoints;
- collaborative checkpoint conflicts;
- rate-limit backoff and retry classification;
- compensation for multi-step partial failure.

### 3. Human reference

`skills/codebase-upgrade/references/pattern-atlas.md` explains when to choose each pattern, what to inspect, and what evidence to request. It is progressive disclosure: the root skill remains a short router, and specialists load only the relevant family.

### 4. Audit signals

The CLI performs a bounded, read-only scan and returns hypotheses with file evidence. It must never equate a dependency or directory name with correctness. A signal becomes:

- **preserve** when the repository shows the contract and relevant proof;
- **risk** when code evidence reveals a concrete unsafe or incorrect path;
- **opportunity** when the pattern may help but product priority still matters;
- **unknown** when static evidence cannot establish the answer.

Audit output carries atlas IDs so an agent can load the exact decision guide and example rather than inventing a generic refactor.

## Pattern families

| Family | Product situations | Primary owner |
| --- | --- | --- |
| State ownership | forms, filters, selections, totals, cross-page coordination | component, URL, Context, query cache |
| Async coordination | fast navigation, search, autosave, overlapping mutations | query client and typed command boundary |
| Durable consistency | two-device edits, retries, offline work, collaboration | service, transaction, repository |
| Identity and trust | login, logout, tenant access, roles, webhooks | verified session, policy service, database |
| Distributed UI | tabs, windows, realtime feeds, chat, presence | canonical server plus lossy coordination channel |
| Long-running work | imports, exports, media processing, background jobs | durable job state machine |
| Delivery controls | feature flags, migrations, compatibility, rollback | server authority and release contract |
| Product infrastructure | components, tokens, responsive behavior, accessibility | governed component system |
| Cross-platform architecture | shared product rules, platform ports, generated contracts, native projections | product kernel and native composition roots |
| Evidence | failure paths, races, security, compact layouts, release | tests and real browser or device proof |

## Pre-build feedback contract

Before implementation, the conductor produces a compact **Current system feedback** block:

- **Preserve:** the existing boundaries and behavior that already work.
- **Observed friction or risk:** exact source paths and the user-visible consequence.
- **Unknowns:** only facts that cannot be learned from the repository or current environment.
- **Selected pattern:** atlas ID, authority boundary, and the anti-pattern it replaces.
- **First proof:** the smallest behavioral test or reproduction that will fail before the change and pass after it.

If the user already authorized a specific outcome and no material product decision is missing, implementation continues after this feedback. Ask only when ownership, data lifetime, authorization, compatibility, or recovery behavior would change materially.

## Agent ergonomics

The system should reduce reasoning overhead rather than adding ceremonial steps.

- Route from a short skill description to one focused reference.
- Prefer concrete diagnostic questions over generic checklists.
- Show a working invariant and its failing counterpart.
- Make source evidence, confidence, and uncertainty explicit.
- Keep the registry stable enough for audit output, docs, and future UI to share IDs.
- Recommend one coherent vertical slice, not a repository-wide rewrite.
- Verify at the layer that owns the behavior, then prove one integrated journey.
- Record new reusable lessons in the atlas after retrospectives so the conductor improves without growing one giant prompt.

## Acceptance criteria

The atlas is useful when:

- an unfamiliar repository can be inspected before implementation;
- audit findings link to a specific pattern and responsible skill;
- at least one executable test demonstrates each implemented reference algorithm;
- the conductor reports what to preserve before recommending change;
- specialists share vocabulary without duplicating full instructions;
- installation ships the registry, examples, tests, docs, and skills;
- future patterns can be added without rewriting the conductor.

