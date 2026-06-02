"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  Download,
  LayoutList,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, getQuestions } from "@/lib/questions";
import { StudyWithClient, Task } from "@/lib/store";
import { listTasksRemote } from "@/lib/storeApi";
import { OutputHeader, OutputMetric } from "./OutputHeader";

type PromptMode = "executive" | "consultative" | "kickoff";
type AuditStatus = "ok" | "warning" | "danger";

interface AuditItem {
  label: string;
  detail: string;
  status: AuditStatus;
}

const PROMPT_MODES: Record<
  PromptMode,
  {
    label: string;
    short: string;
    description: string;
    deckSize: string;
    tone: string;
    objective: string;
    outline: string[];
  }
> = {
  consultative: {
    label: "Consultivo",
    short: "Recomendado",
    description: "Deck profundo para explicar diagnostico, estrategia e plano de execucao.",
    deckSize: "14 a 18 slides",
    tone: "consultivo, denso, objetivo e acionavel",
    objective: "Criar uma apresentacao consultiva que leve o cliente de contexto a decisao e execucao.",
    outline: [
      "Abertura e objetivo da apresentacao",
      "Resumo executivo da leitura estrategica",
      "Contexto do mercado e da oportunidade",
      "Problema central e urgencia",
      "Perfil de cliente e demanda",
      "Diagnostico do negocio",
      "Forcas estruturais do projeto",
      "Fragilidades do projeto sem julgamento pessoal",
      "Posicionamento e brecha competitiva",
      "Oferta, pricing e modelo de receita",
      "Canais comerciais prioritarios",
      "Estrategia de marca e narrativa",
      "Roadmap por sprints",
      "Riscos do projeto e mitigacoes",
      "Decisoes pendentes",
      "Proximos passos",
    ],
  },
  executive: {
    label: "Executivo",
    short: "Direto",
    description: "Deck mais curto para decisores, com menos detalhe operacional.",
    deckSize: "10 a 12 slides",
    tone: "executivo, sintetico, assertivo e visual",
    objective: "Criar uma apresentacao curta para alinhar direcao, tese de oportunidade e proximos passos.",
    outline: [
      "Resumo executivo",
      "Oportunidade em uma frase",
      "Mercado e timing",
      "Problema que a solucao resolve",
      "Cliente-alvo e demanda",
      "Diagnostico do negocio",
      "Estrategia recomendada",
      "Plano comercial",
      "Roadmap por sprints",
      "Riscos e mitigacoes",
      "Proximos passos",
    ],
  },
  kickoff: {
    label: "Kickoff",
    short: "Operacao",
    description: "Deck para iniciar execucao, alinhar entregas e organizar sprints.",
    deckSize: "9 a 12 slides",
    tone: "operacional, claro, colaborativo e orientado a entrega",
    objective: "Criar uma apresentacao de kickoff para alinhar escopo, sprints, cadencia e entregaveis.",
    outline: [
      "Objetivo do projeto",
      "Resumo do diagnostico",
      "Escopo de execucao",
      "Principais entregaveis",
      "Sprint 1",
      "Sprint 2",
      "Sprint 3",
      "Riscos e dependencias",
      "Rituais de acompanhamento",
      "Decisoes pendentes",
      "Proximos passos imediatos",
    ],
  },
};

const PERSONAL_PATTERNS = [
  "fundador",
  "empreendedor",
  "experiencia direta",
  "experiencia setorial",
  "experiencia no setor",
  "experiencia previa",
  "perfil pessoal",
  "pessoalidade",
  "pessoal",
  "resiliencia",
  "runway",
  "dedicacao",
  "tempo disponivel",
  "compromisso",
  "capital disponivel",
  "capacidade do fundador",
  "nenhuma experiencia",
];

const INTERNAL_TEAM_NAMES = [
  "matheus",
  "luciano",
  "ana flavia",
  "ana flávia",
  "thiago",
  "leonardo",
  "marco",
  "kalley",
];

function normalizeSearch(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isPersonalContent(text: string | null | undefined) {
  const normalized = normalizeSearch(text || "");
  return PERSONAL_PATTERNS.some((pattern) => normalized.includes(pattern));
}

function redactClientName(text: string, clientName?: string | null) {
  if (!clientName) return text;
  return text.replace(new RegExp(escapeRegExp(clientName), "gi"), "o projeto");
}

function redactInternalTeam(text: string) {
  return INTERNAL_TEAM_NAMES.reduce((acc, name) => {
    return acc.replace(new RegExp(`\\b${escapeRegExp(name)}\\b`, "gi"), "time de execucao");
  }, text);
}

function sanitizeTextForSlides(text: string | null | undefined, clientName?: string | null) {
  const clean = redactInternalTeam(redactClientName(text || "", clientName));
  return clean
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .filter((block) => !isPersonalContent(block))
    .join("\n\n");
}

function sanitizeObjectForSlides(value: any, clientName?: string | null): any {
  if (value === undefined || value === null) return value;
  if (typeof value === "string") return sanitizeTextForSlides(value, clientName);
  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeObjectForSlides(item, clientName))
      .filter((item) => {
        if (!item) return false;
        if (typeof item === "string") return item.trim().length > 0;
        if (typeof item === "object") return Object.keys(item).length > 0;
        return true;
      });
  }
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !/internal|thesis|tese|fundador|pessoal|experiencia|resiliencia|runway/i.test(key))
        .map(([key, item]) => [key, sanitizeObjectForSlides(item, clientName)])
        .filter(([, item]) => {
          if (item === undefined || item === null || item === "") return false;
          if (Array.isArray(item)) return item.length > 0;
          if (typeof item === "object") return Object.keys(item).length > 0;
          return true;
        })
    );
  }
  return value;
}

function valueToText(value: any): string {
  if (value === undefined || value === null || value === "") return "";
  if (Array.isArray(value)) return value.map(valueToText).filter(Boolean).join(", ");
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

function section(title: string, body: string | null | undefined) {
  const clean = (body || "").trim();
  if (!clean) return `## ${title}\nNao disponivel.`;
  return `## ${title}\n${clean}`;
}

function buildQuestionnaireBlock(study: StudyWithClient) {
  const answers = study.answers || {};
  const questions = getQuestions(study.category);
  const known = new Set(questions.map((question) => question.id));
  const clientName = study.client?.name || null;

  const regularAnswers = questions
    .filter((question) => !isPersonalContent(`${question.id} ${question.section} ${question.question}`))
    .map((question) => {
      const value = sanitizeTextForSlides(valueToText(answers[question.id]), clientName);
      if (!value) return null;
      return `### ${question.section} - ${question.question}\n${value}`;
    })
    .filter(Boolean);

  const extraAnswers = Object.keys(answers)
    .filter((key) => !known.has(key))
    .filter((key) => !key.startsWith("__pdf"))
    .filter((key) => !/internal|tese/i.test(key))
    .filter((key) => !isPersonalContent(key))
    .map((key) => {
      const value = sanitizeTextForSlides(valueToText(answers[key]), clientName);
      return value ? `### ${key}\n${value}` : null;
    })
    .filter(Boolean);

  return [...regularAnswers, ...extraAnswers].join("\n\n") || "Nao disponivel.";
}

function buildPdfBlock(study: StudyWithClient) {
  const answers = study.answers || {};
  const clientName = study.client?.name || null;
  const pdfMeta = sanitizeTextForSlides(valueToText(answers.__pdf_meta), clientName);
  const pdfContext = sanitizeTextForSlides(valueToText(answers.__pdf_context), clientName);
  const pdfSuggestions = sanitizeTextForSlides(valueToText(answers.__pdf_suggestions), clientName);

  return [
    pdfMeta ? `### Metadados do PDF\n${pdfMeta}` : null,
    pdfSuggestions ? `### Campos pre-preenchidos pelo PDF\n${pdfSuggestions}` : null,
    pdfContext ? `### Conteudo extraido do PDF\n${pdfContext}` : null,
  ]
    .filter(Boolean)
    .join("\n\n") || "Nao disponivel.";
}

function buildTasksBlock(tasks: Task[], clientName?: string | null) {
  if (tasks.length === 0) return "Nao disponivel.";
  return tasks
    .map((task) => {
      const details = [`Sprint ${task.sprint}`, task.milestone ? "Marco" : null]
        .filter(Boolean)
        .join(" | ");
      const title = sanitizeTextForSlides(task.title, clientName);
      const description = sanitizeTextForSlides(task.description, clientName);
      return `- ${details}: ${title}${description ? `\n  ${description}` : ""}`;
    })
    .join("\n");
}

function publicArtifactsBlock(study: StudyWithClient) {
  const clientName = study.client?.name || null;
  const artifacts = Object.entries(study.artifacts || {}).filter(
    ([key]) => !/internal|thesis|tese/i.test(key)
  );
  if (artifacts.length === 0) return "Nao disponivel.";
  return JSON.stringify(sanitizeObjectForSlides(Object.fromEntries(artifacts), clientName), null, 2);
}

function buildOutlineBlock(mode: PromptMode) {
  return PROMPT_MODES[mode].outline
    .map((title, index) => `${index + 1}. ${title}`)
    .join("\n");
}

function buildSlidePrompt(study: StudyWithClient, tasks: Task[], mode: PromptMode) {
  const category = CATEGORIES.find((item) => item.value === study.category);
  const clientName = study.client?.name || null;
  const config = PROMPT_MODES[mode];
  const safeInsights = (study.insights_chave || []).filter((insight) => {
    return !isPersonalContent(`${insight.title} ${insight.body}`);
  });
  const publicScores = study.scores?.client_facing
    ? {
        mercado: study.scores.client_facing.mercado,
        execucao: study.scores.client_facing.execucao,
        diferenciacao: study.scores.client_facing.diferenciacao,
        modelo_receita: study.scores.client_facing.modelo_receita,
        risco_regulatorio: study.scores.client_facing.risco_regulatorio,
        overall: study.scores.client_facing.overall,
      }
    : null;

  const clientFacingData = {
    title: study.title,
    category: category?.label || study.category,
    created_at: study.created_at,
    completed_at: study.completed_at,
    insights_chave: safeInsights,
    scores_client_facing: publicScores,
  };

  return [
    "Voce e o Claude atuando como estrategista senior de venture studio, consultor de narrativa executiva e arquiteto de decks.",
    "",
    `Modo do deck: ${config.label}.`,
    `Objetivo: ${config.objective}`,
    `Tamanho esperado: ${config.deckSize}.`,
    `Tom: ${config.tone}.`,
    "",
    "Tarefa: criar uma estruturacao estrategica em formato de slides para apresentar ao cliente. Use todos os dados abaixo e transforme em um deck claro, persuasivo e acionavel.",
    "",
    "Regras de confidencialidade:",
    "- Use apenas os dados fornecidos neste prompt.",
    "- Nao use, mencione, solicite ou infira tese interna, recomendacao societaria, scores internos, risco de portfolio interno ou decisao de entrada como socio.",
    "- Nao fale de pessoalidades do cliente/fundador: experiencia individual, perfil pessoal, resiliencia, dedicacao, capital pessoal, compromisso ou historico individual.",
    "- Nao cite nomes, responsaveis internos, horas estimadas, status interno de tarefas ou atribuicoes da equipe Preceptor.",
    "- Se algum dado pessoal aparecer acidentalmente no material, ignore. Transforme lacunas em riscos do projeto, nao em julgamento da pessoa.",
    "- Se algum dado estiver fraco ou ausente, sinalize como lacuna de validacao, sem inventar numeros.",
    "- O tom deve ser consultivo, objetivo e executivo. Sem linguagem generica.",
    "",
    "Formato obrigatorio da resposta:",
    "Para cada slide, use exatamente este bloco:",
    "```md",
    "## Slide N - [titulo assertivo]",
    "Objetivo:",
    "Mensagem central:",
    "Conteudo do slide:",
    "- bullet 1",
    "- bullet 2",
    "- bullet 3",
    "Visual sugerido:",
    "Dados usados:",
    "Speaker notes:",
    "```",
    "",
    "Regras de hierarquia visual:",
    "- Uma mensagem principal por slide.",
    "- Titulo assertivo, nao generico.",
    "- No maximo 3 a 5 bullets por slide.",
    "- Transforme tabelas densas em quadros comparativos, matrizes, linhas do tempo ou cards.",
    "- Destaque numeros e decisoes, mas nao invente metricas.",
    "",
    "Estrutura recomendada do deck:",
    buildOutlineBlock(mode),
    "",
    "Checklist antes de responder:",
    "- O deck nao contem tese interna, scores internos ou decisao societaria.",
    "- O deck nao contem pessoalidades do cliente/fundador.",
    "- O deck nao contem nomes, responsaveis internos, horas ou status interno da equipe Preceptor.",
    "- Cada slide tem uma funcao clara na narrativa.",
    "- Lacunas viram riscos do projeto ou decisoes pendentes.",
    "",
    section("Dados publicos e operacionais do estudo", JSON.stringify(clientFacingData, null, 2)),
    section("Questionario respondido", buildQuestionnaireBlock(study)),
    section("Contexto extraido do PDF", buildPdfBlock(study)),
    section("Estudo estrategico do cliente", sanitizeTextForSlides(study.output_md, clientName)),
    section("Briefing de marca", sanitizeTextForSlides(study.brand_brief_md, clientName)),
    section("Plano comercial e de trafego", sanitizeTextForSlides(study.commercial_plan_md, clientName)),
    section("Cronograma e tarefas de execucao", buildTasksBlock(tasks, clientName)),
    section("Artefatos nao internos", publicArtifactsBlock(study)),
    "",
    "Agora gere a estrutura do deck em Markdown, ja pronta para ser transformada em apresentacao.",
  ].join("\n\n");
}

function extractSection(prompt: string, title: string) {
  const start = prompt.indexOf(`## ${title}`);
  if (start === -1) return "";
  const next = prompt.indexOf("\n\n## ", start + title.length + 4);
  return next === -1 ? prompt.slice(start) : prompt.slice(start, next);
}

function auditPrompt(prompt: string, study: StudyWithClient): AuditItem[] {
  const dataSegment = prompt.slice(Math.max(0, prompt.indexOf("## Dados publicos")));
  const taskSegment = extractSection(prompt, "Cronograma e tarefas de execucao");
  const clientName = study.client?.name || "";
  const normalizedData = normalizeSearch(dataSegment);
  const normalizedTasks = normalizeSearch(taskSegment);

  return [
    {
      label: "Vazamento interno",
      detail: /internal_thesis_md|scores\.internal|potencial_portfolio|risco_reputacional|fit_stack_preceptor/i.test(dataSegment)
        ? "Encontrou campo interno no corpo de dados."
        : "Nenhum campo de tese ou score interno no corpo de dados.",
      status: /internal_thesis_md|scores\.internal|potencial_portfolio|risco_reputacional|fit_stack_preceptor/i.test(dataSegment)
        ? "danger"
        : "ok",
    },
    {
      label: "Pessoalidades",
      detail:
        (clientName && dataSegment.includes(clientName)) || PERSONAL_PATTERNS.some((pattern) => normalizedData.includes(pattern))
          ? "Encontrou nome ou leitura pessoal no corpo do prompt."
          : "Nome do cliente e leituras pessoais removidos do corpo do prompt.",
      status:
        (clientName && dataSegment.includes(clientName)) || PERSONAL_PATTERNS.some((pattern) => normalizedData.includes(pattern))
          ? "danger"
          : "ok",
    },
    {
      label: "Equipe interna",
      detail:
        /responsavel|responsável|status:|\|\s*\d+h\b/i.test(taskSegment) ||
        INTERNAL_TEAM_NAMES.some((name) => normalizedTasks.includes(normalizeSearch(name)))
          ? "Cronograma ainda contem responsavel, status, horas ou nome interno."
          : "Cronograma mostra apenas sprints, marcos, titulos e descricoes.",
      status:
        /responsavel|responsável|status:|\|\s*\d+h\b/i.test(taskSegment) ||
        INTERNAL_TEAM_NAMES.some((name) => normalizedTasks.includes(normalizeSearch(name)))
          ? "danger"
          : "ok",
    },
    {
      label: "Formato do Claude",
      detail: prompt.includes("Formato obrigatorio da resposta") && prompt.includes("Dados usados:")
        ? "Resposta do Claude recebeu schema fixo por slide."
        : "Falta schema fixo para os slides.",
      status: prompt.includes("Formato obrigatorio da resposta") && prompt.includes("Dados usados:") ? "ok" : "warning",
    },
    {
      label: "Dados base",
      detail: study.output_md
        ? "Estudo estrategico incluido como fonte principal."
        : "Estudo estrategico ausente, deck pode ficar superficial.",
      status: study.output_md ? "ok" : "warning",
    },
    {
      label: "Tamanho",
      detail:
        prompt.length > 120000
          ? "Prompt muito longo, considere resumir o PDF antes de colar."
          : "Tamanho adequado para um briefing completo.",
      status: prompt.length > 120000 ? "warning" : "ok",
    },
  ];
}

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function StatusIcon({ status }: { status: AuditStatus }) {
  if (status === "ok") return <CheckCircle2 className="w-4 h-4 text-success" />;
  return <AlertTriangle className={`w-4 h-4 ${status === "danger" ? "text-danger" : "text-warning"}`} />;
}

function statusClass(status: AuditStatus) {
  if (status === "ok") return "border-success/25 bg-success-soft/50";
  if (status === "danger") return "border-danger/25 bg-danger-soft/50";
  return "border-warning/25 bg-warning-soft/50";
}

export function SlidePromptView({ study }: { study: StudyWithClient }) {
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<PromptMode>("consultative");
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    listTasksRemote(study.id).then(setTasks);
  }, [study.id]);

  const prompt = useMemo(() => buildSlidePrompt(study, tasks, mode), [study, tasks, mode]);
  const audit = useMemo(() => auditPrompt(prompt, study), [prompt, study]);
  const safeCount = audit.filter((item) => item.status === "ok").length;
  const hasDanger = audit.some((item) => item.status === "danger");
  const selectedMode = PROMPT_MODES[mode];

  async function copyPrompt() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const metrics: OutputMetric[] = [
    { label: "Modo", value: selectedMode.label, hint: selectedMode.short, tone: "accent" },
    { label: "Seguranca", value: `${safeCount}/${audit.length}`, hint: hasDanger ? "revisar" : "ok", tone: hasDanger ? "danger" : "success" },
    { label: "Sprints", value: tasks.length, hint: "sem horas/responsaveis" },
    { label: "Tamanho", value: prompt.length.toLocaleString("pt-BR"), hint: "caracteres" },
  ];

  return (
    <div className="space-y-5">
      <OutputHeader
        kind="slides"
        study={study}
        metrics={metrics}
        actions={
          <>
            <button onClick={copyPrompt} className="btn-primary inline-flex items-center gap-2 text-xs">
              <Clipboard className="w-3.5 h-3.5" />
              {copied ? "Copiado" : "Copiar prompt"}
            </button>
            <button
              onClick={() => downloadText(`prompt-slides-${study.id}-${mode}.txt`, prompt)}
              className="btn-ghost inline-flex items-center gap-2 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              TXT
            </button>
          </>
        }
      />

      <div className="bg-success-soft border border-success/30 text-success rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        Tese interna, scores internos, pessoalidades, responsaveis, horas e status interno excluidos deste prompt.
      </div>

      <section className="surface rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-blue" />
          <div>
            <div className="eyebrow">Modo do prompt</div>
            <p className="text-sm text-ink-soft">Escolha o tipo de deck antes de copiar para o Claude.</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {(Object.keys(PROMPT_MODES) as PromptMode[]).map((key) => {
            const item = PROMPT_MODES[key];
            const active = key === mode;
            return (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`text-left rounded-xl border p-4 transition ${
                  active ? "border-blue bg-blue/5 shadow-card" : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="font-black text-navy">{item.label}</div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${active ? "text-blue" : "text-ink-mute"}`}>
                    {item.short}
                  </span>
                </div>
                <p className="text-sm text-ink-soft leading-snug">{item.description}</p>
                <div className="mt-3 text-xs font-bold text-ink-mute">{item.deckSize}</div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid xl:grid-cols-[1fr_1fr] gap-5">
        <section className="surface rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-success" />
            <div>
              <div className="eyebrow">Client Safe Inspector</div>
              <p className="text-sm text-ink-soft">Auditoria local antes de copiar para fora do Studio.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {audit.map((item) => (
              <div key={item.label} className={`rounded-xl border p-3 ${statusClass(item.status)}`}>
                <div className="flex items-center gap-2 mb-1">
                  <StatusIcon status={item.status} />
                  <div className="text-sm font-black text-navy">{item.label}</div>
                </div>
                <p className="text-xs text-ink-soft leading-snug">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="surface rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <LayoutList className="w-4 h-4 text-blue" />
            <div>
              <div className="eyebrow">Preview do deck</div>
              <p className="text-sm text-ink-soft">Estrutura sugerida que o Claude vai seguir.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
            {selectedMode.outline.map((title, index) => (
              <div key={`${title}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-blue mb-1">
                  Slide {index + 1}
                </div>
                <div className="text-sm font-bold text-navy leading-snug">{title}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="surface rounded-2xl p-4 md:p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <div className="eyebrow mb-1">Prompt Claude</div>
            <p className="text-sm text-ink-soft">
              Estruturacao estrategica em slides com schema fixo, outline e dados client-safe.
            </p>
          </div>
        </div>
        <textarea
          readOnly
          value={prompt}
          className="w-full min-h-[620px] resize-y rounded-xl border border-slate-200 bg-slate-950 text-slate-50 p-5 text-sm leading-relaxed font-mono outline-none"
          spellCheck={false}
        />
      </section>
    </div>
  );
}
