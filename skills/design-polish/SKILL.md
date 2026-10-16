---
name: design-polish
description: Implement focused UI polish, interaction refinements, responsive spacing, overlay behavior, and visual-regression fixes from design evidence or QA findings. Use for product-surface refinement rather than broad design-system infrastructure.
---

# Design Polish

Use the screenshot, design node, recorded defect, or visual diff as evidence. Identify the source-of-truth component or token before editing.

Read [references/interaction-debugging.md](references/interaction-debugging.md) for overlay, animation, dense-layout, and visual-diff failure patterns.

## Working loop

1. Reproduce the exact state in the production component, including viewport, content density, interaction, and surrounding layout.
2. Compare against the current design source and repository conventions. Resolve meaningful ambiguity before inventing a visual rule.
3. Fix the narrowest owning boundary:
   - shared appearance belongs in semantic tokens or reusable components
   - domain rendering belongs in the feature component
   - state and persistence behavior belong outside presentational primitives
4. Add or update focused behavior and geometry tests when the bug is contract-like.
5. Inspect the running result across affected widths and interaction states.
6. Classify visual diffs as defect, stale baseline, environment difference, or intentional change. Accept new baselines only after inspecting them, then rerun without update mode.

## Interaction invariants

- Hover and focus affordances appear next to the object they affect and do not cause unrelated reflow.
- Menus, popovers, and dialogs anchor to their real trigger, remain inside the usable viewport, dismiss predictably, and preserve keyboard focus.
- Animated surfaces gate pointer and accessibility behavior consistently with their visible state.
- Icon glyph size and interaction-target size are separate decisions.
- Compact layouts protect meaningful text and actions before decorative whitespace.
- Loading, success, rollback, empty, error, and disabled states remain visually stable.

Use `design-system` when the correction changes reusable tokens, component variants, catalog metadata, or shared visual infrastructure. Use `responsive-design` for cross-width geometry work and `figma-to-app-feature` for a new or substantially redesigned experience.

Run focused component tests first, then targeted visual checks and a real-browser inspection. If the change lives in a dependent pull-request chain, fix the earliest owning branch and propagate forward rather than masking it later.
