# Design-System Extension Playbook

## Promote the right thing

Start from a production need. Promote a value or component when several consumers share the same semantic responsibility or a near-term product plan requires one stable contract. Keep one-off layout and domain behavior in the feature.

Classify the addition:

- **Foundation:** semantic color, typography, spacing, radius, border, shadow, motion, breakpoint.
- **Primitive:** accessible control with explicit states and typed variants.
- **Pattern:** repeatable composition with stable geometry and interaction.
- **Composite:** reusable domain-neutral surface whose data and commands come from callers.

## Token-to-component pipeline

1. Map design values to semantic roles; retain raw values only in the foundation layer.
2. Expose typed enums or discriminated variants rather than arbitrary class strings.
3. Keep part-level customization constrained through typed slots or render hooks.
4. Render the production component in the catalog; do not rebuild preview-only markup.
5. Derive editor controls and inspector metadata from the production API when possible.
6. Register deterministic states with stable IDs so deep links and screenshots do not churn.

```ts
const badgeTone = {
  neutral: "bg-surface-muted text-text-secondary",
  success: "bg-status-success-subtle text-status-success",
  warning: "bg-status-warning-subtle text-status-warning",
} satisfies Record<BadgeTone, string>;
```

Consumers select `tone="warning"`; they do not send raw utility classes into the primitive.

## Preview and inspector contract

- Default, hover, focus, pressed, selected, disabled, loading, error, dense, and responsive states are explicit when meaningful.
- Preview fixtures use fixed content, time, fonts, dimensions, and data.
- Preview wrappers do not change layout participation or measurements.
- Inspectable child parts expose only safe editable properties.
- Live responsive previews change the actual viewport or container rather than scaling an image of the wide component.
- Development tools and inspectors are inaccessible in production unless deliberately authorized.

## Migration sequence

Prefer foundations, primitives, patterns, additive consumer adoption, and old-path removal in that order. Keep compatibility aliases only while known consumers migrate. For a large replacement, isolate visual baseline changes from behavior or data changes so reviewers can reason about each.

## Visual baselines

Capture the smallest useful surface plus page-level compositions only where interactions between components matter. If a screenshot changes:

1. inspect the rendered diff;
2. classify it as defect, intentional change, stale fixture, font/platform variation, or infrastructure flake;
3. correct the owner or approve the intended design;
4. update the baseline once;
5. rerun normally without update mode.

Never loosen thresholds or accept snapshots solely to produce a green check.
