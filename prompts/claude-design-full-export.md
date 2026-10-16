# Exact Claude Design export prompt

Copy the prompt below and replace every bracketed field with the best available product and repository context. Remove fields that truly do not apply; do not remove requested deliverables merely to shorten the handoff.

---

You are designing **[FEATURE NAME]** for **[PRODUCT / APP CONTEXT]**.

## Product objective

**Primary user:** [PRIMARY USER]

**Job to be done:** [USER JOB / OUTCOME]

**Feature behavior and business rules:**
[REQUIREMENTS, ELIGIBILITY, COPY, DATA DEFINITIONS, PERSISTENCE, PERMISSIONS, ANALYTICS, FEATURE-FLAG RULES, NAVIGATION, AND FAILURE BEHAVIOR]

**Known product decisions:**
[DECISIONS THAT ARE ALREADY FINAL]

**Questions that remain open:**
[UNRESOLVED PRODUCT DECISIONS. KEEP THESE EXPLICIT; DO NOT SILENTLY CHOOSE POLICY.]

## Existing application context

**Target framework:** [FOR EXAMPLE: NEXT.JS, REACT, TYPESCRIPT, TAILWIND]

**Existing design system and app primitives:**
[FONTS, SEMANTIC TOKENS, BUTTONS, DIALOGS, CARDS, CHARTS, ICONS, LAYOUTS, MOTION LIBRARY, OR LINKS TO SOURCE FILES]

**Existing routes, data model, analytics, and feature flags:**
[RELEVANT ROUTES, TYPES, ENDPOINTS, DATABASE FIELDS, EVENT HELPERS, AND FLAG NAMES]

**Reference material:**
[SCREENSHOTS, SOURCE FILES, PRIOR PROTOTYPES, BRAND REFERENCES, FIGMA LINKS, AND REQUIRED VIEWPORTS]

## Deliverable

Return one self-contained folder named `[feature-slug]-export`. It must work offline with no CDN fonts, remote images, or runtime network dependency. Reference code is a visual and interaction specification; the implementation team will adapt it to the production architecture.

Use this structure (add supporting files when necessary, but do not omit applicable items):

```text
[feature-slug]-export/
  HANDOFF.md
  README.html
  prototype/
    index.html
  components/
    FeatureName.tsx
    parts.tsx
    config.ts
    copy.ts
    index.ts
  copy/
    copy.json
    copy.md
  tokens/
    tokens.json
    tokens.css
    tailwind.preset.js
  assets/
    icons/*.svg
    images/*
  component-sheet/
    index.html
    desktop.png
    mobile.png
  frames/
    desktop/*.png
    desktop-2x/*.png
    mobile/*.png
    mobile-2x/*.png
  specs/
    frames.json
  source/
    [EDITABLE SOURCE FILES]
```

### 1. Handoff document

`HANDOFF.md` must be the implementation source of truth and include:

- the feature purpose, user, entry points, eligibility, and exit behavior;
- an exact data contract with typed examples and authoritative data ownership;
- all persistence, reminder, replay, routing, and failure-recovery rules;
- analytics events with trigger, properties, identifiers, and timing semantics;
- feature-flag behavior, including the required no-side-effect flag-off path;
- a state table covering first visit, repeat visit, replay, loading, empty, disabled, validation, success, recoverable error, and terminal error where applicable;
- desktop and mobile responsive behavior, overflow and wrapping rules, and minimum/maximum geometry;
- accessibility behavior: focus placement and return, tab order, keyboard support, Escape and outside-click policy, ARIA labels/roles/live regions, contrast, and at least 44px pointer targets;
- motion specifications: element, trigger, duration, easing, delay/stagger, interruption behavior, and `prefers-reduced-motion` fallback;
- acceptance criteria that can be tested;
- a clear list of open product decisions and what changes for each answer;
- a file map explaining what is authoritative versus illustrative.

### 2. Exact copy and configuration

Put every user-visible string in both `copy/copy.json` and readable `copy/copy.md`. Preserve punctuation, capitalization, emphasis spans, and line-break intent. Do not bury important copy inside JSX.

Put thresholds, steps, options, limits, tier definitions, dates, and other product configuration in typed configuration files. Identify which values must ultimately come from server settings rather than remain client constants.

### 3. Tokens and design-system mapping

Provide semantic tokens in DTCG-compatible `tokens/tokens.json`, matching CSS variables, and a Tailwind preset or mapping. Include colors, typography, spacing, radii, borders, shadows, chart colors, and motion values used by the feature. Name tokens by meaning rather than raw color. Also state which existing app tokens/components should be reused and which new semantic tokens are required.

### 4. Interactive prototype

`prototype/index.html` must be a polished, dependency-free prototype of the complete experience. Make every meaningful state reproducible through documented URL query parameters, for example `?step=2&mode=replay&status=error`. Include controls for boundary data values when they materially affect layout.

The prototype must demonstrate:

- all steps and transitions;
- desktop and mobile responsive behavior;
- loading, empty, disabled, success, validation, and failure states that can occur;
- dismissal, Escape, outside-click, back, retry, replay, and completion behavior;
- intended animation plus reduced-motion behavior;
- long copy, large numbers, zero values, and other layout boundaries.

`README.html` should index the prototype, source material, component sheet, frames, copy, tokens, data contract, and state controls.

### 5. Typed reference components

Provide dependency-light React + TypeScript + Tailwind reference components with exported prop types and callbacks. Separate reusable visual parts, copy, and configuration. Include accessibility attributes and stable test hooks only where semantic queries are insufficient.

Do not imitate the production backend or introduce a parallel app architecture. Use props/adapters for server data, persistence, analytics, feature flags, and navigation. Comment only where a behavior is easy to misinterpret.

### 6. Canonical reference frames

Export pixel-accurate PNGs for every meaningful state at the specified desktop and mobile viewports, at both 1x and 2x. Include edge states that change geometry or copy. These images are the visual source of truth.

Create `specs/frames.json` with one record per frame containing at least:

```json
{
  "id": "stable-state-id",
  "file": "frames/desktop/example.png",
  "viewport": { "width": 1440, "height": 1000, "deviceScaleFactor": 1 },
  "prototypePath": "prototype/index.html?step=1&mode=first-time",
  "state": { "step": 1, "mode": "first-time" },
  "expectedRegion": { "x": 0, "y": 0, "width": 1440, "height": 1000 },
  "notes": "What this frame proves"
}
```

Use stable IDs and deterministic data so the implementation team can automate screenshot overlays and visual regression tests.

### 7. Component sheet and local assets

Provide a component sheet showing every reusable part and state: default, hover, focus-visible, pressed, disabled, loading, success, warning, error, selected, and responsive variants as applicable. Export local SVG icons and any required image assets. Do not replace established product icons with emoji or platform-dependent glyphs.

### 8. Design quality bar

Make concrete design decisions, with hierarchy, spacing, typography, state contrast, and motion that fit the product. Reuse the existing system where it is known. Do not add ornamental UI that lacks a user purpose. Keep dialog or panel geometry stable across sequential steps unless a documented content requirement makes that impossible.

Before delivery, verify that:

- every canonical frame can be reproduced from its `prototypePath`;
- copy, tokens, component examples, prototype, and screenshots agree;
- desktop and mobile frames contain no clipping or accidental overflow;
- focus and reduced-motion behavior are documented and demonstrated;
- every asynchronous action has loading, success, and recoverable failure behavior;
- open product questions are explicit rather than hidden in the mockup;
- the folder contains no broken or remote dependencies.

Deliver the complete folder and finish with a short inventory of files, deterministic preview commands/paths, authoritative decisions, and remaining open questions.

---
