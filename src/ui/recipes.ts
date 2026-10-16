export const badgeTone = {
  neutral: "badge badge-neutral",
  info: "badge badge-info",
  success: "badge badge-success",
  warning: "badge badge-warning",
  danger: "badge badge-danger",
} as const;

export type BadgeTone = keyof typeof badgeTone;

export const buttonTone = {
  primary: "button button-primary",
  secondary: "button button-secondary",
  quiet: "button button-quiet",
} as const;

export type ButtonTone = keyof typeof buttonTone;
