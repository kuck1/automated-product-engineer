import type { CSSProperties } from "react";

export type ClientToken = {
  readonly name: string;
  readonly variable: `--${string}`;
  readonly value: string;
  readonly purpose: string;
};

export const clientSystems = {
  releases: {
    tokens: [
      { name: "Decision focus", variable: "--release-action", value: "#FFD43B", purpose: "Selected release, progress, and primary focus" },
      { name: "Ready", variable: "--release-ready", value: "#45E6A8", purpose: "Passing gates and policy-complete releases" },
      { name: "Pending", variable: "--release-warning", value: "#FF8A3D", purpose: "Checks that still need attention" },
      { name: "Blocked", variable: "--release-danger", value: "#FF4D8D", purpose: "Failed gates and blocked transitions" },
      { name: "Control surface", variable: "--release-panel", value: "#17172A", purpose: "Rows, cards, and grouped controls" },
    ],
  },
  onboarding: {
    tokens: [
      { name: "Journey focus", variable: "--journey-action", value: "#0066CC", purpose: "Selected navigation and interactive focus" },
      { name: "Healthy progress", variable: "--journey-success", value: "#248A3D", purpose: "Adoption, completed milestones, and live state" },
      { name: "Needs attention", variable: "--journey-danger", value: "#D92D20", purpose: "At-risk accounts and overdue work" },
      { name: "Stage surface", variable: "--journey-canvas", value: "#F5F5F7", purpose: "Journey columns and spatial grouping" },
      { name: "Account surface", variable: "--journey-surface", value: "#FFFFFF", purpose: "Account cards and operational details" },
      { name: "Primary text", variable: "--journey-text", value: "#1D1D1F", purpose: "Account names, decisions, and primary content" },
      { name: "Supporting text", variable: "--journey-muted", value: "#6E6E73", purpose: "Metadata, hints, and secondary context" },
      { name: "Structure", variable: "--journey-line", value: "#DEDEE2", purpose: "Column, card, and control boundaries" },
      { name: "Progress track", variable: "--journey-track", value: "#E4E4E9", purpose: "Health rings and incomplete progress" },
    ],
  },
  field: {
    tokens: [
      { name: "Field canvas", variable: "--field-canvas", value: "#F2EBDD", purpose: "Warm map and route workspace" },
      { name: "Route ink", variable: "--field-ink", value: "#17251F", purpose: "Primary operational text and controls" },
      { name: "Signal orange", variable: "--field-action", value: "#F26B38", purpose: "Current stop and primary field action" },
      { name: "Confirmed", variable: "--field-success", value: "#187C5B", purpose: "Synced deliveries and available connection" },
      { name: "Offline queue", variable: "--field-warning", value: "#E5A62B", purpose: "Device-saved work waiting to sync" },
      { name: "Critical", variable: "--field-danger", value: "#B63B32", purpose: "Critical need and blocked work" },
      { name: "Device surface", variable: "--field-surface", value: "#FFFDF8", purpose: "Native cards, sheets, and inputs" },
      { name: "Route line", variable: "--field-line", value: "#C9C0AE", purpose: "Map paths and component boundaries" },
    ],
  },
} as const satisfies Record<"releases" | "onboarding" | "field", { readonly tokens: readonly ClientToken[] }>;

export function clientTokenStyle(tokens: readonly ClientToken[]) {
  return Object.fromEntries(tokens.map(({ variable, value }) => [variable, value])) as CSSProperties;
}
