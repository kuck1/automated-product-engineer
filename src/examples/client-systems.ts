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
    ],
  },
} as const satisfies Record<"releases" | "onboarding", { readonly tokens: readonly ClientToken[] }>;

export function clientTokenStyle(tokens: readonly ClientToken[]) {
  return Object.fromEntries(tokens.map(({ variable, value }) => [variable, value])) as CSSProperties;
}
