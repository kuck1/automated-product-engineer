# Adaptive Layout Failure Patterns

## Derive the transition

For each content group, record its minimum readable width, fixed controls, flexible segments, shrink order, and acceptable alternate presentation. Reduce decorative gaps and flexible reserves before hiding or truncating meaningful information. Add a breakpoint only when the current structure stops fitting.

At that boundary redefine the complete state: rows, columns, width ownership, height, sticky offsets, scrolling, fades, and focus order. Incidental flex wrapping is not a responsive design.

## Frequent defects

- A wrapped toolbar keeps the old one-line height and clips controls.
- A compact control remains at an arbitrary partial width instead of owning its new row.
- A bottom navigation overlays the last reachable content because the scroll owner lacks safe-area clearance.
- A desktop inset shell remains under compact navigation, producing nested cards and wasted width.
- Text truncates while decorative gaps or a trailing reserve still consume space.
- Tabs wrap, ellipsize, or hide destinations without a deliberate navigation replacement.
- A board's intentional horizontal scroll escapes into the page and moves the app shell.
- A fade is attached to static chrome instead of the content crossing a scroll boundary.
- A dialog fits the width but exceeds the usable height and has no internal scroll.
- Narrowing and widening follow different states because measurements oscillate around the threshold.

## Container or viewport

Use a container query when the component's actual frame determines its presentation. Use a viewport query when the navigation shell or page composition owns the transition. Avoid JavaScript measurement for behavior CSS can express; when measurement is necessary, use one box model and prevent resize feedback loops.

## Continuous inspection

Test short, long, empty, and dense data. Drag from wide to compact and back through every threshold, then verify fixed representative dimensions. Check no accidental horizontal overflow, stable target sizes, preserved capabilities, logical reading order, complete corners, visible focus, overlay collision padding, and reachability of the final item.
