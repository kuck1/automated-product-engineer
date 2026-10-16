# Semantic Token Export Prompt

Extract the design decisions from the supplied frames into a semantic token library.

Provide DTCG-compatible `tokens.json`, matching CSS variables, and a readable token table. Cover color, typography, spacing, radii, borders, shadows, layering, and motion.

For every token include:

- semantic name;
- raw value;
- intended purpose;
- allowed component contexts;
- light/dark or state variants;
- mapping to an existing application token when one exists.

Name tokens by meaning, such as `color.action.primary`, rather than appearance, such as `purple.500`. Separate global foundations from product aliases and component-specific decisions. Flag duplicate or conflicting values instead of silently creating a second system.
