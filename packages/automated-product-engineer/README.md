# Automated Product Engineer

Install a complete, local product-engineering reference system into an existing application:

```bash
pnpm dlx automated-product-engineer
```

[Explore the live reference site](https://automated-product-engineer-nextjs.vercel.app) · [View the package on npm](https://www.npmjs.com/package/automated-product-engineer) · [Read the source](https://github.com/kuck1/automated-product-engineer)

The zero-flag install detects Next.js, Expo, or bare React Native and includes 16 adaptive agent skills, agent adapters, platform-specific architecture guides, checklists, implementation templates, working web or native examples, Supabase patterns, testing and CI workflows, evidence capture, and retrospective fix-back material.

The reference kit is installed under `.automated-product-engineer/`; agent skills are also placed in the supported discovery locations. The host application does not import the reference directory at runtime.

In an interactive terminal, installation offers to analyze the codebase and lets you choose the domains to review. Run or refresh the repository onboarding later with:

```bash
pnpm dlx automated-product-engineer onboard
```

Onboarding creates team-owned current-practice, inconsistency, requirement, decision, upgrade, test, and retrospective documents plus a project-specific skill overlay. Reruns refresh static evidence without replacing accepted local decisions.

Audit an existing application before choosing an upgrade:

```bash
pnpm dlx automated-product-engineer audit
```

The audit is static and read-only. It returns a pre-build current-system feedback block, evidence-backed risks and opportunities, patterns to preserve, stable pattern-atlas IDs, related executable examples, the specialist skill for each concern, and a focused question only when a material decision remains. Add `--json` for agent-readable output.

The installed pattern atlas covers state ownership, stale requests, optimistic rollback, versioned and idempotent writes, offline outboxes, realtime echo, cross-tab leadership, identity-scoped caches, object and tenant authorization, webhooks, background jobs, resumable uploads, rate-limit backoff, compensated workflows, server-enforced flags, governed components, and evidence. Framework-light examples include focused tests and are reference material rather than runtime dependencies.

For Expo projects:

```bash
pnpm dlx automated-product-engineer doctor
pnpm dlx automated-product-engineer launch
```

`doctor` reports the detected router, scheme, native projects, development client, EAS setup, and capabilities. `launch` uses the project's package manager and selects development-client mode when present. Use `--ios`, `--android`, `--web`, `--tunnel`, or `--clear` only when needed.

See the [live reference application](https://automated-product-engineer-nextjs.vercel.app) for the interactive system and the [project repository](https://github.com/kuck1/automated-product-engineer) for complete documentation.
