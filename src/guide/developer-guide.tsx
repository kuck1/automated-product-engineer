"use client";

import { useState } from "react";
import { ArrowRight, Check, Code2, Database, LockKeyhole, Server, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { architectureLayers, extensionRules, requestLifecycle, stateOwners, verificationLayers } from "@/src/examples/architecture-reference";

export function DeveloperGuide() {
  const [activeId, setActiveId] = useState<(typeof architectureLayers)[number]["id"]>("interaction");
  const active = architectureLayers.find((layer) => layer.id === activeId) ?? architectureLayers[0];
  return <article id="architecture" className="developer-guide">
    <header className="guide-intro"><div><span>COMPLETE IMPLEMENTATION GUIDE</span><h1>One action. Every boundary. No missing middle.</h1><p>This page contains the architecture decision, real source excerpts, state model, extension rules, and verification contract. Follow the same path when adding a vertical slice.</p></div><dl><div><dt>5</dt><dd>explicit boundaries</dd></div><div><dt>2</dt><dd>replaceable adapters</dd></div><div><dt>1</dt><dd>policy authority</dd></div></dl></header>
    <nav className="guide-nav" aria-label="Developer guide sections"><a href="#guide-layers">Layers</a><a href="#guide-lifecycle">Request lifecycle</a><a href="#guide-state">State ownership</a><a href="#guide-extension">Extension</a><a href="#guide-verification">Verification</a></nav>

    <section className="guide-section" id="guide-layers"><div className="guide-heading"><span>01 / LAYERS</span><div><h3>Explore the source by responsibility.</h3><p>Select a layer to see what it owns, why the boundary exists, and the code that implements it.</p></div></div>
      <div className="layer-explorer"><div className="layer-stack">{architectureLayers.map((layer, index) => <button className={active.id === layer.id ? "active" : ""} key={layer.id} onClick={() => setActiveId(layer.id)} aria-pressed={active.id === layer.id}><span>{String(index + 1).padStart(2, "0")}</span><div><small>{layer.label}</small><strong>{layer.title}</strong><p>{layer.detail}</p></div><ArrowRight size={16} /></button>)}</div>
        <div className="source-reader"><header><div><span>{active.label}</span><strong>{active.title}</strong></div><code>{active.path}</code></header><p>{active.why}</p><pre><code>{active.code}</code></pre><footer><LockKeyhole size={14} /> Stable contracts keep this layer independently testable and replaceable.</footer></div>
      </div>
    </section>

    <section className="guide-section" id="guide-lifecycle"><div className="guide-heading"><span>02 / REQUEST LIFECYCLE</span><div><h3>Trace a mutation end to end.</h3><p>The happy path and failure path use the same six steps. Optimism improves speed; the server still owns truth.</p></div></div><ol className="lifecycle-grid">{requestLifecycle.map(([title, detail], index) => <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><Workflow size={18} /><strong>{title}</strong><p>{detail}</p></li>)}</ol></section>

    <section className="guide-section" id="guide-state"><div className="guide-heading"><span>03 / STATE</span><div><h3>Give every state one owner.</h3><p>UI state, navigation, cached server state, durable records, and identity have different lifetimes and authorities.</p></div></div><div className="state-table"><div className="state-table-head"><span>State class</span><span>What lives there</span><span>Owner</span></div>{stateOwners.map(([kind, content, owner]) => <div key={kind}><strong>{kind}</strong><p>{content}</p><code>{owner}</code></div>)}</div></section>

    <section className="guide-section guide-split" id="guide-extension"><div><div className="guide-heading"><span>04 / EXTENSION</span><div><h3>Extend contracts, not conditionals.</h3><p>New capability enters through one stable seam. Existing layers remain closed to unrelated details.</p></div></div><div className="extension-list">{extensionRules.map(([change, rule]) => <div key={change}><Sparkles size={16} /><span><strong>{change}</strong><p>{rule}</p></span></div>)}</div></div><aside className="production-rules"><h3>Boundary rules</h3><ul><li><Check size={14} /> Pages compose; they do not query databases.</li><li><Check size={14} /> Routes authenticate, validate, delegate, normalize.</li><li><Check size={14} /> Services own authorization and business policy.</li><li><Check size={14} /> Repositories expose domain-shaped capabilities.</li><li><Check size={14} /> Adapters translate vendor records at the edge.</li></ul><div><Server size={18} /><span><strong>Auth before policy</strong><p>The server resolves an actor. The service verifies actor-to-workspace ownership for every record.</p></span></div><div><Database size={18} /><span><strong>RLS as defense in depth</strong><p>Supabase policies repeat tenant isolation below the application service.</p></span></div></aside></section>

    <section className="guide-section" id="guide-verification"><div className="guide-heading"><span>05 / VERIFICATION</span><div><h3>Evidence follows the architecture.</h3><p>Test the responsibility at the narrowest useful layer, then prove the integrated experience in a real browser.</p></div></div><div className="verification-grid">{verificationLayers.map(([layer, evidence], index) => <article key={layer}><span>{String(index + 1).padStart(2, "0")}</span><ShieldCheck size={20} /><h4>{layer}</h4><p>{evidence}</p></article>)}</div><div className="guide-finish"><Code2 size={20} /><div><strong>Definition of done</strong><p>A typed contract, thin route, policy service, adapter-backed repository, explicit client state, failure UX, focused tests, reviewed screenshots, green CI, and a reviewable pull request.</p></div></div></section>
  </article>;
}

