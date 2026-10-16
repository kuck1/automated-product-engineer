export type ButtonTone = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const toneClasses: Record<ButtonTone, string> = {
  primary: "bg-action-primary text-on-action hover:bg-action-primary-hover",
  secondary: "border border-default bg-surface text-primary hover:bg-surface-subtle",
  danger: "bg-danger text-on-danger hover:bg-danger-strong",
  ghost: "bg-transparent text-primary hover:bg-surface-subtle",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-sm",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-5 text-base",
};

export function buttonClasses({
  tone = "primary",
  size = "md",
  loading = false,
}: {
  tone?: ButtonTone;
  size?: ButtonSize;
  loading?: boolean;
}) {
  return [
    "inline-flex items-center justify-center rounded-control font-semibold",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
    "disabled:pointer-events-none disabled:opacity-50",
    toneClasses[tone],
    sizeClasses[size],
    loading ? "cursor-wait" : "",
  ]
    .filter(Boolean)
    .join(" ");
}
