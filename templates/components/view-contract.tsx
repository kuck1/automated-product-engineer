import type { ReactNode } from "react";

export type ReviewPanelState =
  | { status: "loading"; previousTitle?: string }
  | { status: "empty" }
  | { status: "ready"; title: string; description: string }
  | { status: "saving"; title: string; description: string }
  | { status: "error"; title?: string; message: string };

export interface ReviewPanelProps {
  state: ReviewPanelState;
  actions?: ReactNode;
  onRetry(): void;
  onConfirm(): void;
}

export function ReviewPanel({ state, actions, onRetry, onConfirm }: ReviewPanelProps) {
  if (state.status === "loading") return <p aria-live="polite">Loading…</p>;
  if (state.status === "empty") return <p>No items are ready for review.</p>;
  if (state.status === "error") {
    return (
      <section aria-labelledby="review-error-title">
        <h2 id="review-error-title">We could not load this review</h2>
        <p>{state.message}</p>
        <button type="button" onClick={onRetry}>Try again</button>
      </section>
    );
  }

  return (
    <section aria-labelledby="review-title" aria-busy={state.status === "saving"}>
      <h2 id="review-title">{state.title}</h2>
      <p>{state.description}</p>
      {actions}
      <button type="button" disabled={state.status === "saving"} onClick={onConfirm}>
        {state.status === "saving" ? "Saving…" : "Confirm"}
      </button>
    </section>
  );
}
