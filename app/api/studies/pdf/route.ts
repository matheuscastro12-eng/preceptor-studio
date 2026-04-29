import { NextRequest, NextResponse } from "next/server";
import { renderRichMarkdown } from "@/lib/markdownExtensions";

async function launchBrowser() {
  // Em produção (Vercel) usa puppeteer-core + chromium-min.
  // Em dev usa puppeteer normal (bundle local).
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    const chromium = (await import("@sparticuz/chromium-min")).default;
    const puppeteer = await import("puppeteer-core");
    const executablePath = await chromium.executablePath(
      "https://github.com/Sparticuz/chromium/releases/download/v148.0.0/chromium-v148.0.0-pack.x64.tar"
    );
    return puppeteer.launch({
      args: chromium.args,
      executablePath,
      headless: true,
    });
  }
  const puppeteer = await import("puppeteer");
  return puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}
import { getScoreColor, RECOMMENDATION_COLORS } from "@/lib/scoreColors";
import { TEAM_COLORS } from "@/lib/teamColors";

export const maxDuration = 90;

type Kind = "study" | "brand" | "commercial" | "thesis" | "execution" | "diagnostic";

const KIND_META: Record<Kind, { title: string; subtitle: string; confidential: boolean }> = {
  study: { title: "Estudo Estratégico", subtitle: "Análise estruturada e plano de execução", confidential: false },
  brand: { title: "Briefing de Marca", subtitle: "Direção criativa para identidade visual", confidential: false },
  commercial: { title: "Plano Comercial e de Tráfego", subtitle: "Estratégia de aquisição e go-to-market", confidential: false },
  thesis: { title: "Tese Interna", subtitle: "Avaliação confidencial de portfólio", confidential: true },
  execution: { title: "Cronograma de Execução", subtitle: "12 semanas em 3 sprints", confidential: false },
  diagnostic: { title: "Diagnóstico em Números", subtitle: "Scores e insights estratégicos", confidential: false },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const kind = (body.kind || "study") as Kind;
    if (!KIND_META[kind]) {
      return NextResponse.json({ error: `Tipo desconhecido: ${kind}` }, { status: 400 });
    }

    const meta = KIND_META[kind];
    const titleProject = body.title || "—";
    const clientName = body.clientName || null;
    const date = new Date(body.completed_at || body.created_at || Date.now()).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    let contentHtml = "";

    if (kind === "diagnostic") {
      contentHtml = renderDiagnosticHtml(body.scores, body.insights || []);
    } else if (kind === "execution") {
      contentHtml = renderExecutionHtml(body.execution_plan);
    } else {
      const md = body.output_md;
      if (!md) {
        return NextResponse.json({ error: "output_md obrigatório" }, { status: 400 });
      }
      contentHtml = renderRichMarkdown(md);
    }

    const fullHtml = buildPDFTemplate({
      contentHtml,
      titleProject,
      clientName,
      date,
      kindTitle: meta.title,
      kindSubtitle: meta.subtitle,
      confidential: meta.confidential,
    });

    const browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "18mm", right: "18mm" },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-family: Inter, sans-serif; width: 100%; padding: 5mm 18mm 0; font-size: 8px; color: #94a8d0; display: flex; justify-content: space-between;">
          <span><strong style="color:#0a1f44">PRECEPTOR!</strong> · Venture Studio</span>
          <span>${meta.title}${meta.confidential ? " · CONFIDENCIAL" : ""}</span>
        </div>
      `,
      footerTemplate: `
        <div style="font-family: Inter, sans-serif; width: 100%; padding: 0 18mm 5mm; font-size: 8px; color: #94a8d0; display: flex; justify-content: space-between;">
          <span>${escapeHtml(clientName || "")}</span>
          <span>Página <span class="pageNumber"></span> / <span class="totalPages"></span></span>
        </div>
      `,
    });
    await browser.close();

    return new NextResponse(pdf as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${kind}-${slug(clientName || titleProject)}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("Erro ao gerar PDF:", err);
    return NextResponse.json({ error: err.message || "Erro interno" }, { status: 500 });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────
function slug(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 60);
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c));
}

function renderDiagnosticHtml(scores: any, insights: any[]): string {
  const cf = scores?.client_facing;
  if (!cf) return `<p>Scores não disponíveis.</p>`;

  const dims = [
    { key: "mercado", label: "Mercado" },
    { key: "execucao", label: "Execução" },
    { key: "diferenciacao", label: "Diferenciação" },
    { key: "modelo_receita", label: "Modelo de Receita" },
    { key: "risco_regulatorio", label: "Risco Regulatório" },
  ];

  const overall = cf.overall ?? 0;
  const overallColor = getScoreColor(overall);
  const radius = 56;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (overall / 100) * circ;

  // Radar polygon
  const cx = 160, cy = 160, R = 110;
  const points = dims
    .map((d, i) => {
      const v = cf[d.key] ?? 0;
      const angle = (Math.PI * 2 * i) / dims.length - Math.PI / 2;
      const r = R * (v / 100);
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    })
    .join(" ");

  const grid = [25, 50, 75, 100]
    .map((level) => {
      const pts = dims
        .map((_, i) => {
          const angle = (Math.PI * 2 * i) / dims.length - Math.PI / 2;
          const r = R * (level / 100);
          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
        })
        .join(" ");
      return `<polygon points="${pts}" fill="none" stroke="#e2e8f0" stroke-width="1" />`;
    })
    .join("");

  const labels = dims
    .map((d, i) => {
      const angle = (Math.PI * 2 * i) / dims.length - Math.PI / 2;
      const lx = cx + R * 1.18 * Math.cos(angle);
      const ly = cy + R * 1.18 * Math.sin(angle);
      return `<text x="${lx}" y="${ly}" text-anchor="middle" font-size="10" font-weight="700" fill="#0F1729" font-family="Inter">${d.label}</text>
              <text x="${lx}" y="${ly + 12}" text-anchor="middle" font-size="10" font-weight="800" fill="#5D57EB" font-family="Inter">${cf[d.key] ?? 0}</text>`;
    })
    .join("");

  const cards = dims
    .map((d) => {
      const v = cf[d.key] ?? 0;
      const c = getScoreColor(v);
      return `<div class="score-card">
        <div class="score-card-head">
          <span class="score-card-label">${d.label}</span>
          <span class="score-card-chip" style="background:${c.soft};color:${c.bg}">${c.label}</span>
        </div>
        <div class="score-card-value" style="color:${c.bg}">${v}<span>/100</span></div>
        <div class="score-card-bar"><div style="width:${v}%;background:${c.bg}"></div></div>
        ${cf.rationale?.[d.key] ? `<p class="score-card-hint">${escapeHtml(cf.rationale[d.key])}</p>` : ""}
      </div>`;
    })
    .join("");

  const insightsHtml = (insights || [])
    .map((it) => {
      const colors: Record<string, { bg: string; border: string; chip: string }> = {
        force: { bg: "#D1FAE5", border: "#10B981", chip: "#10B981" },
        fragility: { bg: "#FEE2E2", border: "#E11D48", chip: "#E11D48" },
        insight: { bg: "#EBF9FA", border: "#52E1E7", chip: "#06122A" },
        warning: { bg: "#FEF3C7", border: "#F59E0B", chip: "#F59E0B" },
      };
      const labelMap: Record<string, string> = { force: "FORÇA", fragility: "FRAGILIDADE", insight: "INSIGHT", warning: "ATENÇÃO" };
      const c = colors[it.type] || colors.insight;
      const ch = c.chip === "#06122A" ? "#52E1E7" : "white";
      return `<div class="insight" style="background:${c.bg};border-left-color:${c.border}">
        <span class="insight-chip" style="background:${c.chip};color:${ch}">${labelMap[it.type] || "INSIGHT"}</span>
        <h4>${escapeHtml(it.title || "")}</h4>
        <p>${escapeHtml(it.body || "")}</p>
      </div>`;
    })
    .join("");

  return `
    <div class="diagnostic">
      <h1>Diagnóstico em Números</h1>
      <div class="diagnostic-overall">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="${radius}" fill="none" stroke="#e2e8f0" stroke-width="10" />
          <circle cx="80" cy="80" r="${radius}" fill="none" stroke="${overallColor.bg}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${offset}" transform="rotate(-90 80 80)" />
          <text x="80" y="78" text-anchor="middle" font-size="36" font-weight="900" fill="${overallColor.bg}" font-family="Inter">${overall}</text>
          <text x="80" y="100" text-anchor="middle" font-size="11" font-weight="700" fill="#94A3B8" font-family="Inter" letter-spacing="2">/100</text>
        </svg>
        <div class="diagnostic-overall-info">
          <div class="eyebrow">Score Geral</div>
          <div class="diagnostic-overall-label" style="color:${overallColor.bg}">${overallColor.label}</div>
          <p>${cf.rationale?.overall ? escapeHtml(cf.rationale.overall) : "Média ponderada das 5 dimensões."}</p>
        </div>
      </div>

      <div class="diagnostic-grid">
        <svg class="diagnostic-radar" width="320" height="320" viewBox="0 0 320 320">
          ${grid}
          <polygon points="${points}" fill="rgba(82,225,231,0.18)" stroke="#5D57EB" stroke-width="2" />
          ${labels}
        </svg>
        <div class="diagnostic-cards">${cards}</div>
      </div>

      ${insightsHtml ? `<h2 style="margin-top:10mm">Insights-Chave</h2><div class="insights-grid">${insightsHtml}</div>` : ""}
    </div>
  `;
}

function renderExecutionHtml(plan: any): string {
  if (!plan?.sprints) return `<p>Cronograma não disponível.</p>`;
  return plan.sprints
    .map((sp: any) => {
      const tasks = (sp.tasks || [])
        .map((t: any) => {
          const member = TEAM_COLORS[t.assignee];
          const avatar = member
            ? `<span class="task-avatar" style="background:${member.color};color:${member.textColor}">${member.initials}</span>`
            : `<span class="task-avatar task-avatar-empty">—</span>`;
          const milestone = t.milestone ? `<span class="task-milestone">★</span>` : "";
          return `<div class="task">
            ${avatar}
            <div class="task-body">
              <div class="task-title">${milestone}${escapeHtml(t.title || "")}</div>
              ${t.description ? `<p class="task-desc">${escapeHtml(t.description)}</p>` : ""}
              <div class="task-meta">${member ? member.name : "sem responsável"} · ${t.estimated_hours ?? "?"}h</div>
            </div>
          </div>`;
        })
        .join("");
      return `<section class="sprint">
        <div class="sprint-head">
          <span class="sprint-num">Sprint ${sp.number}</span>
          <span class="sprint-weeks">Semanas ${sp.weeks}</span>
        </div>
        <h2 class="sprint-name">${escapeHtml(sp.name || "")}</h2>
        ${sp.objective ? `<p class="sprint-obj">${escapeHtml(sp.objective)}</p>` : ""}
        <div class="task-list">${tasks}</div>
      </section>`;
    })
    .join("");
}

function buildPDFTemplate(opts: {
  contentHtml: string;
  titleProject: string;
  clientName: string | null;
  date: string;
  kindTitle: string;
  kindSubtitle: string;
  confidential: boolean;
}): string {
  const watermark = opts.confidential
    ? `<div class="watermark">CONFIDENCIAL · INTERNO</div>`
    : "";
  const cover = `
    <div class="cover">
      <div class="cover-brand"><strong>PRECEPTOR!</strong> &nbsp; VENTURE STUDIO</div>
      <div style="margin-top: 70mm;">
        <div class="cover-title">${escapeHtml(opts.kindTitle)}</div>
        <div class="cover-line"></div>
        <div class="cover-subtitle">${escapeHtml(opts.titleProject)}</div>
        ${opts.clientName ? `<div class="cover-client">Cliente: <strong style="color:white">${escapeHtml(opts.clientName)}</strong></div>` : ""}
        <div class="cover-kind-sub">${escapeHtml(opts.kindSubtitle)}</div>
      </div>
      <div class="cover-meta">
        <strong>${opts.confidential ? "CONFIDENCIAL · INTERNO" : "DOCUMENTO ESTRATÉGICO"}</strong><br>
        ${opts.date} &nbsp;·&nbsp; ${opts.confidential ? "Não compartilhar" : "Confidencial"}
      </div>
    </div>
  `;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(opts.kindTitle)}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', system-ui, sans-serif; color: #0f1729; line-height: 1.7; font-size: 10pt; }

  ${opts.confidential ? `
  .watermark {
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg);
    font-size: 60pt; font-weight: 900; color: rgba(225, 29, 72, 0.06);
    z-index: 0; pointer-events: none; letter-spacing: 0.1em;
  }` : ""}

  .cover { page-break-after: always; background: ${opts.confidential ? "#3B0C18" : "#06122a"}; color: white; padding: 60mm 25mm 25mm; height: 257mm; position: relative; overflow: hidden; }
  .cover::before { content: ''; position: absolute; top: -50mm; right: -50mm; width: 180mm; height: 180mm; background: ${opts.confidential ? "#5C0F1F" : "#0a1f44"}; border-radius: 50%; }
  .cover::after { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4mm; background: ${opts.confidential ? "#E11D48" : "#52e1e7"}; }
  .cover-brand { position: absolute; top: 20mm; left: 25mm; font-size: 9pt; color: #94a8d0; letter-spacing: 2px; z-index: 2; }
  .cover-brand strong { color: white; }
  .cover-title { font-size: 32pt; font-weight: 800; margin-bottom: 4mm; z-index: 2; position: relative; }
  .cover-line { width: 30mm; height: 1mm; background: ${opts.confidential ? "#E11D48" : "#52e1e7"}; margin-bottom: 4mm; }
  .cover-subtitle { font-size: 16pt; color: ${opts.confidential ? "#FCA5A5" : "#a8eff2"}; margin-bottom: 12mm; font-weight: 500; }
  .cover-client { font-size: 11pt; color: white; margin-bottom: 2mm; }
  .cover-kind-sub { font-size: 10pt; color: ${opts.confidential ? "#FCA5A5" : "#94a8d0"}; margin-top: 6mm; font-style: italic; }
  .cover-meta { position: absolute; bottom: 25mm; left: 25mm; font-size: 9pt; color: ${opts.confidential ? "#FCA5A5" : "#94a8d0"}; }
  .cover-meta strong { color: ${opts.confidential ? "#FCA5A5" : "#52e1e7"}; letter-spacing: 1px; }

  .content { padding: 0; position: relative; z-index: 1; }
  h1 { font-size: 22pt; font-weight: 800; color: #0a1f44; margin: 0 0 5mm; }
  h2 { font-size: 16pt; font-weight: 800; color: #0a1f44; margin: 8mm 0 3mm; padding-bottom: 2mm; border-bottom: 0.5mm solid #52e1e7; page-break-after: avoid; }
  h3 { font-size: 12pt; font-weight: 700; color: #5d57eb; margin: 5mm 0 2mm; page-break-after: avoid; }
  p { margin-bottom: 3mm; font-size: 10pt; }
  ul, ol { margin-bottom: 3mm; padding-left: 6mm; }
  li { margin-bottom: 1.5mm; font-size: 10pt; }
  li::marker { color: #52e1e7; }
  strong { color: #0a1f44; font-weight: 700; }
  em { color: #475569; }
  table { border-collapse: collapse; margin: 4mm 0; width: 100%; page-break-inside: avoid; border: 0.3mm solid #e2e8f0; }
  th, td { border: 0.3mm solid #e2e8f0; padding: 2mm 3mm; text-align: left; font-size: 9pt; }
  th { background: #0a1f44; color: #52e1e7; font-weight: 600; }
  tr:nth-child(even) td { background: #f8fafc; }
  blockquote { border-left: 1mm solid #52e1e7; padding-left: 4mm; margin: 4mm 0; color: #475569; font-style: italic; background: #F8FAFC; padding: 2mm 4mm; }
  code { background: #f1f5f9; padding: 0.5mm 1.5mm; border-radius: 1mm; font-family: monospace; font-size: 9pt; }
  hr { border: none; border-top: 0.3mm solid #e2e8f0; margin: 6mm 0; }

  /* Callouts */
  .callout { border-left: 1mm solid; border-radius: 2mm; padding: 3mm 4mm 3.5mm; margin: 4mm 0; page-break-inside: avoid; }
  .callout-label { display: inline-block; font-size: 7pt; font-weight: 800; letter-spacing: 1.5px; padding: 0.5mm 2mm; border-radius: 1mm; margin-bottom: 1.5mm; }
  .callout-insight { background: #EBF9FA; border-left-color: #52E1E7; color: #064151; }
  .callout-insight .callout-label { background: #52E1E7; color: #06122A; }
  .callout-warning { background: #FEF3C7; border-left-color: #F59E0B; color: #78350F; }
  .callout-warning .callout-label { background: #F59E0B; color: white; }

  /* Diagnostic */
  .diagnostic-overall { display: flex; gap: 8mm; align-items: center; padding: 6mm; background: linear-gradient(135deg, #f0f9ff 0%, #fdf4ff 100%); border-radius: 3mm; margin-bottom: 6mm; }
  .diagnostic-overall-info { flex: 1; }
  .eyebrow { font-size: 7pt; font-weight: 800; letter-spacing: 2px; color: #5D57EB; text-transform: uppercase; margin-bottom: 1mm; }
  .diagnostic-overall-label { font-size: 22pt; font-weight: 900; line-height: 1; margin-bottom: 2mm; }
  .diagnostic-overall-info p { font-size: 9pt; color: #475569; }
  .diagnostic-grid { display: grid; grid-template-columns: 100mm 1fr; gap: 6mm; align-items: center; margin-bottom: 6mm; }
  .diagnostic-radar { width: 100%; max-width: 95mm; }
  .diagnostic-cards { display: flex; flex-direction: column; gap: 2mm; }
  .score-card { background: white; border: 0.3mm solid #e2e8f0; border-radius: 2mm; padding: 3mm; }
  .score-card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5mm; }
  .score-card-label { font-size: 7pt; font-weight: 800; letter-spacing: 1.5px; color: #94A3B8; text-transform: uppercase; }
  .score-card-chip { font-size: 6.5pt; font-weight: 800; padding: 0.5mm 1.5mm; border-radius: 1mm; text-transform: uppercase; letter-spacing: 1px; }
  .score-card-value { font-size: 18pt; font-weight: 900; line-height: 1; }
  .score-card-value span { font-size: 10pt; color: #94A3B8; font-weight: 700; }
  .score-card-bar { width: 100%; height: 0.7mm; background: #e2e8f0; border-radius: 999px; overflow: hidden; margin-top: 2mm; }
  .score-card-bar > div { height: 100%; }
  .score-card-hint { font-size: 7.5pt; color: #475569; margin-top: 2mm; line-height: 1.4; }

  .insights-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; margin-top: 3mm; }
  .insight { border-left: 1mm solid; padding: 3mm 4mm; border-radius: 2mm; page-break-inside: avoid; }
  .insight-chip { display: inline-block; font-size: 7pt; font-weight: 900; letter-spacing: 1.5px; padding: 0.5mm 2mm; border-radius: 1mm; margin-bottom: 1.5mm; text-transform: uppercase; }
  .insight h4 { font-size: 10pt; font-weight: 700; color: #0a1f44; margin-bottom: 1.5mm; }
  .insight p { font-size: 8.5pt; line-height: 1.5; margin: 0; }

  /* Execution */
  .sprint { page-break-inside: avoid; margin-bottom: 8mm; }
  .sprint-head { display: flex; gap: 3mm; align-items: baseline; }
  .sprint-num { font-size: 8pt; font-weight: 900; color: white; background: #0A1F44; padding: 1mm 2mm; border-radius: 1mm; letter-spacing: 1px; }
  .sprint-weeks { font-size: 8pt; color: #94A3B8; font-weight: 700; letter-spacing: 1px; }
  .sprint-name { font-size: 16pt; font-weight: 800; color: #0a1f44; margin: 2mm 0 1mm; border: none; padding: 0; }
  .sprint-obj { font-size: 9pt; color: #475569; font-style: italic; margin-bottom: 4mm; }
  .task-list { display: flex; flex-direction: column; gap: 2mm; }
  .task { display: flex; gap: 3mm; align-items: flex-start; padding: 2.5mm 3mm; background: #F8FAFC; border-radius: 2mm; page-break-inside: avoid; }
  .task-avatar { width: 7mm; height: 7mm; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 7pt; font-weight: 900; flex-shrink: 0; }
  .task-avatar-empty { background: #e2e8f0; color: #94A3B8; }
  .task-body { flex: 1; }
  .task-title { font-size: 10pt; font-weight: 700; color: #0a1f44; margin-bottom: 0.5mm; }
  .task-milestone { color: #F59E0B; margin-right: 1mm; }
  .task-desc { font-size: 8.5pt; color: #475569; margin: 1mm 0; }
  .task-meta { font-size: 7pt; color: #94A3B8; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; }
</style>
</head>
<body>
${watermark}
${cover}
<div class="content">
  ${opts.contentHtml}
</div>
</body>
</html>`;
}
