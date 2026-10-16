/**
 * Human-facing metadata for the semantic CSS tokens defined in globals.css.
 * Components depend on the stable variable names; this registry gives tools,
 * documentation, and people one vocabulary for explaining their purpose.
 */
export const semanticColorTokens = [
  { name: "Canvas", variable: "--bg", cssValue: "var(--bg)", purpose: "The page behind everything", guidance: "Use as the quiet outermost layer." },
  { name: "Raised canvas", variable: "--bg-elevated", cssValue: "var(--bg-elevated)", purpose: "A subtle level above the page", guidance: "Use for navigation and grouped regions." },
  { name: "Panel", variable: "--panel", cssValue: "var(--panel)", purpose: "The default container", guidance: "Use for cards, dialogs, and sidebars." },
  { name: "Strong panel", variable: "--panel-strong", cssValue: "var(--panel-strong)", purpose: "Emphasis inside a container", guidance: "Use for selected or nested surfaces." },
  { name: "Primary text", variable: "--ink", cssValue: "var(--ink)", purpose: "High-emphasis text and icons", guidance: "Use for titles and important values." },
  { name: "Supporting text", variable: "--muted", cssValue: "var(--muted)", purpose: "Helpful, lower-emphasis copy", guidance: "Use for descriptions and metadata." },
  { name: "Primary action", variable: "--accent", cssValue: "var(--accent)", purpose: "Interactive focus and brand expression", guidance: "Use for the one action that should win." },
  { name: "Success", variable: "--mint", cssValue: "var(--mint)", purpose: "Completed and healthy states", guidance: "Use only when something succeeded." },
  { name: "Warning", variable: "--warning", cssValue: "var(--warning)", purpose: "Attention without failure", guidance: "Use for risk or an incomplete step." },
  { name: "Danger", variable: "--danger", cssValue: "var(--danger)", purpose: "Failure or destructive action", guidance: "Use sparingly and pair with words." },
] as const;

export const spacingTokens = [
  ["Tight", "8 px", "Icon gaps and dense controls"],
  ["Control", "12 px", "Inside badges and compact inputs"],
  ["Default", "16 px", "The common gap between related items"],
  ["Section", "24 px", "Between distinct groups in a card"],
  ["Layout", "32 px", "Between major page regions"],
  ["Breathing room", "48 px", "Around feature-level content"],
] as const;

export const themePresets = {
  violet: { label: "Violet focus", note: "Expressive and technical", accent: "#a991ff", strong: "#8163f5", tint: "rgba(169,145,255,.12)" },
  mint: { label: "Mint focus", note: "Calm and operational", accent: "#72e2c0", strong: "#42b996", tint: "rgba(114,226,192,.12)" },
  amber: { label: "Amber focus", note: "Warm and editorial", accent: "#f2bf68", strong: "#ca8f2c", tint: "rgba(242,191,104,.12)" },
} as const;

export const shapePresets = {
  precise: { label: "Precise", note: "Tools and dense workflows", sm: "4px", md: "8px", lg: "14px" },
  balanced: { label: "Balanced", note: "The system default", sm: "8px", md: "14px", lg: "24px" },
  soft: { label: "Soft", note: "Welcoming, consumer-facing UI", sm: "13px", md: "20px", lg: "32px" },
} as const;

export type ThemePresetName = keyof typeof themePresets;
export type ShapePresetName = keyof typeof shapePresets;
