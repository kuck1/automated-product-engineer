# Design Artifact and State Contract

Use this reference when the design source is incomplete, when the feature has several state owners, or when visual fidelity depends on evidence beyond one screenshot.

## Audit the handoff

Inventory what exists before requesting more:

- target frames and stable node identifiers;
- desktop, transition, and narrow layouts;
- default, hover, focus, pressed, selected, disabled, loading, empty, validation, success, warning, recoverable-error, permission, and destructive states that apply;
- long copy, wrapping, truncation, dense data, multiple rows, menus, drawers, dialogs, toasts, and overflow pressure;
- component instances and variants, semantic variables, typography, spacing, radius, border, shadow, opacity, constraints, and auto-layout behavior;
- vector or bitmap assets, exact copy, interaction notes, prototype transitions, motion, and accessibility intent;
- full-page and overlay-in-context references rather than isolated crops alone.

Ask the designer or product owner only for missing artifacts or decisions that change behavior or implementation. A useful request names the affected frame or state, explains the observed gap, states the decision needed, and describes the deliverable that will close it.

## Establish precedence

Write down which source wins for each kind of truth. A common contract is: approved images for visual geometry, product or handoff notes for behavior and data, the target repository for architecture and security, and explicit later decisions over older annotations. Record conflicts and their resolution.

Classify every stateful value before coding:

- local UI state for open surfaces, drafts, selection, measurement, and animation;
- URL state for shareable search, filters, sort, tabs, and result-affecting views;
- server-cache state for fetched records, pages, optimistic snapshots, rollback, and reconciliation;
- durable state for preferences, saved views, assignments, and values that survive refresh or affect other users;
- external authority for values owned by another service.

When browser storage restores convenience state, keep the first render hydration-safe and never let it override an explicit URL or durable server default. Distinguish **clear** from **reset**: clear removes current working criteria without immediately reapplying a default, while reset intentionally restores the active default.

## Derive implementation and tests

Map the page shell, feature hooks, domain components, reusable design-system pieces, transport, domain policy, and persistence adapter before broad implementation. Extract a shared primitive only when the design represents a reusable semantic role or an observed extension axis.

Choose tests at the narrowest useful boundary:

- token or primitive changes: contract tests plus focused visual states;
- hook and precedence changes: pure state matrices, including first render, URL changes, clear, reset, storage restoration, and back/forward navigation;
- API or persistence changes: validation, authorization, transitions, concurrency, migrations, and negative ownership cases;
- optimistic mutations: success, rollback, stale response protection, invalidation, and fast navigation or filter changes;
- complete flows: browser coverage for the primary path and a material failure, empty, or permission path.

Use deterministic fixtures for dates, counts, names, content length, and selected states. Inspect screenshot diffs before changing baselines; never loosen thresholds to conceal a real contract change.
