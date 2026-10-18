import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, GitFork, Layers3, ShieldCheck, Split, Zap } from "lucide-react";
import { ParallelPlatformShowcase } from "@/src/parallel/parallel-platform-showcase";
import { SectionEyebrow, SiteHeader } from "@/src/ui/components";

export const metadata: Metadata = {
  title: "Parallel platform delivery · Automated Product Engineer",
  description: "Ship one product decision through native Next.js, Android, and iOS experiences in parallel, with shared policy and machine-checked semantic parity.",
};

const shared = [
  "Product language and state transitions",
  "Authorization and failure meaning",
  "API schemas and semantic tokens",
  "Executable scenarios and release evidence",
];

const native = [
  "Rendering and navigation",
  "Lifecycle and device capabilities",
  "Secure storage and platform accessibility",
  "Performance, signing, and distribution",
];

export default function ParallelPlatformPage() {
  return (
    <main className="site-shell parallel-page">
      <SiteHeader active="parallel" />

      <section className="parallel-hero">
        <div>
          <SectionEyebrow>TRUE PARALLEL PRODUCT DELIVERY</SectionEyebrow>
          <h1>One product decision.<span>Three native products.</span></h1>
        </div>
        <div className="parallel-hero-copy">
          <p>Next.js, Android, and iOS move at the same time from one precise product contract. Each team keeps its native tools, interaction model, and release path.</p>
          <div>
            <a className="button button-primary" href="#live-proof">See it work <ArrowRight size={17} /></a>
            <a className="text-link" href="https://github.com/kuck1/automated-product-engineer/tree/main/templates/kotlin-multiplatform" target="_blank" rel="noreferrer">Open the runnable blueprint <ArrowRight size={15} /></a>
          </div>
        </div>
      </section>

      <div className="parallel-statement" aria-label="Parallel delivery principles">
        <span><b>01</b> Shared product meaning</span>
        <span><b>02</b> Independent platform work</span>
        <span><b>03</b> Machine-checked convergence</span>
      </div>

      <section className="parallel-showcase-section" id="live-proof">
        <div className="parallel-section-heading">
          <div><SectionEyebrow>LIVE PRODUCT SEMANTICS FABRIC</SectionEyebrow><h2>Make one decision. Watch every platform move.</h2></div>
          <p>Change the product outcome, advance the story, or inspect any lane. The behavior stays aligned while each interface remains native.</p>
        </div>
        <ParallelPlatformShowcase />
      </section>

      <section className="parallel-ownership-section">
        <div className="parallel-section-heading">
          <div><SectionEyebrow>SHARE THE DECISION, KEEP THE EXPERIENCE</SectionEyebrow><h2>Exact where correctness matters. Native where experience matters.</h2></div>
          <p>The shared boundary is smaller than an application and stronger than a document. It aligns product meaning without forcing one platform to become the reference implementation.</p>
        </div>
        <div className="ownership-compare">
          <article>
            <header><Layers3 size={18} /><span>Share exactly</span><small>PRODUCT SEMANTICS</small></header>
            <ul>{shared.map((item) => <li key={item}><Check size={14} />{item}</li>)}</ul>
          </article>
          <article>
            <header><Split size={18} /><span>Build natively</span><small>PLATFORM EXPERIENCE</small></header>
            <ul>{native.map((item) => <li key={item}><Check size={14} />{item}</li>)}</ul>
          </article>
        </div>
      </section>

      <section className="parallel-evidence-section">
        <div className="parallel-evidence-copy">
          <SectionEyebrow>PROOF BEFORE CONVERGENCE</SectionEyebrow>
          <h2>Green means the same thing everywhere.</h2>
          <p>Each lane publishes its contract epoch, supported capabilities, scenario results, native checks, and known deviations. Convergence rejects drift instead of discovering it after launch.</p>
          <Link className="text-link" href="/guide">See how the system works <ArrowRight size={15} /></Link>
        </div>
        <div className="evidence-console" aria-label="Parallel platform verification results">
          <header><i /><i /><i /><span>CONVERGENCE / CONTRACT e34b5a8e</span></header>
          {[
            ["WEB", "Next.js production build", "PASSED"],
            ["SHARED", "KMP product kernel", "PASSED"],
            ["ANDROID", "Native projection", "PASSED"],
            ["IOS", "Swift native projection", "PASSED"],
            ["PARITY", "Kotlin ↔ TypeScript receipts", "MATCH"],
          ].map(([lane, check, result]) => <div key={lane}><b>{lane}</b><span>{check}</span><strong><Check size={12} /> {result}</strong></div>)}
          <footer><ShieldCheck size={15} /> All independent evidence belongs to the same contract epoch.</footer>
        </div>
      </section>

      <section className="section final-cta parallel-cta">
        <span className="cta-icon"><Zap size={26} /></span>
        <h2>Start with one consequential feature.</h2>
        <p>Freeze its product meaning, launch sibling platform lanes, and make convergence a testable fact.</p>
        <div><Link className="button button-primary" href="/quick-start">Install the system <ArrowRight size={17} /></Link><a className="button button-secondary" href="https://github.com/kuck1/automated-product-engineer" target="_blank" rel="noreferrer"><GitFork size={17} /> View source</a></div>
      </section>
    </main>
  );
}

