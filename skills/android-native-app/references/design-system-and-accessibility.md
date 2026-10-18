# Android design system and accessibility

## Onboard the existing system

Inventory Material theme setup, color schemes, typography, shapes, elevation, spacing, icons, motion, window insets, legacy XML themes, custom views, preview/sample catalog, and accessibility conventions. Map product semantics to Android roles before adding values. Keep raw values private to the theme and expose names such as `surfaceRaised`, `contentCritical`, or `spaceControlGap` only when they encode real product meaning.

The component library is a product interface for the engineering team. Each component needs purpose, anatomy, variants, states, content rules, accessibility behavior, adaptive behavior, examples, and migration guidance. This turns repeated visual decisions into a governed contract, keeps Compose and Views consistent during migration, and lets product work start from intent.

## Compose boundary

Build stateless content composables first and thin route composables that collect state and connect callbacks. Use Material components and semantics unless the product requires a deliberate alternative. Do not pass ViewModels, repositories, or NavController into leaf components.

Provide previews for representative light/dark, font scale, narrow/wide, long content, RTL, loading, empty, error, disabled, and selected states. Previews are documentation; they do not replace device tests.

## Adaptive behavior

Design from available window size, posture, input, content pressure, and task priority. Support compact, medium, and expanded widths; split screen, resize, rotation, keyboard, and foldable posture can change while the activity remains alive. Keep lists, details, dialogs, and navigation coherent as panes appear or collapse.

Use edge-to-edge deliberately, consume insets at the correct owner, and verify gesture navigation plus display cutouts. Do not encode phone/tablet behavior from a model name or physical screen alone.

## Accessibility

- Use semantic headings, roles, state descriptions, traversal order, pane titles, live regions, and custom actions only when native semantics are insufficient.
- Keep touch targets, contrast, focus indicators, keyboard/D-pad paths, switch access, and TalkBack order usable.
- Respect system font scale and avoid clipping at 200%; use scalable text and content-driven layouts.
- Respect reduced motion and avoid motion that is the only explanation of state change.
- Localize visible strings, content descriptions, plurals, dates, numbers, and bidirectional content.
- Merge semantics only when the merged announcement remains meaningful; do not silence useful descendants for screenshot cleanliness.

Run automated accessibility checks, then use TalkBack and keyboard or switch-equivalent input on the critical journey. Record defects against the owning component so fixes propagate.
