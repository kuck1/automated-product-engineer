# Interaction and Visual Debugging

## Reproduce the geometry

Match viewport, container width, content length, data density, font loading, zoom, scroll position, interaction state, and surrounding shell before editing CSS. A screenshot mismatch caused by fixture or environment drift is not a styling defect.

Use browser measurements to identify the owning box: content box, padding, border, gap, containing block, scroll boundary, and portal root. Do not compare content-box measurements with border-box dimensions in a resize loop.

## Common interaction failures

- **Menu closes and reopens:** outside-pointer handling excludes the trigger. Treat trigger and surface as one safe interaction zone.
- **Popover is clipped:** it is rendered inside an overflow owner that should not own overlays. Portal it or change the correct clipping boundary.
- **Row jumps on hover:** the affordance changes width inside a wrapping group. Reserve external geometry or use a stable overlay.
- **Invisible element intercepts clicks:** animation hid pixels but not pointer or accessibility state. Coordinate transform, opacity, `pointer-events`, `aria-hidden`, and focusability.
- **Dialog content is unreachable:** the overlay lacks a usable-height cap and internal scroll owner.
- **Icon looks wrong after enlarging a control:** glyph size and interaction target were coupled.
- **Toast covers the next action:** notification placement ignores the active flow's safe area and responsive controls.

## Stable visual feedback

Communicate the changed state at the object that changed. Preserve row height, action alignment, and nearby reading order. Use semantic tokens and the established motion curve. Respect reduced motion and keep loading, success, rollback, and error geometry stable.

## Fix and prove

Fix the narrowest owner, add a behavior or geometry assertion when the rule is durable, inspect adjacent states and widths, then run the targeted visual comparison. Accept a new baseline only after the behavior is approved and the normal non-update run passes.
