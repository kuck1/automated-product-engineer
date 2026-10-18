"use client";

import { ArrowRight, Check, CircleCheck, Pause, Play } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

const stages = [
  {
    id: "define",
    label: "Define",
    status: "Draft",
    summary: "The product decision becomes one executable feature capsule.",
    evidence: "Contract frozen",
  },
  {
    id: "validate",
    label: "Validate",
    status: "Validating",
    summary: "Every platform runs the same transition and policy scenarios.",
    evidence: "3 lanes running",
  },
  {
    id: "reconcile",
    label: "Reconcile",
    status: "Ready",
    summary: "Kotlin and TypeScript receipts agree on the canonical outcome.",
    evidence: "Receipts match",
  },
  {
    id: "release",
    label: "Release",
    status: "Released",
    summary: "Each native product ships independently against the same contract epoch.",
    evidence: "Proof complete",
  },
] as const;

const platforms = [
  {
    id: "web",
    name: "Next.js",
    surface: "Operations workspace",
    action: "Advance work item",
    detail: "Server and Client Components",
  },
  {
    id: "android",
    name: "Android",
    surface: "Field action sheet",
    action: "Move to next stage",
    detail: "Jetpack Compose + KMP",
  },
  {
    id: "ios",
    name: "iOS",
    surface: "Native review card",
    action: "Continue",
    detail: "SwiftUI + KMP facade",
  },
] as const;

export function ParallelPlatformShowcase() {
  const [stageIndex, setStageIndex] = useState(0);
  const [intent, setIntent] = useState("Let an operator advance a work item safely");
  const [activeIntent, setActiveIntent] = useState(intent);
  const [autoPlay, setAutoPlay] = useState(true);
  const [runId, setRunId] = useState(0);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);
  const stage = stages[stageIndex]!;

  useEffect(() => {
    if (!autoPlay) return;
    interval.current = setInterval(() => {
      setStageIndex((current) => (current + 1) % stages.length);
    }, 4600);
    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, [autoPlay, runId]);

  function submitIntent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextIntent = intent.trim();
    if (!nextIntent) return;
    setActiveIntent(nextIntent);
    setStageIndex(1);
    setAutoPlay(true);
    setRunId((current) => current + 1);
  }

  function advance() {
    setAutoPlay(false);
    setStageIndex((current) => (current + 1) % stages.length);
  }

  return (
    <div className="parallel-demo" aria-label="Interactive parallel platform delivery demo">
      <form className="parallel-intent" onSubmit={submitIntent}>
        <label htmlFor="parallel-intent-input">
          <span>Product decision</span>
          <strong>Describe the outcome once.</strong>
        </label>
        <div>
          <input
            id="parallel-intent-input"
            value={intent}
            onChange={(event) => setIntent(event.target.value)}
            aria-label="Product decision"
          />
          <button type="submit">Run in parallel <ArrowRight size={16} /></button>
        </div>
      </form>

      <div className="parallel-stage-nav" aria-label="Delivery stages">
        {stages.map((item, index) => (
          <button
            type="button"
            key={item.id}
            className={index === stageIndex ? "active" : index < stageIndex ? "complete" : ""}
            onClick={() => {
              setAutoPlay(false);
              setStageIndex(index);
            }}
            aria-pressed={index === stageIndex}
          >
            <i>{index < stageIndex ? <Check size={11} /> : String(index + 1).padStart(2, "0")}</i>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="parallel-contract">
        <div>
          <span>FEATURE CAPSULE · WORK ITEM</span>
          <strong>{activeIntent}</strong>
        </div>
        <div className="contract-epoch"><i /> CONTRACT EPOCH <code>e34b5a8e</code></div>
      </div>

      <div className="platform-lanes" aria-live="polite">
        {platforms.map((platform, index) => (
          <article className={`platform-lane platform-${platform.id}`} key={platform.id}>
            <header>
              <span>{String(index + 1).padStart(2, "0")} / {platform.name.toUpperCase()}</span>
              <i>Native lane</i>
            </header>
            <div className="platform-device">
              <div className="platform-device-bar"><i /><i /><i /></div>
              <small>{platform.surface}</small>
              <strong>{stage.status}</strong>
              <p>{activeIntent}</p>
              <button type="button" onClick={advance}>{platform.action} <ArrowRight size={14} /></button>
              <footer><CircleCheck size={13} /> {stage.evidence}</footer>
            </div>
            <p>{platform.detail}</p>
          </article>
        ))}
      </div>

      <div className="parallel-proof">
        <div>
          <span className="proof-pulse"><i /></span>
          <p><strong>{stage.label}</strong>{stage.summary}</p>
        </div>
        <div className="receipt-pair">
          <span>KOTLIN <Check size={12} /></span>
          <i />
          <span>TYPESCRIPT <Check size={12} /></span>
          <b>SEMANTIC PARITY</b>
        </div>
        <button type="button" onClick={() => setAutoPlay((current) => !current)}>
          {autoPlay ? <Pause size={14} /> : <Play size={14} />}
          {autoPlay ? "Pause story" : "Play story"}
        </button>
      </div>
    </div>
  );
}

