// Diagnostic scoring (rule-based, deterministic).
// v3: diagnóstico processual (automação com IA). 11 perguntas, 4 seções, paywall
// com lockedAxes/lockedInsights/recommendation/nextSteps/strategicQuestions/benchmark.

export type LikertValue =
  | "Discordo"
  | "Discordo um pouco"
  | "Neutro"
  | "Concordo um pouco"
  | "Concordo";

export interface DiagnosticAnswers {
  // Seção 1: a operação
  operacao?: string;
  processo_critico?: string;
  // Seção 2: rotina e sistemas
  sistemas?: string;
  retrabalho?: LikertValue | string;
  volume?: string;
  // Seção 3: dados e medição
  indicadores?: LikertValue | string;
  dados?: string;
  dependencia?: LikertValue | string;
  // Seção 4: prontidão para IA
  tentativas?: string;
  equipe?: string;
  urgencia?: LikertValue | string;
}

export interface DiagnosticAxis {
  label: string;
  value: number;
  hint?: string;
}

export interface DiagnosticInsight {
  kind: "insight" | "warning";
  label: string;
  body: string;
}

export interface DiagnosticNextStep {
  title: string;
  body: string;
}

export type DiagnosticRecommendation = "ENTRAR" | "OBSERVAR" | "NAO_ENTRAR";

export interface DiagnosticBenchmark {
  peers: number;
  percentile: number;
  sectorAverage: number;
}

export type DiagnosticBucket = "Desafiador" | "Em desenvolvimento" | "Promissor" | "Forte";

export interface DiagnosticResult {
  overall: number;
  headline: string;
  bucket: DiagnosticBucket;
  axes: DiagnosticAxis[];
  lockedAxes: DiagnosticAxis[];
  insights: DiagnosticInsight[];
  lockedInsights: DiagnosticInsight[];
  recommendation: DiagnosticRecommendation;
  recommendationReason: string;
  nextSteps: DiagnosticNextStep[];
  strategicQuestions: string[];
  benchmark: DiagnosticBenchmark;
}

const LIKERT_MAP: Record<string, number> = {
  Discordo: 20,
  "Discordo um pouco": 40,
  Neutro: 55,
  "Concordo um pouco": 72,
  Concordo: 88,
};

function likertScore(v: unknown): number {
  if (typeof v !== "string") return 50;
  return LIKERT_MAP[v] ?? 50;
}

function textScore(v: unknown): number {
  if (!v || typeof v !== "string") return 30;
  const len = v.length;
  if (len > 140) return 78;
  if (len > 80) return 66;
  if (len > 30) return 55;
  return 38;
}

function sistemasScore(v: unknown): number {
  if (typeof v !== "string") return 40;
  if (v === "Papel, caderno e WhatsApp") return 25;
  if (v === "Principalmente planilhas") return 40;
  if (v === "Planilhas + um sistema (ERP ou CRM)") return 55;
  if (v === "Vários sistemas que não conversam entre si") return 45;
  if (v === "Sistemas integrados") return 85;
  return 40;
}

function volumeScore(v: unknown): number {
  if (typeof v !== "string") return 40;
  if (v === "Até 100 por mês") return 40;
  if (v === "100 a 1 mil por mês") return 60;
  if (v === "1 mil a 10 mil por mês") return 80;
  if (v === "Mais de 10 mil por mês") return 90;
  if (v === "Não sei medir") return 30;
  return 40;
}

function dadosScore(v: unknown): number {
  if (typeof v !== "string") return 40;
  if (v === "Na cabeça das pessoas") return 20;
  if (v === "Em planilhas espalhadas") return 40;
  if (v === "Num sistema, mas incompletos") return 60;
  if (v === "Centralizados e confiáveis") return 88;
  return 40;
}

function tentativasScore(v: unknown): number {
  if (typeof v !== "string") return 40;
  if (v === "Nunca tentamos automatizar") return 35;
  if (v === "Tentamos e não pegou") return 45;
  if (v === "Temos algumas automações simples") return 65;
  if (v === "Já usamos IA em parte da operação") return 85;
  return 40;
}

function equipeScore(v: unknown): number {
  if (typeof v !== "string") return 45;
  if (v === "Até 5 pessoas") return 45;
  if (v === "6 a 20 pessoas") return 60;
  if (v === "21 a 100 pessoas") return 75;
  if (v === "Mais de 100 pessoas") return 85;
  return 45;
}

// Hash determinístico simples para variar benchmark.
function hashAnswers(a: DiagnosticAnswers): number {
  const s = JSON.stringify(a);
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(v)));
}

export function makeResultFallback(answers: DiagnosticAnswers): DiagnosticResult {
  const lRetrab = likertScore(answers.retrabalho); // alto = muito retrabalho
  const lInd = likertScore(answers.indicadores); // alto = processo medido
  const lDep = likertScore(answers.dependencia); // alto = refém de pessoas-chave
  const lUrg = likertScore(answers.urgencia); // alto = custo vira problema em 12 meses

  const sOper = textScore(answers.operacao);
  const sProc = textScore(answers.processo_critico);

  const sSist = sistemasScore(answers.sistemas);
  const sVol = volumeScore(answers.volume);
  const sDados = dadosScore(answers.dados);
  const sTent = tentativasScore(answers.tentativas);
  const sEq = equipeScore(answers.equipe);

  // Eixos principais (visíveis).
  const processo = clamp(sProc * 0.4 + (100 - lRetrab) * 0.4 + sOper * 0.2);
  const sistemas = clamp(sSist * 0.7 + sTent * 0.3);
  const dados = clamp(sDados * 0.6 + lInd * 0.4);
  const pessoas = clamp((100 - lDep) * 0.6 + sEq * 0.4);
  const retorno = clamp(sVol * 0.4 + lUrg * 0.3 + sEq * 0.3);

  const overall = clamp(
    processo * 0.25 + sistemas * 0.2 + dados * 0.2 + pessoas * 0.15 + retorno * 0.2
  );

  const bucket: DiagnosticBucket =
    overall >= 75
      ? "Forte"
      : overall >= 50
        ? "Promissor"
        : overall >= 25
          ? "Em desenvolvimento"
          : "Desafiador";

  const headline =
    overall >= 75
      ? "Operação com base pronta. Dá pra automatizar agora e medir retorno no primeiro trimestre."
      : overall >= 50
        ? "A automação se paga aqui, mas 2 ou 3 pontos do processo precisam de redesenho antes."
        : overall >= 25
          ? "Existe desperdício claro, mas o processo precisa de arrumação antes de receber tecnologia."
          : "Automatizar agora só aceleraria o erro. O primeiro passo é organizar processo e dado.";

  const axes: DiagnosticAxis[] = [
    {
      label: "Processo",
      value: processo,
      hint: "Clareza do fluxo e nível de retrabalho na rotina descrita.",
    },
    {
      label: "Sistemas",
      value: sistemas,
      hint: "Quanto da operação já roda em ferramenta versus papel e planilha.",
    },
    { label: "Dados", value: dados, hint: "Onde o dado vive e se ele é confiável para decidir." },
    { label: "Pessoas", value: pessoas, hint: "Dependência de pessoas-chave versus porte do time." },
    { label: "Retorno", value: retorno, hint: "Volume e urgência indicam quanto a automação devolve." },
  ];

  // lockedAxes: 5 eixos secundários.
  const prontidaoIa = clamp(sDados * 0.4 + sSist * 0.3 + sTent * 0.3);
  const custoRetrabalho = clamp(lRetrab * 0.5 + sVol * 0.3 + sEq * 0.2);
  const dependenciaPessoas = clamp(lDep * 0.7 + (100 - sDados) * 0.3);
  const ordemAutomacao = clamp(lUrg * 0.4 + sVol * 0.3 + sProc * 0.3);
  const payback = clamp(sVol * 0.4 + sEq * 0.3 + lRetrab * 0.3);

  const lockedAxes: DiagnosticAxis[] = [
    {
      label: "Prontidão para IA",
      value: prontidaoIa,
      hint: "O quanto dado e sistema atuais aguentam um agente de IA em produção.",
    },
    {
      label: "Custo do retrabalho",
      value: custoRetrabalho,
      hint: "Horas perdidas por mês redigitando e conferindo dado.",
    },
    {
      label: "Dependência de pessoas",
      value: dependenciaPessoas,
      hint: "Risco de a operação parar quando alguém específico falta.",
    },
    {
      label: "Ordem de automação",
      value: ordemAutomacao,
      hint: "Qual frente automatizar primeiro para o retorno aparecer rápido.",
    },
    {
      label: "Payback",
      value: payback,
      hint: "Estimativa de quando a automação se paga nessa operação.",
    },
  ];

  // Insights free (2): 1 insight + 1 warning.
  const insights: DiagnosticInsight[] = [
    {
      kind: "insight",
      label: "Insight",
      body:
        overall >= 50
          ? "O processo crítico que você descreveu tem volume e repetição suficientes para automação com retorno mensurável. Comece por ele: uma frente só, medida de ponta a ponta, antes de espalhar tecnologia pela operação."
          : "O processo crítico ainda está descrito de forma genérica. Antes de qualquer ferramenta, desenhe o fluxo como ele acontece hoje, com etapas, donos e tempo de cada passo. Esse desenho é o que separa automação que se paga de piloto abandonado.",
    },
    {
      kind: "warning",
      label: "Atenção",
      body:
        dados < 55
          ? "O dado da operação vive espalhado ou na cabeça do time. Automatizar em cima de dado ruim multiplica o erro: centralize o registro do processo crítico primeiro, nem que seja numa planilha única com dono definido."
          : "O retrabalho declarado indica que o mesmo dado é digitado mais de uma vez. Cada redigitação é custo e fonte de erro: a integração entre as ferramentas atuais tende a se pagar antes de qualquer IA nova.",
    },
  ];

  // Insights locked (3 a 4): conteúdo de valor que fica atrás do paywall.
  const lockedInsights: DiagnosticInsight[] = [];
  if (custoRetrabalho > 55) {
    lockedInsights.push({
      kind: "warning",
      label: "Custo do retrabalho",
      body:
        "Pelo volume e porte declarados, o retrabalho dessa operação consome horas relevantes todo mês. No diagnóstico completo estimamos esse custo em reais por mês e mostramos quais 2 integrações eliminam a maior parte dele.",
    });
  }
  if (prontidaoIa < 65) {
    lockedInsights.push({
      kind: "insight",
      label: "Prontidão para IA",
      body:
        "Agente de IA em produção exige dado acessível e sistema que aceite integração. No diagnóstico completo mapeamos o que precisa mudar na sua base atual antes do primeiro agente, e o que dá pra automatizar já, sem mexer em nada.",
    });
  }
  if (dependenciaPessoas > 55) {
    lockedInsights.push({
      kind: "warning",
      label: "Dependência de pessoas",
      body:
        "Parte relevante do processo vive na cabeça de pessoas específicas. Isso trava férias, escala e venda da empresa. No diagnóstico completo mostramos como transformar esse conhecimento em fluxo documentado e automatizável.",
    });
  }
  lockedInsights.push({
    kind: "insight",
    label: "Ordem de automação",
    body:
      "Automatizar na ordem errada queima orçamento e a confiança do time. No diagnóstico completo entregamos a sequência recomendada para a sua operação: o que vem primeiro, o que espera, e o indicador que prova cada etapa.",
  });

  // Recomendação.
  const recommendation: DiagnosticRecommendation =
    overall >= 75 ? "ENTRAR" : overall >= 50 ? "OBSERVAR" : "NAO_ENTRAR";
  const recommendationReason =
    recommendation === "ENTRAR"
      ? "Processo, dado e volume dão base para automatizar agora, com retorno mensurável no primeiro ciclo."
      : recommendation === "OBSERVAR"
        ? "A automação se paga nessa operação, mas o processo pede redesenho em 2 ou 3 pontos antes de receber tecnologia."
        : "Antes de investir em ferramenta, organize o processo e o dado. Automatizar agora só faria o erro acontecer mais rápido.";

  // Next steps (3) por bucket.
  let nextSteps: DiagnosticNextStep[];
  if (bucket === "Forte") {
    nextSteps = [
      {
        title: "Escolher o processo de maior volume para automatizar primeiro",
        body: "Uma frente só, com indicador de antes e depois definido no dia 1.",
      },
      {
        title: "Medir o custo atual do processo em horas por semana",
        body: "O número que vai provar o retorno da automação em 90 dias.",
      },
      {
        title: "Listar as integrações entre os sistemas que já existem",
        body: "O que já conversa, o que precisa de ponte, o que dá pra aposentar.",
      },
    ];
  } else if (bucket === "Promissor") {
    nextSteps = [
      {
        title: "Desenhar o processo crítico como ele acontece hoje",
        body: "Etapas, donos, sistemas e tempo de cada passo, sem embelezar.",
      },
      {
        title: "Cortar as etapas que não geram valor antes de automatizar",
        body: "Automatizar etapa inútil é pagar para errar mais rápido.",
      },
      {
        title: "Centralizar o dado do processo num lugar só, com dono",
        body: "Uma fonte de verdade, mesmo que seja uma planilha bem cuidada.",
      },
    ];
  } else if (bucket === "Em desenvolvimento") {
    nextSteps = [
      {
        title: "Registrar uma semana do processo crítico em detalhe",
        body: "Quantas vezes rodou, quanto tempo levou, onde travou.",
      },
      {
        title: "Definir um dono para cada dado que circula na operação",
        body: "Sem dono, o dado apodrece e nenhuma automação segura.",
      },
      {
        title: "Eliminar uma redigitação por semana, manualmente",
        body: "Antes de ferramenta nova, pare de pagar duas vezes pelo mesmo dado.",
      },
    ];
  } else {
    nextSteps = [
      {
        title: "Escrever o passo a passo do processo mais doloroso",
        body: "No papel mesmo. O que não está escrito não pode ser melhorado.",
      },
      {
        title: "Tirar a operação do WhatsApp e do caderno, um fluxo por vez",
        body: "Uma planilha estruturada já muda o jogo nesse estágio.",
      },
      {
        title: "Medir uma coisa só por 30 dias",
        body: "Volume ou tempo do processo crítico. Um número honesto pra começar.",
      },
    ];
  }

  // 3 perguntas estratégicas.
  let strategicQuestions: string[];
  if (bucket === "Forte" || bucket === "Promissor") {
    strategicQuestions = [
      "Quantas horas por mês o time gasta no processo crítico, e quanto custa essa hora?",
      "Se a automação eliminar metade do trabalho manual, o que o time passa a fazer com o tempo livre?",
      "Qual sistema atual vira a fonte de verdade, e quem responde pela qualidade do dado nele?",
    ];
  } else {
    strategicQuestions = [
      "Se a pessoa que mais conhece o processo sair amanhã, quanto tempo a operação leva para se recuperar?",
      "Quanto custou, no último ano, o erro causado por dado redigitado ou planilha desatualizada?",
      "Qual processo, se rodasse sozinho, liberaria mais tempo do dono ou do gestor?",
    ];
  }

  // Benchmark determinístico.
  const h = hashAnswers(answers);
  const peers = 38 + (h % 27); // 38..64
  const percentile = clamp(Math.round(overall * 0.95), 5, 95);
  const sectorDelta = 8 + (h % 9); // 8..16
  const sectorAverage = clamp(overall - sectorDelta, 5, 95);

  return {
    overall,
    headline,
    bucket,
    axes,
    lockedAxes,
    insights,
    lockedInsights,
    recommendation,
    recommendationReason,
    nextSteps,
    strategicQuestions,
    benchmark: { peers, percentile, sectorAverage },
  };
}

// Mantém compatibilidade com chamadores antigos que importavam makeResult.
// O caminho preferido agora é makeResultWithClaude(); makeResult é só o fallback.
export const makeResult = makeResultFallback;

// ─── Validação do JSON retornado pelo Claude ────────────────────────────────

const VALID_BUCKETS: DiagnosticBucket[] = [
  "Desafiador",
  "Em desenvolvimento",
  "Promissor",
  "Forte",
];
const VALID_RECOMMENDATIONS: DiagnosticRecommendation[] = [
  "ENTRAR",
  "OBSERVAR",
  "NAO_ENTRAR",
];
const REQUIRED_AXES = ["Processo", "Sistemas", "Dados", "Pessoas", "Retorno"];
const REQUIRED_LOCKED_AXES = [
  "Prontidão para IA",
  "Custo do retrabalho",
  "Dependência de pessoas",
  "Ordem de automação",
  "Payback",
];

function isIntInRange(v: unknown, min: number, max: number): v is number {
  return typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function validateAxis(item: unknown): item is DiagnosticAxis {
  if (!item || typeof item !== "object") return false;
  const a = item as Record<string, unknown>;
  return (
    isNonEmptyString(a.label) &&
    isIntInRange(a.value, 0, 100) &&
    (a.hint === undefined || typeof a.hint === "string")
  );
}

function validateInsight(item: unknown): item is DiagnosticInsight {
  if (!item || typeof item !== "object") return false;
  const i = item as Record<string, unknown>;
  return (
    (i.kind === "insight" || i.kind === "warning") &&
    isNonEmptyString(i.label) &&
    isNonEmptyString(i.body)
  );
}

function validateNextStep(item: unknown): item is DiagnosticNextStep {
  if (!item || typeof item !== "object") return false;
  const s = item as Record<string, unknown>;
  return isNonEmptyString(s.title) && isNonEmptyString(s.body);
}

function validateDiagnosticResult(raw: unknown): raw is DiagnosticResult {
  if (!raw || typeof raw !== "object") return false;
  const r = raw as Record<string, unknown>;

  if (!isIntInRange(r.overall, 0, 100)) return false;
  if (!isNonEmptyString(r.headline)) return false;
  if (typeof r.bucket !== "string" || !VALID_BUCKETS.includes(r.bucket as DiagnosticBucket))
    return false;

  if (!Array.isArray(r.axes) || r.axes.length !== 5) return false;
  if (!r.axes.every(validateAxis)) return false;

  if (!Array.isArray(r.lockedAxes) || r.lockedAxes.length !== 5) return false;
  if (!r.lockedAxes.every(validateAxis)) return false;

  if (!Array.isArray(r.insights) || r.insights.length < 1) return false;
  if (!r.insights.every(validateInsight)) return false;

  if (!Array.isArray(r.lockedInsights) || r.lockedInsights.length < 1) return false;
  if (!r.lockedInsights.every(validateInsight)) return false;

  if (
    typeof r.recommendation !== "string" ||
    !VALID_RECOMMENDATIONS.includes(r.recommendation as DiagnosticRecommendation)
  )
    return false;
  if (!isNonEmptyString(r.recommendationReason)) return false;

  if (!Array.isArray(r.nextSteps) || r.nextSteps.length !== 3) return false;
  if (!r.nextSteps.every(validateNextStep)) return false;

  if (!Array.isArray(r.strategicQuestions) || r.strategicQuestions.length !== 3) return false;
  if (!r.strategicQuestions.every((q) => isNonEmptyString(q))) return false;

  if (!r.benchmark || typeof r.benchmark !== "object") return false;
  const b = r.benchmark as Record<string, unknown>;
  if (!isIntInRange(b.peers, 30, 90)) return false;
  if (!isIntInRange(b.percentile, 1, 99)) return false;
  if (!isIntInRange(b.sectorAverage, 5, 95)) return false;

  return true;
}

// Garante que os labels dos eixos batam com a UI (ResultScreen depende dessa ordem/labels).
function normalizeAxes(
  axes: DiagnosticAxis[],
  expectedLabels: string[]
): DiagnosticAxis[] {
  const byLabel = new Map(axes.map((a) => [a.label.toLowerCase(), a]));
  return expectedLabels.map((label, idx) => {
    const found = byLabel.get(label.toLowerCase()) ?? axes[idx];
    return {
      label,
      value: clamp(Math.round(found?.value ?? 50)),
      hint: found?.hint,
    };
  });
}

// Extrai bloco JSON de uma string que pode vir com fence/lixo (defensivo).
function extractJson(text: string): string {
  const trimmed = text.trim();
  // Sem fence: já é JSON
  if (trimmed.startsWith("{")) return trimmed;
  // Com fence: pega entre primeira { e última }
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first >= 0 && last > first) return trimmed.slice(first, last + 1);
  return trimmed;
}

interface AnthropicLike {
  messages: {
    create: (params: {
      model: string;
      max_tokens: number;
      system: string;
      messages: { role: "user"; content: string }[];
    }) => Promise<{
      content: Array<{ type: string; text?: string }>;
      model?: string;
    }>;
  };
}

export interface ClaudeGenerationMeta {
  generated_by: "gemini" | "claude" | "fallback";
  model?: string;
  ms_elapsed: number;
  error?: string;
}

export interface DiagnosticResultWithMeta {
  result: DiagnosticResult;
  meta: ClaudeGenerationMeta;
}

const PRIMARY_MODEL = "claude-sonnet-4-5-20250929";
const FALLBACK_MODEL = "claude-3-5-sonnet-20241022";

export async function makeResultWithClaude(
  answers: DiagnosticAnswers,
  client: AnthropicLike
): Promise<DiagnosticResultWithMeta> {
  const { DIAGNOSTIC_SYSTEM_PROMPT, buildDiagnosticUserPrompt } = await import(
    "@/prompts/diagnosticPublic"
  );

  const start = Date.now();
  const userPrompt = buildDiagnosticUserPrompt(answers);

  async function tryModel(model: string): Promise<{
    ok: true;
    result: DiagnosticResult;
    model: string;
  } | { ok: false; error: string }> {
    try {
      const response = await client.messages.create({
        model,
        max_tokens: 2500,
        system: DIAGNOSTIC_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      });

      const textBlock = response.content.find(
        (b) => b.type === "text" && typeof b.text === "string"
      );
      const raw = textBlock?.text ?? "";
      if (!raw) return { ok: false, error: "empty response" };

      const jsonText = extractJson(raw);
      let parsed: unknown;
      try {
        parsed = JSON.parse(jsonText);
      } catch (err) {
        return {
          ok: false,
          error: `parse error: ${err instanceof Error ? err.message : "unknown"}`,
        };
      }

      if (!validateDiagnosticResult(parsed)) {
        return { ok: false, error: "validation failed" };
      }

      // Normaliza labels dos eixos pra UI esperar exatamente o que ela espera.
      const normalized: DiagnosticResult = {
        ...parsed,
        axes: normalizeAxes(parsed.axes, REQUIRED_AXES),
        lockedAxes: normalizeAxes(parsed.lockedAxes, REQUIRED_LOCKED_AXES),
        overall: clamp(parsed.overall),
        benchmark: {
          peers: clamp(parsed.benchmark.peers, 30, 90),
          percentile: clamp(parsed.benchmark.percentile, 1, 99),
          sectorAverage: clamp(parsed.benchmark.sectorAverage, 5, 95),
        },
      };

      return { ok: true, result: normalized, model: response.model ?? model };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "unknown error",
      };
    }
  }

  const primary = await tryModel(PRIMARY_MODEL);
  if (primary.ok) {
    return {
      result: primary.result,
      meta: {
        generated_by: "claude",
        model: primary.model,
        ms_elapsed: Date.now() - start,
      },
    };
  }

  // Tenta modelo de fallback se o primário falhar (ex: modelo não disponível na conta).
  const secondary = await tryModel(FALLBACK_MODEL);
  if (secondary.ok) {
    return {
      result: secondary.result,
      meta: {
        generated_by: "claude",
        model: secondary.model,
        ms_elapsed: Date.now() - start,
      },
    };
  }

  return {
    result: makeResultFallback(answers),
    meta: {
      generated_by: "fallback",
      ms_elapsed: Date.now() - start,
      error: `${primary.error} | ${secondary.error}`,
    },
  };
}

// ─── Gemini path (preferido em produção) ─────────────────────────────────────

export async function makeResultWithGemini(
  answers: DiagnosticAnswers
): Promise<DiagnosticResultWithMeta> {
  const { DIAGNOSTIC_SYSTEM_PROMPT, buildDiagnosticUserPrompt } = await import(
    "@/prompts/diagnosticPublic"
  );
  const { callGemini, extractJSON, getGeminiModelName } = await import("@/lib/gemini");

  const start = Date.now();
  const userPrompt = buildDiagnosticUserPrompt(answers);

  const apiKey = (process.env.ANTHROPIC_API_KEY || process.env.GOOGLE_API_KEY);
  if (!apiKey) {
    return {
      result: makeResultFallback(answers),
      meta: {
        generated_by: "fallback",
        ms_elapsed: 0,
        error: "missing GOOGLE_API_KEY",
      },
    };
  }

  try {
    const { content, model_used } = await callGemini(
      DIAGNOSTIC_SYSTEM_PROMPT,
      userPrompt,
      apiKey,
      {
        temperature: 0.7,
        maxOutputTokens: 2500,
        thinking: false,
      }
    );

    const parsed = extractJSON(content);
    if (!parsed) {
      return {
        result: makeResultFallback(answers),
        meta: {
          generated_by: "fallback",
          ms_elapsed: Date.now() - start,
          error: "gemini: extractJSON returned null",
        },
      };
    }
    if (!validateDiagnosticResult(parsed)) {
      return {
        result: makeResultFallback(answers),
        meta: {
          generated_by: "fallback",
          ms_elapsed: Date.now() - start,
          error: "gemini: validation failed",
        },
      };
    }

    const normalized: DiagnosticResult = {
      ...parsed,
      axes: normalizeAxes(parsed.axes, REQUIRED_AXES),
      lockedAxes: normalizeAxes(parsed.lockedAxes, REQUIRED_LOCKED_AXES),
      overall: clamp(parsed.overall),
      benchmark: {
        peers: clamp(parsed.benchmark.peers, 30, 90),
        percentile: clamp(parsed.benchmark.percentile, 1, 99),
        sectorAverage: clamp(parsed.benchmark.sectorAverage, 5, 95),
      },
    };

    return {
      result: normalized,
      meta: {
        generated_by: "gemini",
        model: model_used || getGeminiModelName(),
        ms_elapsed: Date.now() - start,
      },
    };
  } catch (err) {
    return {
      result: makeResultFallback(answers),
      meta: {
        generated_by: "fallback",
        ms_elapsed: Date.now() - start,
        error: err instanceof Error ? err.message : "gemini error",
      },
    };
  }
}

export function scoreLabel(v: number): DiagnosticBucket {
  if (v >= 75) return "Forte";
  if (v >= 50) return "Promissor";
  if (v >= 25) return "Em desenvolvimento";
  return "Desafiador";
}

export function scoreHex(v: number): string {
  if (v >= 75) return "#10B981";
  if (v >= 50) return "#52E1E7";
  if (v >= 25) return "#F59E0B";
  return "#E11D48";
}

export function scoreInk(v: number): string {
  if (v >= 75) return "#10B981";
  if (v >= 50) return "#3BC8CF";
  if (v >= 25) return "#B45309";
  return "#E11D48";
}

export function scoreSoft(v: number): string {
  if (v >= 75) return "#D1FAE5";
  if (v >= 50) return "#CFFAFE";
  if (v >= 25) return "#FEF3C7";
  return "#FEE2E2";
}
