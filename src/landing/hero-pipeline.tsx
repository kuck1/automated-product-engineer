"use client";

import { ArrowRight, Check, Code2, Database, FileText, Frame, GitPullRequest, Palette, ShieldCheck } from "lucide-react";
import type { CSSProperties } from "react";

const sourceCards = [
  { icon: Frame, label: "Figma frame", meta: "Design contract" },
  { icon: Palette, label: "Claude Design", meta: "HTML + tokens" },
  { icon: FileText, label: "Product brief", meta: "Behavior + edge cases" },
];

const outputs = [
  { icon: Code2, label: "Typed UI", meta: "Components" },
  { icon: Database, label: "Vertical slice", meta: "API + database" },
  { icon: ShieldCheck, label: "QA evidence", meta: "Desktop + mobile" },
  { icon: GitPullRequest, label: "Draft PR", meta: "Ready for review" },
];

export function HeroPipeline() {
  return (
    <div className="pipeline" aria-label="Animated product delivery workflow">
      <div className="pipeline-label pipeline-label-left">INPUTS YOUR AGENT CAN USE</div>
      <div className="pipeline-label pipeline-label-right">REVIEWABLE PRODUCT OUTPUT</div>
      <div className="pipeline-track pipeline-inputs">
        {sourceCards.map(({ icon: Icon, label, meta }, index) => (
          <article className="pipeline-card source-card" style={{ "--index": index } as CSSProperties} key={label}>
            <span className="pipeline-icon"><Icon size={18} /></span>
            <div><strong>{label}</strong><small>{meta}</small></div>
          </article>
        ))}
      </div>
      <div className="pipeline-core" aria-hidden="true">
        <div className="pipeline-beam" />
        <span className="pipeline-pulse"><ArrowRight size={18} /></span>
        <div className="token-stack">
          <code>--color-action</code>
          <code>Button&lt;Tone&gt;</code>
          <code>schema.safeParse</code>
          <code>repository.save</code>
        </div>
      </div>
      <div className="pipeline-track pipeline-outputs">
        {outputs.map(({ icon: Icon, label, meta }, index) => (
          <article className="pipeline-card output-card" style={{ "--index": index } as CSSProperties} key={label}>
            <span className="pipeline-icon"><Icon size={18} /></span>
            <div><strong>{label}</strong><small>{meta}</small></div>
            <span className="output-check"><Check size={12} /></span>
          </article>
        ))}
      </div>
      <div className="pipeline-caption">One contract. Every layer. Evidence included.</div>
    </div>
  );
}
