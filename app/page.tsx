import { ArrowRight, BookOpen, Check, GitFork, Layers3, Sparkles } from "lucide-react";
import Link from "next/link";
import { HeroPipeline } from "@/src/landing/hero-pipeline";
import { Badge, Brand, SectionEyebrow, SiteHeader } from "@/src/ui/components";

const skills = [
  ["Architecture design", "architecture-building"],
  ["Race-condition debugging", "frontend-api-db"],
  ["Decoupled state management", "architecture-building"],
  ["Code review", "code-review"],
  ["Design polish", "design-polish"],
  ["Design systems", "design-system"],
  ["Designs-to-app delivery", "figma-to-app-feature"],
  ["Full-stack vertical slices", "frontend-api-db"],
  ["Manual UI QA", "manual-ui-qa"],
  ["PR review and CI", "pr-workflow"],
  ["Responsive and security review", "security-review"],
] as const;

export default function HomePage() {
  return (
    <main className="site-shell">
      <SiteHeader />

      <section className="hero" id="workflow">
        <div className="hero-grid">
          <div>
            <SectionEyebrow>OPEN-SOURCE PRODUCT ENGINEERING SYSTEM</SectionEyebrow>
            <h1>Beautiful features.<span>In a day. Not a week.</span></h1>
          </div>
          <div className="hero-copy">
            <p>A practical Next.js reference for turning designs and product intent into typed UI, secure APIs, durable state, tested workflows, and a reviewable pull request.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="/examples">Explore the examples <ArrowRight size={17} /></a>
              <a className="text-link" href="https://github.com/kuck1/automated-product-engineer-nextjs#readme" target="_blank" rel="noreferrer">Use with your AI agent <ArrowRight size={15} /></a>
            </div>
            <small className="live-note"><i /> The site is the reference implementation.</small>
          </div>
        </div>
        <HeroPipeline />
      </section>

      <section className="stack-strip" aria-label="Reference stack">
        <span>REFERENCE<br />STACK</span><strong>Next.js</strong><strong>React</strong><strong>Supabase</strong><strong>TanStack Query</strong><strong>Playwright</strong>
      </section>

      <section className="section examples-section" id="examples">
        <div className="section-heading">
          <div><SectionEyebrow>REAL BUSINESS LOGIC</SectionEyebrow><h2>Examples that earn their architecture.</h2></div>
          <p>Both case studies are working vertical slices with authorization, validation, optimistic state, concurrency protection, persistence adapters, and failure UX.</p>
        </div>
        <div className="case-grid">
          <article className="case-card case-release">
            <div className="case-top"><Badge tone="info">Case study 01</Badge><span>Release operations</span></div>
            <div className="case-visual release-visual">
              <div className="mini-release-row"><i className="status-dot status-violet" /><span>Mobile checkout</span><strong>82%</strong></div>
              <div className="mini-progress"><i /></div>
              <div className="mini-gates"><span><Check size={12} /> Design QA</span><span><Check size={12} /> E2E</span><span className="is-pending">• Security</span></div>
            </div>
            <h3>Release Readiness</h3>
            <p>Dependency-aware gates, approval policy, guarded state transitions, optimistic mutations, and stale-write protection.</p>
            <a className="card-link" href="/examples?view=releases">Run the release workflow <ArrowRight size={16} /></a>
          </article>
          <article className="case-card case-onboarding">
            <div className="case-top"><Badge tone="success">Case study 02</Badge><span>Customer operations</span></div>
            <div className="case-visual onboarding-visual">
              <div className="health-ring"><span>74</span><small>health</small></div>
              <div><strong>Northstar Health</strong><small>3 of 4 milestones</small><div className="milestone-dots"><i /><i /><i /><i className="pending" /></div></div>
            </div>
            <h3>Onboarding Operations</h3>
            <p>SLA and adoption scoring, owner workload, milestone policy, tenant boundaries, and a validated launch transition.</p>
            <a className="card-link" href="/examples?view=onboarding">Run the onboarding workflow <ArrowRight size={16} /></a>
          </article>
        </div>
      </section>

      <section className="section system-section" id="system">
        <div className="system-copy">
          <SectionEyebrow>THE REPOSITORY IS THE PLAYBOOK</SectionEyebrow>
          <h2>Opinionated where architecture matters.</h2>
          <p>Stable contracts at every boundary make the code easy to extend without turning each new feature into a rewrite.</p>
          <div className="system-actions">
            <a className="button button-secondary" href="/system"><Layers3 size={17} /> Tour the design system</a>
            <a className="text-link" href="/library"><BookOpen size={15} /> Browse skills & prompts</a>
          </div>
        </div>
        <div className="layers-card">
          {[
            ["01", "UI state", "Local interaction only"],
            ["02", "Server cache", "Query and mutation ownership"],
            ["03", "Domain service", "Policy and authorization"],
            ["04", "Repository", "Supabase or deterministic demo"],
          ].map(([index, title, detail]) => <div key={index}><span>{index}</span><strong>{title}</strong><small>{detail}</small></div>)}
        </div>
      </section>

      <section className="section skill-section">
        <div className="section-heading compact"><div><SectionEyebrow>PORTABLE SKILLS</SectionEyebrow><h2>Call the same workflow from any AI agent.</h2></div><p>Install one conductor and focused skills for each stage. Progressive references keep prompts concise while preserving depth.</p></div>
        <div className="skill-cloud">{skills.map(([skill, slug], index) => <Link key={skill} href={`/library?skill=${slug}#skills`} aria-label={`Open the ${skill} skill`}><i>{String(index + 1).padStart(2, "0")}</i><span>{skill}</span><ArrowRight size={15} /></Link>)}</div>
      </section>

      <section className="section final-cta">
        <span className="cta-icon"><Sparkles size={26} /></span>
        <h2>Build against a system you can inspect.</h2>
        <p>Copy the skills, run the examples, and adapt the same contracts to your own product.</p>
        <div><a className="button button-primary" href="/examples">Open the live examples <ArrowRight size={17} /></a><a className="button button-secondary" href="https://github.com/kuck1/automated-product-engineer-nextjs" target="_blank" rel="noreferrer"><GitFork size={17} /> View source</a></div>
      </section>

      <footer><Brand /><span>MIT licensed · Built as a reference, not a framework.</span><a href="/library">Skills & prompts</a></footer>
    </main>
  );
}
