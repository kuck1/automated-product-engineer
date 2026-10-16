"use client";

import { ExternalLink } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

function resolveHref(href: string | undefined, sourceBaseUrl?: string) {
  if (!href || !sourceBaseUrl || /^(?:[a-z]+:|#|\/)/i.test(href)) return href;
  return `${sourceBaseUrl.replace(/\/$/, "")}/${href.replace(/^\.\//, "")}`;
}

export function MarkdownContent({ children, sourceBaseUrl }: { children: string; sourceBaseUrl?: string }) {
  const components: Components = {
    a: ({ children: label, href, ...props }) => {
      const resolved = resolveHref(href, sourceBaseUrl);
      const external = resolved?.startsWith("http");
      return <a href={resolved} {...props} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>{label}{external && <ExternalLink aria-hidden="true" size={12} />}</a>;
    },
  };

  return <div className="markdown-content"><ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{children}</ReactMarkdown></div>;
}
