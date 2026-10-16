# Design System Blueprint

This blueprint describes a design system that can support both human product teams and coding agents. It separates raw values, semantic meaning, component recipes, product composition, and application state so visual changes remain predictable and business logic remains testable.

## System layers

```text
Foundations
  raw scales -> semantic tokens -> themes

Reusable UI
  primitives -> atoms -> molecules -> composed components

Product UI
  feature components -> page sections -> routes

Behavior
  local state -> controllers/hooks -> query/mutation adapters

Authority
  route handlers -> services -> database/providers
```

Each layer may depend on layers above it in the diagram, never on product-specific layers below it. A button can depend on semantic tokens; it cannot depend on candidate data, routing, or a mutation hook.

## Token architecture

Use four explicit token levels.

### 1. Raw scales

Raw values describe the available palette and measurement system without product meaning:

- neutral and brand color scales;
- spacing and sizing scales;
- font families, weights, sizes, and line heights;
- radii, border widths, shadows, opacity, and z-index;
- motion duration and easing.

Raw tokens are implementation details. Product components should rarely reference them directly.

### 2. Semantic tokens

Semantic tokens describe intent:

- `surface.default`, `surface.raised`, `surface.subtle`;
- `text.primary`, `text.secondary`, `text.disabled`, `text.inverse`;
- `border.default`, `border.strong`, `border.focus`;
- `action.primary`, `action.primaryHover`, `action.disabled`;
- `feedback.success`, `feedback.warning`, `feedback.danger`.

Themes map semantic names to raw values. Light, dark, high-contrast, and brand variants should preserve the semantic contract.

### 3. Component tokens

Component tokens describe stable visual parts such as `button.height.md`, `dialog.radius`, or `pill.paddingX`. Add these when a component has a meaningful recipe shared across variants. Do not create a token for every CSS declaration.

### 4. Product aliases

Use product aliases sparingly for durable product language, such as a pipeline status color. Aliases map to semantic or component tokens and should not embed one page's temporary styling.

Keep a machine-readable source, generated CSS variables, and a typed TypeScript map synchronized. Prefer DTCG-compatible JSON as the portable source. Validate names, references, and duplicate raw values in CI.

## Component hierarchy

Use responsibility, not size, to classify components.

### Primitives

Unstyled or lightly styled interaction and accessibility foundations: focus management, portal, dismissable layer, tooltip behavior, and keyboard navigation. Prefer established libraries where they fit.

### Atoms

Single-purpose visual controls and indicators: button, input, checkbox, badge, avatar, icon button, spinner, and status dot. Atoms own accessibility and visual variants but no domain data.

### Molecules

Small reusable combinations with one responsibility: search field, labeled control, person identity block, metadata pair, pagination control, or empty-state card.

### Composed components

Reusable structures with slots and documented states: table shell, filter toolbar, modal shell, side panel, command row, or card collection. They expose typed data and callbacks but remain domain-neutral where possible.

### Feature components

Domain rendering for a specific workflow. They translate product data into reusable components and receive commands from a controller or hook.

### Page sections and routes

Composition and entry boundaries. They choose server/client rendering, obtain initial data, apply access rules, and connect feature controllers. They should read like an outline of the page.

## Enum-driven variants

Use closed unions or enums for supported visual decisions:

```ts
type ButtonTone = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";
type ControlState = "default" | "loading" | "success" | "warning" | "error";
```

Map variants to class recipes in one place. Product code selects a supported meaning instead of assembling arbitrary classes. Use booleans only for truly independent binary behavior. If flags can create invalid combinations, replace them with a discriminated union.

Variants should cover visual responsibility. Data loading, authorization, and workflow state belong in feature controllers and domain types, not the design-system component.

## Slots and composition

Prefer explicit slots over deeply configurable mega-components:

```tsx
<Panel>
  <Panel.Header title="Review" action={<IconButton />} />
  <Panel.Body>{children}</Panel.Body>
  <Panel.Footer>{actions}</Panel.Footer>
</Panel>
```

Slots keep layout stable while allowing product content to vary. Avoid passing dozens of unrelated props that encode an entire page inside a reusable component.

## Decoupled state

Use a view/controller split for stateful product UI:

- **View:** typed data, status, and callbacks; no fetching or persistence.
- **Controller hook:** transitions, selection, optimistic state, query and mutation coordination.
- **Adapter:** maps API DTOs and errors into controller inputs.
- **Server service:** authorization, transactions, idempotency, query shape, and persistence.

The view can render in Storybook, a workbench, screenshot fixtures, and unit tests without a backend. The controller can be tested without asserting layout. The service can be tested without a browser.

Represent complex states with discriminated unions:

```ts
type Loadable<T> =
  | { status: "idle" }
  | { status: "loading"; previous?: T }
  | { status: "success"; data: T }
  | { status: "error"; previous?: T; code: string };
```

This prevents impossible combinations such as `isLoading`, `hasError`, and `data` all meaning different things in different components.

## Component metadata and catalog

Every reusable component should have:

- purpose and ownership;
- typed props and supported variants;
- accessibility behavior;
- token dependencies;
- default, hover, focus, pressed, disabled, loading, success, warning, and error examples where applicable;
- responsive and long-content examples;
- canonical test identifiers only when semantic queries are insufficient.

Expose components in a development-only catalog or Storybook. Keep fixtures deterministic and allow viewport selection. The catalog should render real production components, not lookalike demo markup.

## Accessibility and motion

Build keyboard behavior, focus-visible styling, focus placement and return, labels, roles, live regions, contrast, and pointer target size into the component contract. Define Escape and outside-click behavior explicitly for overlays.

Motion tokens define duration and easing. Components must support `prefers-reduced-motion`. Animation should explain change, preserve spatial context, or confirm action; it should not delay core work.

## Ownership and change policy

- Token changes require evidence of affected components and pages.
- New primitives require a repeated responsibility, not merely repeated markup.
- Product-specific styling remains local until a stable reusable pattern emerges.
- Deprecations include migration guidance and a removal window.
- Visual baselines change only after the intended design contract changes.
- Generated token artifacts are checked for drift in CI.

The result is a system where designers can reason in semantic language, product engineers assemble predictable components, and agents can inspect closed contracts instead of reverse-engineering scattered class names.
