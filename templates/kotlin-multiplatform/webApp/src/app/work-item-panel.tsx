"use client";

import { useState } from "react";
import { transitionWorkItem, type WorkItem, type WorkStage } from "../generated/work-item-policy";

const nextStage: Partial<Record<WorkStage, WorkStage>> = { DRAFT: "VALIDATING", VALIDATING: "READY", BLOCKED: "VALIDATING" };

export function WorkItemPanel() {
  const [item, setItem] = useState<WorkItem>({ id: "work-1", title: "Launch field relay", stage: "DRAFT", revision: 4 });
  const [message, setMessage] = useState("Ready for a product decision.");
  const target = nextStage[item.stage];

  function advance() {
    if (!target) return;
    const result = transitionWorkItem(item, { operationId: crypto.randomUUID(), workItemId: item.id, expectedRevision: item.revision, nextStage: target });
    setItem(result.item);
    setMessage(result.kind === "APPLIED" ? "Canonical transition applied." : result.code ?? result.kind);
  }

  return (
    <section className="card" aria-live="polite">
      <div><span>Stage</span><strong>{item.stage}</strong></div>
      <div><span>Revision</span><strong>{item.revision}</strong></div>
      <h2>{item.title}</h2>
      <p>{message}</p>
      <button type="button" onClick={advance} disabled={!target}>{target ? `Move to ${target.toLowerCase()}` : "Complete"}</button>
    </section>
  );
}
