# Codebase Audit and Upgrades

The toolkit can inspect an existing web, Expo, React Native, native iOS, native Android, or Kotlin Multiplatform repository before recommending new architecture:

```bash
pnpm dlx automated-product-engineer audit
```

Use `--json` when an agent should consume the report. The audit reads bounded source and documentation files, package metadata, and native configuration without executing application modules. It reports high-confidence risks separately from upgrade opportunities and patterns worth preserving.

The report is deliberately not an automatic refactor plan. A package name or keyword is only a signal. The `codebase-upgrade` skill validates each signal against callers, data flow, policy, tests, and real behavior; connects it to the relevant stable ID in the [product engineering pattern atlas](pattern-atlas.md), anti-pattern, executable example, and specialist skill; then prepares up to three reviewable options. It reports current-system feedback before implementation and asks the user only when a material product, authority, persistence, compatibility, or recovery decision remains unresolved.

Typical review paths include:

- remote state duplicated across components instead of one query-cache owner;
- route handlers that mix transport, authorization, product policy, and persistence;
- writes with no revision, ETag, idempotency key, or conflict recovery;
- offline work that looks successful before server confirmation;
- Supabase sessions, keys, RLS, and tenant boundaries;
- repeated UI without semantic tokens, typed variants, onboarding, or real-state previews;
- responsive rails, boards, tabs, and overlays whose geometry fails under content pressure;
- tests that do not match the layer that owns the rule.
- cross-platform rules duplicated in native shells, platform APIs leaking into `commonMain`, generated token or scenario drift, and unstable Swift-facing KMP surfaces.
- Next.js, Android, and iOS implementations without a versioned feature capsule, generated Kotlin and TypeScript policy, semantic receipt comparison, or sibling platform lanes.

For a three-platform repository, adopt the parallel model one feature at a time: characterize accepted behavior as shared vectors, generate both semantic runtimes, preserve native UI and capability ownership, and enable the convergence gate before expanding the migration.

After an upgrade, rerun the audit and the workflow's focused proof. The useful output is the changed contract and evidence, not a higher abstract score.
