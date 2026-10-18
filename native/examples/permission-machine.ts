export type PermissionState = "unknown" | "educating" | "requesting" | "granted" | "limited" | "denied" | "blocked" | "unavailable";
export type PermissionEvent =
  | { type: "EXPLAIN" }
  | { type: "REQUEST" }
  | { type: "RESULT"; value: "granted" | "limited" | "denied" | "blocked" | "unavailable" }
  | { type: "RETRY" }
  | { type: "RESET" };

export function transitionPermission(state: PermissionState, event: PermissionEvent): PermissionState {
  if (event.type === "RESET") return "unknown";
  if (state === "unknown" && event.type === "EXPLAIN") return "educating";
  if ((state === "educating" || state === "denied") && event.type === "REQUEST") return "requesting";
  if (state === "requesting" && event.type === "RESULT") return event.value;
  if (state === "denied" && event.type === "RETRY") return "educating";
  return state;
}

export function permissionAction(state: PermissionState) {
  if (state === "blocked") return { label: "Open settings", action: "settings" as const };
  if (["denied", "unknown"].includes(state)) return { label: "Try again", action: "explain" as const };
  if (state === "unavailable") return { label: "Continue without it", action: "fallback" as const };
  return null;
}
