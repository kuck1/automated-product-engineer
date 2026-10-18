# How to Use the Automated Product Engineer

This kit helps a product engineering team turn a product idea, Figma design, screenshot, or Claude Design concept into a production feature that fits the existing application. It provides two connected workflows: requesting a complete design handoff and implementing that handoff safely in the target application.

The key rule is simple: **design tools define intent, states, and visual references; the application codebase and target runtime define production architecture.** HTML and React supplied by a design tool are reference material. Reuse the app's components, tokens, data access, authorization, analytics, navigation, lifecycle, and testing conventions instead of pasting a parallel implementation into the repository.

For Expo or React Native, read `project-profile.json` and load `expo-native-app`. Establish whether the work runs in Expo Go, a development build, a preview build, or a store build before implementation. Verify iOS and Android behavior in their actual runtimes; a responsive browser view is useful additional coverage but is not native evidence.

When the request is to improve an existing codebase rather than build a named feature, run `pnpm dlx automated-product-engineer audit --json` and load `codebase-upgrade`. Validate its static signals against the relevant code path, connect confirmed findings to the pattern catalog and working examples, and prepare up to three product-sized upgrade options. Ask the user which outcome matters most before changing a broad boundary.

## 1. Prepare the product brief

Before asking Claude or working from Figma, write down the minimum product contract:

- Who is using the feature and what outcome do they need?
- Where does the experience begin and where should it end?
- What actions, rules, permissions, and failure cases matter?
- What information comes from the server, and what must be saved?
- What is already decided, and which choices are still open?
- Which existing application screen or component is the closest reference?

Include exact copy when it is already approved. Attach full-page and component-level Figma frames, screenshots, and interaction notes. Show desktop and narrow layouts, overlays, dense content, empty states, errors, and long-text cases. One polished screenshot rarely defines enough behavior to build a durable feature.

## 2. Let the skill complete the intake

Invoke `automated-product-engineer` for end-to-end delivery, `claude-design-to-app` or `figma-to-app-feature` for design-led work, or a focused specialist for one boundary. The skill first inspects the conversation, repository, available design source, current branch or pull request, and existing tests. It fills in implementation context itself instead of asking the user to restate facts already present in the codebase.

When a missing product decision would materially change behavior, persistence, permissions, responsive rules, or acceptance criteria, the skill asks one to three focused questions. If the missing input must come from Claude Design, Figma, a product owner, or another teammate, it generates a single copy-ready request with known context already filled in, the exact missing decisions or artifacts, and the expected output. There is no separate prompt catalog to browse.

The request deliberately asks Claude for more than a picture. A useful handoff includes:

- dependency-free HTML that demonstrates the full interaction;
- semantic design tokens in JSON and CSS;
- typed React reference components with props and callbacks;
- exact copy and product configuration outside the JSX;
- local SVG and image assets;
- a data and API contract;
- a table of all states and transitions;
- desktop and mobile reference images;
- deterministic controls that reproduce every meaningful state;
- explicit open decisions instead of silent assumptions.

The generated request asks Claude to map proposed components and tokens to the application's existing system. The result should explain what is new and what should be reused. Claude should not invent a backend, database, authentication model, or second component library.

## 3. Audit the handoff before coding

Read the export in this order: handoff, exact copy, configuration, tokens, HTML prototype, typed components, frame manifest, screenshots, and assets. Open the HTML at several desktop and mobile states.

Build a short mapping from the export to the application:

| Handoff concern | Application owner |
| --- | --- |
| Visual primitive | Existing design-system component or justified addition |
| Color, spacing, type, motion | Existing semantic token or justified new token |
| Page composition | Feature component and route surface |
| Interaction state | Focused React hook or local component state |
| Server data | Query, service, and typed DTO |
| Durable state | Database model and authorized mutation |
| Analytics | Existing PostHog helper and event convention |
| Canonical design state | Deterministic fixture and visual test |

Record conflicts between the prose, HTML, React sample, and screenshots. Treat approved screenshots as the visual target and the handoff as the behavior and data contract unless the package explicitly says otherwise. Resolve product-policy questions before they become code.

## 4. Build the visual contract first

Use `checklists/design-to-app.md` to inventory the design into tokens, primitives, composed components, domain components, and the page shell. Search the existing app before creating anything new.

Build the stable visual skeleton with deterministic fixture data. Cover the states that materially alter geometry or meaning: loading, empty, error, selected, open, disabled, long content, and narrow viewport. Use files `20` through `24` to map tokens, component states, responsive behavior, and polish to application conventions.

Get product sign-off on the composition before spending heavily on broad tests or snapshot updates. A stale screenshot baseline is diagnostic evidence; it should not override a newly approved design.

## 5. Add behavior through clear boundaries

Use files `30` through `33` to decide where every responsibility belongs. Keep one orchestration concern per hook where practical: selection, filters, pagination, saved views, submission, or a mutation lifecycle. Keep API routes thin. Put ownership, authorization, query shape, transactions, idempotency, and domain rules in server services. Persist state only when it must survive a refresh, device, or session.

Connect the UI to real data through typed contracts. Every asynchronous action needs a loading state, success result, recoverable error, retry path, and protection against stale responses. Optimistic updates need rollback and cache reconciliation. Feature flags must gate every relevant entry point and endpoint without changing unrelated behavior when disabled.

## 6. Verify in increasing scope

Use `checklists/integration.md` to test transitions and data behavior at the smallest responsible seam. Verify API validation, authorization, idempotency, and response shape. Then compare deterministic desktop and mobile states with the approved references.

Once behavior and visuals are stable, run typecheck, lint, focused units, visual tests, relevant end-to-end flows, and required repository gates. Use the manual QA section of `checklists/integration.md` for a real browser workout that covers keyboard use, back/reset paths, retries, refresh persistence, narrow layouts, console errors, and network failures. Finish with a focused code review and resolve actionable feedback in a batch.

## 7. Package the handoff

The pull request should explain the user problem, resulting behavior, architecture and data ownership, feature flags, analytics, screenshots, and exact validation. Document approved deviations from the design and any unresolved external blocker. Preserve a concise feature guide so the next teammate can understand the states, components, hooks, APIs, persistence, and tests without reconstructing the feature from Git history.
