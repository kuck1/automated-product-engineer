import { ArrowRight, Check, Copy, Play, SquareTerminal } from "lucide-react";
import Link from "next/link";
import { Badge, SectionEyebrow, SiteHeader } from "@/src/ui/components";

const steps = [
  ["01", "Install the system", "Add the skills, working examples, architecture guides, templates, tests, CI patterns, and delivery automation to your project."],
  ["02", "Choose the scope", "Run the complete product-engineering workflow or invoke one specialist for a focused task."],
  ["03", "Provide product context", "Give the agent the design, acceptance criteria, repository instructions, and current branch."],
  ["04", "Review working evidence", "Inspect the implementation, responsive screenshots, tests, CI results, and draft pull request."],
] as const;

export default function QuickStartPage() {
  return (
    <main className="quick-start-shell">
      <SiteHeader active="quick-start" />
      <section className="quick-start-hero">
        <div>
          <SectionEyebrow>QUICK START</SectionEyebrow>
          <h1>Install the system.<br /><span>Ship a complete feature.</span></h1>
        </div>
        <div className="quick-start-intro">
          <p>Add the system to your AI agent, provide the product contract, and follow the same path from implementation through review evidence.</p>
          <Link className="button button-primary" href="/library"><Play size={16} /> Choose a workflow</Link>
        </div>
      </section>

      <section className="quick-start-command" aria-label="Installation command">
        <SquareTerminal size={20} />
        <code>pnpm dlx automated-product-engineer</code>
        <Link href="https://github.com/kuck1/automated-product-engineer-nextjs#readme" target="_blank" rel="noreferrer">Installation options <ArrowRight size={15} /></Link>
      </section>

      <section className="quick-start-steps">
        {steps.map(([index, title, detail]) => (
          <article key={index}>
            <span>{index}</span>
            <Check size={18} />
            <h2>{title}</h2>
            <p>{detail}</p>
          </article>
        ))}
      </section>

      <section className="quick-start-paths">
        <Link href="/library?skill=automated-product-engineer#skills"><Badge tone="info">Full workflow</Badge><h2>Use the conductor for complete delivery.</h2><p>Architecture, implementation, QA, screenshots, retrospective, and pull-request packaging stay connected.</p><span>Open Automated Product Engineer <ArrowRight size={15} /></span></Link>
        <Link href="/library#skills"><Badge tone="success">Focused workflow</Badge><h2>Call a specialist for one clear boundary.</h2><p>Use focused skills for design delivery, state management, API work, review, responsive QA, or security.</p><span>Browse the complete skill library <ArrowRight size={15} /></span></Link>
      </section>

      <section className="quick-start-next">
        <Copy size={22} />
        <div><h2>See what happens behind the scenes.</h2><p>Trace one action through UI state, transport, domain policy, persistence, and verification before adapting the system.</p></div>
        <Link className="button button-secondary" href="/guide">Open behind the scenes <ArrowRight size={15} /></Link>
      </section>
    </main>
  );
}
