import { ArrowLeft, ArrowUpRight, FileText, WandSparkles } from "lucide-react";
import Link from "next/link";
import { Badge, Brand, SectionEyebrow } from "@/src/ui/components";

const base = "https://github.com/kuck1/automated-product-engineer-nextjs/blob/main";
const skills = [
  ["Automated Product Engineer", "Conductor", "Coordinates architecture, implementation, QA, evidence, retrospective, and a draft PR.", "automated-product-engineer"],
  ["Architecture Design", "System", "Defines state ownership, service boundaries, failure contracts, and safe extension points.", "architecture-building"],
  ["Code Review", "Quality", "Reviews behavior, correctness, data flow, and maintainability with verified evidence.", "code-review"],
  ["Design Polish", "Design", "Finds geometry, hierarchy, interaction, and perceived-quality defects in the real browser.", "design-polish"],
  ["Design System", "Design", "Builds semantic tokens, typed variants, reusable patterns, and governed visual baselines.", "design-system"],
  ["Figma to App", "Delivery", "Turns Figma frames into production UI while preserving the target application's architecture.", "figma-to-app-feature"],
  ["Claude Design to App", "Delivery", "Requests complete design exports, then maps them into components, data, flags, analytics, and tests.", "claude-design-to-app"],
  ["Frontend / API / Database", "Full stack", "Builds authenticated vertical slices with validation, services, repositories, and durable invariants.", "frontend-api-db"],
  ["Manual UI QA", "Quality", "Stress-tests real flows across data, network, navigation, persistence, and responsive conditions.", "manual-ui-qa"],
  ["PR Review", "Quality", "Audits incremental diffs, migration safety, CI evidence, and unresolved feedback.", "pr-review"],
  ["PR Workflow", "Delivery", "Packages clean branches, screenshots, validation, reviewer context, and rollback guidance.", "pr-workflow"],
  ["Responsive Design", "Design", "Designs adaptive behavior around content pressure, input modes, and transition widths.", "responsive-design"],
  ["Security Review", "Security", "Traces identity, tenancy, permissions, sensitive data, abuse paths, and server authority.", "security-review"],
] as const;

const prompts = [
  ["Claude Design quick request", "A concise request for tokens, dependency-free HTML, typed reference components, states, and responsive frames.", "claude-design-quick.md"],
  ["Claude Design full export", "A complete contract for multi-step, persistent, permission-sensitive, or data-heavy features.", "claude-design-full-export.md"],
] as const;

export default function LibraryPage() {
  return <main className="library-shell">
    <header className="workspace-header"><Brand /><Link className="workspace-back" href="/"><ArrowLeft size={15} /> Back to overview</Link><a href={`${base}/docs/ai-editor-setup.md`} target="_blank" rel="noreferrer">Editor setup <ArrowUpRight size={14} /></a></header>
    <section className="library-hero"><SectionEyebrow>PORTABLE AGENT WORKFLOWS</SectionEyebrow><h1>Use the whole system.<br /><span>Call only what you need.</span></h1><p>Install the conductor for end-to-end delivery or invoke a specialist for a focused task. Every skill uses progressive references so short prompts still have architectural depth.</p><div><code>python3 scripts/install_ai_editor.py --target codex --project /your/app</code></div></section>
    <section className="library-section"><div className="library-heading"><div><Badge tone="info">13 skills</Badge><h2>Skills library</h2></div><p>Compatible with Codex, Claude Code, Cursor, Windsurf, Copilot, Orca, and generic builders.</p></div><div className="library-grid">{skills.map(([name, category, description, slug], index) => <a key={slug} href={`${base}/skills/${slug}/SKILL.md`} target="_blank" rel="noreferrer"><span>{String(index + 1).padStart(2,"0")}</span><Badge>{category}</Badge><h3>{name}</h3><p>{description}</p><i>Open skill <ArrowUpRight size={13} /></i></a>)}</div></section>
    <section className="library-section prompts-section"><div className="library-heading"><div><Badge tone="success">Meta-prompts</Badge><h2>Ask design tools for the right artifacts.</h2></div><p>These requests keep visual intent portable while leaving production architecture with the application.</p></div><div className="prompt-grid">{prompts.map(([name, description, file]) => <a key={file} href={`${base}/prompts/${file}`} target="_blank" rel="noreferrer"><span><WandSparkles size={19} /></span><div><h3>{name}</h3><p>{description}</p></div><ArrowUpRight size={17} /></a>)}</div></section>
    <section className="library-section library-footer"><FileText size={21} /><div><h2>Start with a working example.</h2><p>The release and onboarding case studies show the preferred boundaries from these skills in executable code.</p></div><Link className="button button-primary" href="/examples">Open examples <ArrowUpRight size={15} /></Link></section>
  </main>;
}
