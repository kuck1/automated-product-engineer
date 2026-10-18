# Tokens, components, and shared UI

## Token pipeline

Use one DTCG-compatible JSON source with primitive, semantic, and component scopes. Product code consumes semantic or component roles. A deterministic compiler resolves aliases, validates types and cycles, normalizes names, emits Kotlin, Swift, and CSS, and records the canonical source digest. CI regenerates into a temporary directory and fails on drift.

Generated values remain platform-neutral primitives. Native mapping layers create Compose colors, dimensions, shapes, typography, motion, and SwiftUI equivalents. System-provided semantic colors, text styles, accessibility contrast, and dynamic type can remain platform values when exact cross-platform equality would reduce usability.

## Component contract

Each cross-platform component contract records:

- purpose and product meaning;
- typed variants and default;
- loading, empty, error, disabled, selected, focus, pressed, and destructive states;
- content constraints and localization pressure;
- semantic token roles;
- accessibility name, value, role, action, and focus order;
- keyboard, pointer, touch, and assistive interactions;
- adaptive and reduced-motion behavior;
- platform-specific allowed differences;
- scenario IDs and screenshots or previews.

Generate documentation and test fixtures from the contract when useful; do not generate complex widget code blindly. Native libraries implement the contract and link back to its version.

## Shared UI decision

Compose Multiplatform is appropriate for a feature when synchronized behavior and branded presentation dominate platform divergence, required native integrations have proven adapters, accessibility and performance are measured on both platforms, and ownership is clear. Keep native wrappers around shared surfaces so platform navigation and capability presentation stay idiomatic. Reassess the decision per feature rather than once for the whole company.
