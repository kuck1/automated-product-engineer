# Design system and accessibility

Start with Apple semantics: roles, hierarchy, materials, Dynamic Type, safe areas, focus, keyboard, pointer, and platform navigation. Map product tokens to semantic `ShapeStyle`, spacing, typography, radius, motion, and component roles. Do not freeze adaptive colors into hex values or replace system controls without a product requirement.

A reusable component entry contains purpose, anatomy, typed variants, content rules, interaction states, accessibility behavior, compact and regular layouts, examples, anti-patterns, and ownership. Prefer small configuration enums and slots over boolean prop combinations. Keep business policy outside visual components.

Verify extra-small through accessibility text sizes, bold text, increased contrast, differentiate-without-color, reduce motion, VoiceOver order and actions, Switch Control reachability, keyboard/focus behavior where supported, localization expansion, right-to-left layout, and one-handed safe interaction. Use SF Symbols by semantic name and provide a text label when the symbol alone is ambiguous.

Snapshot tests can protect stable visual contracts, but inspect diffs and pair them with accessibility and interaction proof. Preview fixtures should cover content pressure and failure states rather than only a polished happy path.
