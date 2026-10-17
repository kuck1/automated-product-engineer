"use client";

import { ArrowUpRight, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { MarkdownContent } from "./markdown-content";

export type SkillEntry = {
  slug: string;
  title: string;
  category: string;
  description: string;
  body: string;
  featuredLabel?: string;
};

const featuredOrder = ["automated-product-engineer", "figma-to-app-feature", "claude-design-to-app", "architecture-building", "design-system"];

export function SkillBrowser({ skills, initialSlug }: { skills: SkillEntry[]; initialSlug?: string }) {
  const featured = featuredOrder.map(slug => skills.find(skill => skill.slug === slug)).filter((skill): skill is SkillEntry => Boolean(skill));
  const categories = ["All", ...Array.from(new Set(skills.map(skill => skill.category)))];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [activeSlug, setActiveSlug] = useState(() => initialSlug && skills.some(skill => skill.slug === initialSlug) ? initialSlug : featured[0]?.slug ?? skills[0]?.slug ?? "");
  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return skills.filter(skill => (category === "All" || skill.category === category) && (!term || `${skill.title} ${skill.description} ${skill.category}`.toLowerCase().includes(term)));
  }, [category, query, skills]);
  const active = visible.find(skill => skill.slug === activeSlug) ?? visible[0] ?? skills[0];

  function selectSkill(slug: string) {
    setActiveSlug(slug);
    const url = new URL(window.location.href);
    url.searchParams.set("skill", slug);
    window.history.replaceState({}, "", `${url.pathname}?${url.searchParams.toString()}#skills`);
  }

  function selectFeatured(slug: string) {
    setQuery("");
    setCategory("All");
    selectSkill(slug);
  }

  return <div className="skill-browser">
    <div className="skill-featured">
      <div className="skill-featured-intro"><small>START WITH THE OUTCOME</small><h3>Five workflows cover most product work.</h3><p>Run the whole delivery loop, ship a design, or inspect one system boundary. The remaining specialists stay available below.</p></div>
      <div className="skill-featured-steps" role="list" aria-label="Featured workflows">
        {featured.map((skill, index) => <button key={skill.slug} type="button" className={active?.slug === skill.slug ? "active" : ""} onClick={() => selectFeatured(skill.slug)}>
          <span>{String(index + 1).padStart(2, "0")}</span><small>{skill.featuredLabel}</small><strong>{skill.title}</strong>
        </button>)}
      </div>
    </div>
    <div className="skill-browser-controls">
      <label><Search size={15} /><span className="sr-only">Search skills</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search skills" /></label>
      <div className="skill-category-tabs" aria-label="Skill categories">{categories.map(option => <button type="button" aria-pressed={category === option} className={category === option ? "active" : ""} key={option} onClick={() => setCategory(option)}>{option}</button>)}</div>
    </div>
    <div className="skill-browser-layout">
      <nav className="skill-list" aria-label="All skills">
        <div className="skill-list-label"><span>ALL SPECIALISTS</span><span>{visible.length}</span></div>
        {visible.map((skill, index) => <button type="button" className={active?.slug === skill.slug ? "active" : ""} key={skill.slug} onClick={() => selectSkill(skill.slug)}>
          <span>{String(index + 1).padStart(2, "0")}</span><div><small>{skill.category}</small><strong>{skill.title}</strong><p>{skill.description}</p></div>
        </button>)}
        {visible.length === 0 && <div className="skill-empty">No skills match that search.</div>}
      </nav>
      {active && <article className="skill-preview">
        <header><div><span><Sparkles size={16} /></span><div><small>{active.category}</small><h3>{active.title}</h3><p>{active.description}</p></div></div><a className="button button-secondary" href={`https://github.com/kuck1/automated-product-engineer-nextjs/blob/main/skills/${active.slug}/SKILL.md`} target="_blank" rel="noreferrer">Source <ArrowUpRight size={14} /></a></header>
        <MarkdownContent sourceBaseUrl={`https://github.com/kuck1/automated-product-engineer-nextjs/blob/main/skills/${active.slug}`}>{active.body}</MarkdownContent>
      </article>}
    </div>
  </div>;
}
