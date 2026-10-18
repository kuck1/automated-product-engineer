---
name: codebase-upgrade
description: Inspect an existing web, Expo, or React Native codebase, preserve strong patterns, identify high-confidence risks and upgrade opportunities, connect each recommendation to a working example and owning specialist skill, and ask the user which evidence-backed upgrade to pursue before changing architecture.
---

# Codebase Upgrade

Use this skill when the user asks what should improve, whether the current setup is sound, how to modernize an existing application, or which patterns from the reference system apply to their codebase.

Use `codebase-onboarding` instead when first adopting the toolkit or when the repository needs a complete baseline, documentation reconciliation, project-specific skill overlay, and multi-stage upgrade program. Return here for a focused domain review or one selected modernization slice.

Read [references/audit-and-upgrade-workflow.md](references/audit-and-upgrade-workflow.md) for the inspection, recommendation, decision, implementation, and re-audit sequence. Read [references/pattern-atlas.md](references/pattern-atlas.md) for the relevant product situation, target contract, proof, and owning skill. Use [references/pattern-and-antipattern-catalog.md](references/pattern-and-antipattern-catalog.md) for the original cross-cutting principles and case-study evidence.

## Start with local evidence

Run `pnpm dlx automated-product-engineer audit --json` when the installed CLI is available. Otherwise inspect the same evidence directly: repository instructions, package and runtime configuration, routes, state owners, client cache, services, repositories, schema and policies, auth/session clients, design-system layers, tests, CI, and native configuration.

The command is a static, read-only first pass. It does not execute application source. Validate every reported signal against its callers and tests before presenting it as a recommendation.

## Build an upgrade brief

Separate findings into:

- **preserve:** a working pattern whose contract should remain intact;
- **risk:** a concrete, high-confidence failure or security path with observed evidence;
- **opportunity:** a useful improvement whose value depends on product priorities or usage;
- **unknown:** a material fact the code cannot answer.

For each proposed upgrade, name the user or operator pain, current evidence, owning boundary, target pattern, anti-pattern being removed, working reference, responsible skill, implementation size, risk, acceptance evidence, and rollback. Never turn directory names, file size, or dependency presence alone into a refactor mandate.

Before changing code, return a compact **Current system feedback** block with: strong behavior to preserve; exact observed friction or risk; material unknowns; selected atlas ID and authority boundary; and the first focused proof. If the user already authorized the outcome and no decision changes product behavior, data lifetime, authorization, compatibility, or recovery, continue after the feedback without asking again.

## Ask for the decision that matters

After the inspection is complete, recommend no more than three ordered options. Ask the user which upgrade to pursue, or ask one focused product question when the answer changes authority, persistence, security, or migration behavior. Include a recommended option and explain the product effect. Do not ask the user for facts the repository already contains.

If the user already authorized a specific upgrade, proceed without asking again. If a critical credential or authorization risk is verified, say so directly and recommend addressing it first.

## Route implementation to the owner

- `architecture-building`: ownership, boundaries, extension seams, and reviewable decomposition.
- `frontend-api-db`: query cache, mutations, concurrency, idempotency, persistence, and Supabase.
- `security-review`: identity, authorization, secrets, RLS, cookies, and sensitive data.
- `expo-native-app`: lifecycle, deep links, permissions, offline work, builds, and updates.
- `ios-native-app`: SwiftUI or UIKit ownership, Swift concurrency, AuthenticationServices, Keychain, persistence, Apple capabilities, Xcode testing, signing, privacy, and distribution.
- `design-system`: semantic tokens, governed components, variants, previews, and migration.
- `responsive-design` and `design-polish`: adaptive geometry and final interaction quality.
- `manual-ui-qa`, `code-review`, and `pr-workflow`: evidence, regression review, and delivery.

Implement one coherent vertical slice at a time. Preserve strong existing patterns, add focused failure coverage, run the relevant real-browser or native proof, then rerun the audit and record what changed, what remains, and the next trigger.
