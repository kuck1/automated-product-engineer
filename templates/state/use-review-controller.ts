"use client";

import { useCallback, useRef, useState } from "react";
import type { ReviewPanelState } from "../components/view-contract";

export interface ReviewAdapter {
  load(signal: AbortSignal): Promise<{ title: string; description: string }>;
  confirm(): Promise<void>;
}

export function useReviewController(adapter: ReviewAdapter) {
  const [state, setState] = useState<ReviewPanelState>({ status: "empty" });
  const activeRequest = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setState({ status: "loading" });
    try {
      const data = await adapter.load(controller.signal);
      if (!controller.signal.aborted) setState({ status: "ready", ...data });
    } catch (error) {
      if (!controller.signal.aborted) {
        setState({ status: "error", message: normalizeError(error) });
      }
    } finally {
      if (activeRequest.current === controller) activeRequest.current = null;
    }
  }, [adapter]);

  const cancel = useCallback(() => {
    activeRequest.current?.abort();
    activeRequest.current = null;
  }, []);

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

  return { state, load, confirm, cancel };
}

function normalizeError(error: unknown) {
  return error instanceof Error ? error.message : "The request failed. Please try again.";
}
