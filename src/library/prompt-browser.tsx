"use client";

import { Check, Copy, Search, WandSparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { MarkdownContent } from "./markdown-content";
import type { PromptCategory, PromptEntry } from "./prompt-catalog";

const categories: Array<"All" | PromptCategory> = ["All", "Start here", "Design contract", "Implementation", "Verification"];

export function PromptBrowser({ prompts, initialSlug }: { prompts: PromptEntry[]; initialSlug?: string }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [activeSlug, setActiveSlug] = useState(() => initialSlug && prompts.some(prompt => prompt.slug === initialSlug) ? initialSlug : prompts[0]?.slug ?? "");
  const [copied, setCopied] = useState(false);
  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return prompts.filter(prompt => (category === "All" || prompt.category === category) && (!term || `${prompt.title} ${prompt.description} ${prompt.category}`.toLowerCase().includes(term)));
  }, [category, prompts, query]);
  const active = visible.find(prompt => prompt.slug === activeSlug) ?? visible[0] ?? prompts[0];

  async function copyPrompt() {
    if (!active) return;
    await navigator.clipboard.writeText(active.body);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="prompt-browser">
      <div className="prompt-browser-controls">
        <label><Search size={15} /><span className="sr-only">Search prompts</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search prompts" /></label>
        <div className="prompt-category-tabs" aria-label="Prompt categories">{categories.map(option => <button type="button" aria-pressed={category === option} className={category === option ? "active" : ""} key={option} onClick={() => setCategory(option)}>{option}</button>)}</div>
      </div>
      <div className="prompt-browser-layout">
        <nav className="prompt-list" aria-label="Prompt library">
          {visible.map((prompt, index) => <button type="button" className={active?.slug === prompt.slug ? "active" : ""} key={prompt.slug} onClick={() => { setActiveSlug(prompt.slug); setCopied(false); }}>
            <span>{String(index + 1).padStart(2, "0")}</span><div><small>{prompt.category}</small><strong>{prompt.title}</strong><p>{prompt.description}</p></div>
          </button>)}
          {visible.length === 0 && <div className="prompt-empty">No prompts match that search.</div>}
        </nav>
        {active && <article className="prompt-preview">
          <header><div><span><WandSparkles size={16} /></span><div><small>{active.category}</small><h3>{active.title}</h3><p>{active.description}</p></div></div><button type="button" className="button button-primary" onClick={copyPrompt}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Copied" : "Copy prompt"}</button></header>
          <MarkdownContent>{active.body}</MarkdownContent>
        </article>}
      </div>
    </div>
  );
}
