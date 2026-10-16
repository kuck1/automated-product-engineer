---
name: responsive-design
description: Audit and polish components and pages across compact, intermediate, and wide widths. Use when layouts wrap too early, flicker near breakpoints, waste space, crop content, overflow, shift height, or need a deliberate presentation change.
---

# Responsive Design

Design continuous transitions, not merely acceptable endpoint screenshots. Derive changes from the available container and content rather than presumed device labels.

## Geometry rules

- Compress decorative gaps, flexible gutters, and unused reserves before hiding or truncating meaningful content.
- Keep related controls aligned while their minimum readable widths fit. When they no longer fit, switch to an explicit layout state rather than incidental wrapping.
- Redefine rows, columns, width ownership, height, sticky offsets, clipping, fades, and scroll boundaries together when line count changes.
- Let a meaningful control group own its new compact row; do not strand it beside arbitrary whitespace.
- Keep fixed-format controls stable in height and separate icon glyph scale from touch-target geometry.
- Keep semantic metadata beside the content it describes and keep overflow summaries attached to the group they summarize.
- Give overlays their own viewport caps, collision padding, and internal scrolling.
- Allow horizontal scrolling only when the surface's interaction model requires it, and make hidden continuation discoverable.
- Ensure fixed navigation and safe areas do not cover the final reachable content.

Use container queries when behavior depends on a component's actual frame and viewport queries when the page shell owns the transition. Avoid measuring with inconsistent box models. Width-changing hover or focus behavior inside a wrapping group is a layout mutation and needs an explicit geometry contract.

## Working method

1. Render the production component with representative short, long, empty, and dense content.
2. Inspect continuously from compact to wide and back, pausing around every transition rather than checking only named breakpoints.
3. Identify minimum readable widths and explicit shrink priorities before adding a layout change.
4. Prefer a purpose-built compact presentation when a dense wide row cannot remain legible; preserve capability, order, and semantics across presentations.
5. Add geometry or behavior tests for stable invariants and targeted screenshots for meaningful states.
6. Run Playwright responsive coverage where useful, then manually drag the real browser in both directions to catch flicker, clipping, focus, overlay, and scroll defects automation may miss.

## Review checklist

- Narrowing and widening traverse the same states in reverse without flicker.
- Readable content is not truncated while usable space remains.
- Deliberate wrapped states have complete height and no stale offsets or blank inherited columns.
- The page has no accidental horizontal overflow.
- Dialogs, popovers, and the final scroll item remain fully reachable.
- Keyboard order, focus visibility, touch targets, and accessible names survive each presentation change.
- Visual snapshots match the production component and were inspected rather than blindly updated.
