"use client";

import { useCallback, useState } from "react";
import type { ReviewPanelState } from "../components/view-contract";

export interface ReviewAdapter {
  load(signal: AbortSignal): Promise<{ title: string; description: string }>;
  confirm(): Promise<void>;
}

export function useReviewController(adapter: ReviewAdapter) {
  const [state, setState] = useState<ReviewPanelState>({ status: "empty" });

  const load = useCallback(async () => {
    const controller = new AbortController();
    setState({ status: "loading" });
    try {
      const data = await adapter.load(controller.signal);
      setState({ status: "ready", ...data });
    } catch (error) {
      if (!controller.signal.aborted) {
        setState({ status: "error", message: normalizeError(error) });
      }
    }
    return () => controller.abort();
  }, [adapter]);

  const confirm = useCallback(async () => {
    if (state.status !== "ready") return;
    const previous = state;
    setState({ status: "saving", title: state.title, description: state.description });
    try {
      await adapter.confirm();
      setState({ status: "empty" });
    } catch (error) {
      setState({ status: "error", title: previous.title, message: normalizeError(error) });
    }
  }, [adapter, state]);

  return { state, load, confirm };
}

function normalizeError(error: unknown) {
  return error instanceof Error ? error.message : "The request failed. Please try again.";
}
