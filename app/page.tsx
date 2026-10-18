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
  ["Expo native delivery", "expo-native-app"],
] as const;

export default function HomePage() {
  return (
    <main className="site-shell">
      <SiteHeader />

      <section className="hero" id="workflow">
        <div className="hero-grid">
          <div>
            <SectionEyebrow>OPEN-SOURCE PRODUCT ENGINEERING SYSTEM</SectionEyebrow>
            <h1>Daily product work starts with business needs.<span>Not technical wrangling.</span></h1>
          </div>
          <div className="hero-copy">
            <p>Describe the outcome. The system handles state, security, persistence, failure recovery, testing, and delivery behind the scenes, so you can stay focused on what the product should do.</p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/quick-start">Quick start <ArrowRight size={17} /></Link>
              <Link className="text-link" href="/examples?view=releases">Explore the case studies <ArrowRight size={15} /></Link>
              <a className="text-link" href="https://github.com/kuck1/automated-product-engineer-nextjs#readme" target="_blank" rel="noreferrer">Use with your AI agent <ArrowRight size={15} /></a>
            </div>
            <small className="live-note"><i /> Inspect the technical system whenever you need it.</small>
          </div>
        </div>
        <HeroPipeline />
      </section>

      <section className="stack-strip" aria-label="Reference stack">
        <span>REFERENCE<br />STACK</span><strong>Next.js</strong><strong>Expo</strong><strong>React Native</strong><strong>Supabase</strong><strong>TanStack Query</strong>
      </section>

      <section className="section examples-section" id="examples">
        <div className="section-heading">
          <div><SectionEyebrow>BUSINESS NEEDS IN PRACTICE</SectionEyebrow><h2>Make the business decision. The system handles the rest.</h2></div>
          <p>Choose the next business action: decide what can ship or move a customer toward value. State, policy, persistence, failure recovery, and verification stay behind the workflow.</p>
        </div>
        <div className="case-grid">
          <Link className="case-card case-release" href="/examples?view=releases" aria-label="Open the Release Readiness case study">
            <div className="case-top"><Badge tone="info">Case study 01</Badge><span className="case-system-name">Checkpoint OS · release operations</span></div>
            <div className="case-visual release-visual">
              <small className="case-visual-label">Release / mobile checkout</small>
              <div className="mini-release-row"><i className="status-dot status-violet" /><span>Mobile checkout</span><strong>82%</strong></div>
              <div className="mini-progress"><i /></div>
              <div className="mini-gates"><span><Check size={12} /> Design QA</span><span><Check size={12} /> E2E</span><span className="is-pending">• Security</span></div>
            </div>
            <h3>Release Readiness</h3>
            <p>Decide what can ship, resolve what is blocked, and move a release forward. Gates, approvals, concurrency, and rollback stay behind the workflow.</p>
            <span className="card-link">Decide what can ship <ArrowRight size={16} /></span>
          </Link>
          <Link className="case-card case-onboarding" href="/examples?view=onboarding" aria-label="Open the Onboarding Operations case study">
            <div className="case-top"><Badge tone="success">Case study 02</Badge><span className="case-system-name">Clarity System · customer operations</span></div>
            <div className="case-visual onboarding-visual">
              <div className="health-ring"><span>74</span><small>health</small></div>
              <div><span className="journey-kicker">Customer journey</span><strong>Northstar Health</strong><small>3 of 4 milestones</small><div className="milestone-dots"><i /><i /><i /><i className="pending" /></div></div>
            </div>
            <h3>Onboarding Operations</h3>
            <p>See which customer needs attention and move each account toward value. Health scoring, tenant safety, persistence, and recovery stay behind the workflow.</p>
            <span className="card-link">Move customers toward value <ArrowRight size={16} /></span>
          </Link>
          <Link className="case-card case-field" href="/examples?view=field" aria-label="Open the Field Relay native case study">
            <div className="case-top"><Badge tone="neutral">Case study 03</Badge><span className="case-system-name">Relay Field System · native operations</span></div>
            <div className="case-visual field-visual">
              <div className="field-mini-map"><i /><i /><span>01</span><span>02</span><span>03</span></div>
              <div className="field-mini-stop"><small>CRITICAL · 10:35</small><strong>Cedar Ridge Shelter</strong><span>48 water cases · en route</span><b>Saved for offline use</b></div>
            </div>
            <h3>Field Relay</h3>
            <p>Move essential supplies through weak connectivity. Assignment, proof, offline sync, authorization, and conflict recovery stay behind the route.</p>
            <span className="card-link">Complete the next stop <ArrowRight size={16} /></span>
          </Link>
        </div>
      </section>

      <section className="section system-section" id="system">
        <div className="system-copy">
          <SectionEyebrow>TECHNICAL DECISIONS, ALREADY MADE</SectionEyebrow>
          <h2>Stay focused on what the product should do.</h2>
          <p>Stable contracts keep state, security, persistence, and failure recovery out of the daily product conversation while leaving every decision open to inspection.</p>
          <div className="system-actions">
            <a className="button button-secondary" href="/guide#guide-design-system"><Layers3 size={17} /> Tour the design system</a>
            <Link className="text-link" href="/guide"><BookOpen size={15} /> Go behind the scenes</Link>
          </div>
        </div>
        <div className="layers-card">
          {[
            ["01", "UI state", "Local interaction only", "/guide#guide-state"],
            ["02", "Server cache", "Query and mutation ownership", "/guide#guide-state"],
            ["03", "Domain service", "Policy and authorization", "/guide#guide-lifecycle"],
            ["04", "Repository", "Supabase or deterministic demo", "/guide#guide-extension"],
          ].map(([index, title, detail, href]) => <Link key={index} href={href}><span>{index}</span><strong>{title}</strong><small>{detail}</small><ArrowRight size={15} /></Link>)}
        </div>
      </section>

      <section className="section skill-section">
        <div className="section-heading compact"><div><SectionEyebrow>PORTABLE SKILLS</SectionEyebrow><h2>Call the same workflow from any AI agent.</h2></div><p>Install one conductor and focused skills for each stage. Progressive references keep requests concise while preserving depth.</p></div>
        <div className="skill-cloud">{skills.map(([skill, slug], index) => <Link key={skill} href={`/library?skill=${slug}#skills`} aria-label={`Open the ${skill} skill`}><i>{String(index + 1).padStart(2, "0")}</i><span>{skill}</span><ArrowRight size={15} /></Link>)}</div>
      </section>

      <section className="section final-cta">
        <span className="cta-icon"><Sparkles size={26} /></span>
        <h2>Start with the outcome.</h2>
        <p>Bring the business need. The system supplies the implementation path, safeguards, tests, and evidence.</p>
        <div><Link className="button button-primary" href="/quick-start">Start with the workflow <ArrowRight size={17} /></Link><a className="button button-secondary" href="https://github.com/kuck1/automated-product-engineer-nextjs" target="_blank" rel="noreferrer"><GitFork size={17} /> View source</a></div>
      </section>

      <footer><Brand /><span>MIT licensed · Built as a reference, not a framework.</span><Link href="/guide">Behind the scenes</Link><Link href="/library">Complete skill library</Link></footer>
    </main>
  );
}
