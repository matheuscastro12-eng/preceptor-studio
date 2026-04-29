import { marked } from "marked";

// Pré-processa callouts customizados :::insight ... :::  e :::warning ... :::
export function preprocessCallouts(md: string): string {
  return md
    .replace(/:::insight\s*([\s\S]*?):::/g, (_m, body) => {
      return `<div class="callout callout-insight">
<span class="callout-label">INSIGHT</span>
<div class="callout-body">

${body.trim()}

</div>
</div>`;
    })
    .replace(/:::warning\s*([\s\S]*?):::/g, (_m, body) => {
      return `<div class="callout callout-warning">
<span class="callout-label">ATENÇÃO</span>
<div class="callout-body">

${body.trim()}

</div>
</div>`;
    });
}

export function renderRichMarkdown(md: string | null | undefined): string {
  if (!md) return "";
  const processed = preprocessCallouts(md);
  return marked.parse(processed) as string;
}
