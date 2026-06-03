import { marked, Renderer } from "marked";
import type { Tokens } from "marked";
import DOMPurify from "isomorphic-dompurify";

// Configuração de sanitização: permite o HTML rico que nossos renderers geram
// (callouts, tabelas, headings com id) mas remove scripts, handlers on*, etc.
const SANITIZE_CONFIG = {
  ADD_ATTR: ["id", "target", "colspan", "rowspan"],
  ALLOWED_URI_REGEXP:
    /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
};

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, SANITIZE_CONFIG) as unknown as string;
}

export interface MarkdownHeading {
  depth: number;
  text: string;
  id: string;
}

type BlockTone =
  | "insight"
  | "warning"
  | "decision"
  | "evidence"
  | "risk"
  | "summary"
  | "next-actions";

const BLOCK_META: Record<BlockTone, { label: string; className: string }> = {
  insight: { label: "Insight", className: "callout callout-insight" },
  warning: { label: "Atenção", className: "callout callout-warning" },
  decision: { label: "Decisão", className: "md-block md-block-decision" },
  evidence: { label: "Evidências", className: "md-block md-block-evidence" },
  risk: { label: "Risco", className: "md-block md-block-risk" },
  summary: { label: "Leitura rápida", className: "md-block md-block-summary" },
  "next-actions": { label: "Próximas ações", className: "md-block md-block-actions" },
};

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c
  ));
}

function stripMarkdown(s: string) {
  return s
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

export function slugifyHeading(text: string) {
  return stripMarkdown(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "secao";
}

function uniqueSlug(base: string, counts: Map<string, number>) {
  const count = counts.get(base) || 0;
  counts.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

function splitTitleAndBody(body: string) {
  const lines = body.trim().split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return { title: "", rest: "" };

  const first = lines[0].replace(/^#+\s*/, "").trim();
  const firstLooksLikeList = /^[-*+]\s+/.test(first) || /^\d+\.\s+/.test(first);
  if (firstLooksLikeList || lines.length === 1) {
    return { title: "", rest: body.trim() };
  }

  return {
    title: stripMarkdown(first),
    rest: lines.slice(1).join("\n").trim(),
  };
}

function renderInnerMarkdown(body: string) {
  if (!body.trim()) return "";
  return marked.parse(body.trim(), { async: false, gfm: true }) as string;
}

function renderTextBlock(tone: BlockTone, body: string) {
  const meta = BLOCK_META[tone];
  const { title, rest } = splitTitleAndBody(body);
  const legacy = tone === "insight" || tone === "warning";

  return `<div class="${meta.className}">
<div class="${legacy ? "callout-label" : "md-block-label"}">${meta.label}</div>
${title ? `<h4>${escapeHtml(title)}</h4>` : ""}
<div class="${legacy ? "callout-body" : "md-block-body"}">
${renderInnerMarkdown(rest || body)}
</div>
</div>`;
}

function renderMetricBlock(body: string) {
  const rows = body
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-*]\s+/, ""))
    .map((line) => line.split("|").map((part) => part.trim()))
    .filter((parts) => parts.length >= 2);

  if (rows.length === 0) return renderTextBlock("evidence", body);

  const cards = rows
    .map(([label, value, note]) => `<div class="metric-card">
<div class="metric-label">${escapeHtml(label)}</div>
<div class="metric-value">${escapeHtml(value)}</div>
${note ? `<div class="metric-note">${escapeHtml(note)}</div>` : ""}
</div>`)
    .join("");

  return `<div class="metric-grid">${cards}</div>`;
}

// Pre-processa blocos customizados antes do marked renderizar o documento.
export function preprocessCallouts(md: string): string {
  return md
    .replace(/:::metric\s*([\s\S]*?):::/g, (_m, body) => renderMetricBlock(body))
    .replace(/:::(insight|warning|decision|evidence|risk|summary|next-actions)\s*([\s\S]*?):::/g, (_m, tone: BlockTone, body) =>
      renderTextBlock(tone, body)
    );
}

function createRenderer() {
  const renderer = new Renderer();
  const counts = new Map<string, number>();

  renderer.heading = function heading(this: Renderer, token: Tokens.Heading) {
    const text = this.parser.parseInline(token.tokens);
    const raw = stripMarkdown(token.text);
    const id = uniqueSlug(slugifyHeading(raw), counts);
    return `<h${token.depth} id="${id}">${text}</h${token.depth}>`;
  };

  return renderer;
}

export function extractMarkdownHeadings(
  md: string | null | undefined,
  maxDepth = 2
): MarkdownHeading[] {
  if (!md) return [];
  const counts = new Map<string, number>();
  return Array.from(md.matchAll(/^(#{2,3})\s+(.+)$/gm))
    .map((match) => {
      const depth = match[1].length;
      const text = stripMarkdown(match[2]);
      return {
        depth,
        text,
        id: uniqueSlug(slugifyHeading(text), counts),
      };
    })
    .filter((heading) => heading.depth <= maxDepth);
}

export function renderRichMarkdown(md: string | null | undefined): string {
  if (!md) return "";
  const processed = preprocessCallouts(md);
  const html = marked.parse(processed, {
    async: false,
    gfm: true,
    breaks: false,
    renderer: createRenderer(),
  }) as string;
  return sanitizeHtml(html);
}
