"use client";

import { useMemo } from "react";
import { extractMarkdownHeadings, renderRichMarkdown } from "@/lib/markdownExtensions";

export function MarkdownView({
  md,
  withNav = false,
}: {
  md: string | null | undefined;
  withNav?: boolean;
}) {
  const html = useMemo(() => renderRichMarkdown(md), [md]);
  const headings = useMemo(() => extractMarkdownHeadings(md, 2), [md]);

  if (!withNav || headings.length < 3) {
    return <div className="prose-study" dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return (
    <div className="document-reader">
      <article className="prose-study min-w-0" dangerouslySetInnerHTML={{ __html: html }} />
      <aside className="document-toc" aria-label="Navegação do documento">
        <div className="document-toc-title">Neste output</div>
        <nav>
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className={heading.depth === 3 ? "document-toc-child" : undefined}
            >
              {heading.text}
            </a>
          ))}
        </nav>
      </aside>
    </div>
  );
}
