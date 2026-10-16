# Claude Design: Implementation-Ready Export Prompt

Replace the bracketed fields and attach the relevant screenshots or Figma frames.

---

Design **[FEATURE]** for **[PRODUCT]**.

**User and goal:** [WHO USES IT AND WHAT THEY MUST ACCOMPLISH]

**Required behavior:** [ENTRY POINT, ACTIONS, RULES, PERMISSIONS, SAVED STATE, NAVIGATION, AND FAILURE RECOVERY]

**Application context:** Next.js, React, TypeScript, and **[STYLING / COMPONENT SYSTEM]**. Reuse the existing design system where possible. Do not invent a parallel backend or component library.

Return one self-contained folder containing:

1. `HANDOFF.md` with user stories, exact behavior, data ownership, API needs, persistence, permissions, analytics, responsive rules, accessibility, acceptance criteria, and open decisions.
2. `prototype.html`: polished dependency-free HTML/CSS/JS that works offline and can reproduce every meaningful state through documented URL parameters or controls.
3. `tokens.json` and `tokens.css`: semantic colors, typography, spacing, radius, border, shadow, and motion values, with mappings to existing application tokens.
4. Typed React reference components with exported props and callbacks. Keep copy and configuration separate. Pass server data, mutations, analytics, flags, and navigation through adapters.
5. Exact copy in JSON and Markdown, preserving punctuation, emphasis, and paragraph breaks.
6. Default, hover, focus, pressed, selected, disabled, loading, empty, validation, success, warning, recoverable error, long-content, and permission states where relevant.
7. Exact desktop and mobile PNG references plus `frames.json` recording viewport, state, prototype URL, and what each frame proves.
8. A component sheet showing every reusable part and state.
9. Local SVG/image assets with no CDN, remote font, or runtime network dependency.
10. Typed request/response examples, authoritative data owner, idempotency behavior, and persistence requirements.
11. Interaction rules for selection, filters, pagination, optimistic updates, rollback, cache invalidation, back/reset, keyboard, focus return, Escape, outside click, and reduced motion.
12. A file map separating authoritative contracts from illustrative code.

Use deterministic fixture data. Show overflow, wrapping, zero/large values, slow loading, and request failure. Keep geometry stable across steps unless content requires otherwise. List unresolved product decisions explicitly.

Before delivery, verify that the HTML reproduces every reference frame, desktop and mobile layouts do not clip, every asynchronous action can recover, copy/tokens/components/screenshots agree, and the package works offline.

Finish with a file inventory, preview instructions, final decisions, and open questions.
