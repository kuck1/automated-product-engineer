# Automated Product Engineer

Install a complete, local product-engineering reference system into an existing application:

```bash
pnpm dlx automated-product-engineer
```

[Explore the live reference site](https://automated-product-engineer-nextjs.vercel.app) · [View the package on npm](https://www.npmjs.com/package/automated-product-engineer) · [Read the source](https://github.com/kuck1/automated-product-engineer)

The zero-flag install detects Next.js, Expo, or bare React Native and includes 15 adaptive agent skills, agent adapters, platform-specific architecture guides, checklists, implementation templates, working web or native examples, Supabase patterns, testing and CI workflows, evidence capture, and retrospective fix-back material.

The reference kit is installed under `.automated-product-engineer/`; agent skills are also placed in the supported discovery locations. The host application does not import the reference directory at runtime.

Audit an existing application before choosing an upgrade:

```bash
pnpm dlx automated-product-engineer audit
```

The audit is static and read-only. It returns evidence-backed risks, opportunities, patterns to preserve, related working examples, the specialist skill for each concern, and a focused question for the user. Add `--json` for agent-readable output.

For Expo projects:

```bash
pnpm dlx automated-product-engineer doctor
pnpm dlx automated-product-engineer launch
```

`doctor` reports the detected router, scheme, native projects, development client, EAS setup, and capabilities. `launch` uses the project's package manager and selects development-client mode when present. Use `--ios`, `--android`, `--web`, `--tunnel`, or `--clear` only when needed.

See the [live reference application](https://automated-product-engineer-nextjs.vercel.app) for the interactive system and the [project repository](https://github.com/kuck1/automated-product-engineer) for complete documentation.
