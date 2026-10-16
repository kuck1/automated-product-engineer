# Figma Source Audit Prompt

Inspect the supplied Figma frames before writing code.

Return:

1. A frame inventory grouped by route, viewport, state, and interaction.
2. The reusable components, variants, and semantic tokens already present.
3. Missing states: loading, empty, error, disabled, success, overflow, long copy, and narrow layouts.
4. Ambiguous product decisions that must remain explicit.
5. A proposed component hierarchy and state-ownership map.
6. A short implementation contract separating visual facts from inferred behavior.

Do not invent backend behavior from visual clues. Call out every inference and cite the frame or component that supports each visual decision.
