"use client";

import { renderRichMarkdown } from "@/lib/markdownExtensions";

export function MarkdownView({ md }: { md: string | null | undefined }) {
  const html = renderRichMarkdown(md);
  return <div className="prose-study" dangerouslySetInnerHTML={{ __html: html }} />;
}
