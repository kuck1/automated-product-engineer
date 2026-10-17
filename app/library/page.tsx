import { readFileSync } from "node:fs";
import path from "node:path";
import { ArrowUpRight, FileText, Palette } from "lucide-react";
import Link from "next/link";
import { PromptBrowser } from "@/src/library/prompt-browser";
import { promptCatalog, type PromptEntry } from "@/src/library/prompt-catalog";
import { SkillBrowser, type SkillEntry } from "@/src/library/skill-browser";
import { Badge, SectionEyebrow, SiteHeader } from "@/src/ui/components";

const skills = [
  ["Automated Product Engineer", "Conductor", "Coordinates architecture, implementation, QA, evidence, retrospective, and a draft PR.", "automated-product-engineer", "RUN THE WHOLE WORKFLOW"],
  ["Architecture Design", "System", "Defines state ownership, service boundaries, failure contracts, and safe extension points.", "architecture-building", "DESIGN THE BOUNDARIES"],
  ["Code Review", "Quality", "Reviews behavior, correctness, data flow, and maintainability with verified evidence.", "code-review"],
  ["Design Polish", "Design", "Finds geometry, hierarchy, interaction, and perceived-quality defects in the real browser.", "design-polish"],
  ["Design System", "Design", "Builds semantic tokens, typed variants, reusable patterns, and governed visual baselines.", "design-system", "BUILD THE SYSTEM"],
  ["Figma to App", "Delivery", "Turns Figma frames into production UI while preserving the target application's architecture.", "figma-to-app-feature", "SHIP FROM FIGMA"],
  ["Claude Design to App", "Delivery", "Requests complete design exports, then maps them into components, data, flags, analytics, and tests.", "claude-design-to-app", "SHIP FROM CLAUDE"],
  ["Frontend / API / Database", "Full stack", "Builds authenticated vertical slices with validation, services, repositories, and durable invariants.", "frontend-api-db"],
  ["Manual UI QA", "Quality", "Stress-tests real flows across data, network, navigation, persistence, and responsive conditions.", "manual-ui-qa"],
  ["PR Review", "Quality", "Audits incremental diffs, migration safety, CI evidence, and unresolved feedback.", "pr-review"],
  ["PR Workflow", "Delivery", "Packages clean branches, screenshots, validation, reviewer context, and rollback guidance.", "pr-workflow"],
  ["Responsive Design", "Design", "Designs adaptive behavior around content pressure, input modes, and transition widths.", "responsive-design"],
  ["Security Review", "Security", "Traces identity, tenancy, permissions, sensitive data, abuse paths, and server authority.", "security-review"],
] as const;

const prompts: PromptEntry[] = promptCatalog.map(prompt => ({ ...prompt, body: readFileSync(path.join(process.cwd(), "prompts", prompt.file), "utf8") }));
const skillEntries: SkillEntry[] = skills.map(([title, category, description, slug, featuredLabel]) => ({
  title, category, description, slug, featuredLabel,
  body: readFileSync(path.join(process.cwd(), "skills", slug, "SKILL.md"), "utf8").replace(/^---[\s\S]*?---\s*/, ""),
}));

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ prompt?: string; skill?: string }> }) {
  const { prompt, skill } = await searchParams;
  return <main className="library-shell">
    <SiteHeader active="library" />
    <section className="library-hero"><SectionEyebrow>PORTABLE AGENT WORKFLOWS</SectionEyebrow><h1>Install once.<br /><span>Orchestrate everything.</span></h1><p>Add the workflow to your AI agent once. Run the complete delivery cycle or call one focused skill.</p><div><code>python3 scripts/install_ai_editor.py --target codex --project /your/app</code></div><Link className="button button-secondary library-system-link" href="/system"><Palette size={16} /> Tour tokens &amp; components</Link></section>
    <section className="library-section" id="skills"><div className="library-heading"><div><Badge tone="info">13 reusable skills</Badge><h2>Start with the workflow, then inspect the playbook.</h2></div><p>Five high-leverage workflows lead. Search the specialist library when you need a narrower boundary. Every skill is readable here and portable to Codex, Claude Code, Cursor, Windsurf, Copilot, Orca, and other agents.</p></div><SkillBrowser skills={skillEntries} initialSlug={skill} /></section>
    <section className="library-section prompts-section" id="prompts"><div className="library-heading"><div><Badge tone="success">12 copy-ready prompts</Badge><h2>Ask for one artifact or the whole handoff.</h2></div><p>The granular prompts are back. Browse, search, read, and copy them here without leaving the application.</p></div><PromptBrowser prompts={prompts} initialSlug={prompt} /></section>
    <section className="library-section library-footer"><FileText size={21} /><div><h2>Start with a working example.</h2><p>The release and onboarding case studies show the preferred boundaries from these skills in executable code.</p></div><Link className="button button-primary" href="/examples?view=releases">Open Release Readiness <ArrowUpRight size={15} /></Link></section>
  </main>;
}
