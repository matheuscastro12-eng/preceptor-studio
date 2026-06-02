// Diagnostic scoring (rule-based, deterministic).
// v2: 11 perguntas, 4 seções, paywall com lockedAxes/lockedInsights/recommendation/nextSteps/strategicQuestions/benchmark.

export type LikertValue =
  | "Discordo"
  | "Discordo um pouco"
  | "Neutro"
  | "Concordo um pouco"
  | "Concordo";

export interface DiagnosticAnswers {
  // Seção 1
  ideia?: string;
  problema?: string;
  // Seção 2
  cliente?: string;
  mercado_tamanho?: string;
  demanda?: LikertValue | string;
  // Seção 3
  receita?: string;
  execucao?: LikertValue | string;
  capital?: string;
  // Seção 4
  diferencial?: LikertValue | string;
  regulacao?: string;
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

function mercadoTamanhoScore(v: unknown): number {
  if (typeof v !== "string") return 40;
  if (v === "Menos de 10 mil") return 40;
  if (v === "10 mil a 100 mil") return 60;
  if (v === "100 mil a 1 milhão") return 78;
  if (v === "Mais de 1 milhão") return 88;
  if (v === "Ainda não sei medir") return 30;
  return 40;
}

function capitalScore(v: unknown): number {
  if (typeof v !== "string") return 40;
  if (v === "Menos de R$ 20k (bootstrap)") return 35;
  if (v === "R$ 20k a 100k (próprio ou amigos)") return 55;
  if (v === "R$ 100k a 500k (anjo/pre-seed)") return 72;
  if (v === "Mais de R$ 500k (seed+)") return 85;
  if (v === "Ainda captando") return 40;
  return 40;
}

function receitaScore(v: unknown): number {
  if (typeof v !== "string") return 50;
  if (v === "Assinatura mensal (SaaS)") return 82;
  if (v === "Cobrança por uso ou por consulta") return 78;
  if (v === "Licenciamento anual") return 68;
  if (v === "Comissão sobre transações") return 70;
  if (v === "Modelo híbrido (serviço + software)") return 72;
  return 50;
}

function regulacaoScore(v: unknown): number {
  if (typeof v !== "string") return 60;
  if (v === "Nenhuma / muito leve") return 80;
  if (v === "Média (precisa de adaptação)") return 65;
  if (v === "Alta (LGPD, CFM, ANVISA, etc.)") return 48;
  if (v === "Crítica (saúde, financeiro pesado)") return 30;
  return 60;
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
  const lDemanda = likertScore(answers.demanda);
  const lExec = likertScore(answers.execucao);
  const lDif = likertScore(answers.diferencial);
  const lUrg = likertScore(answers.urgencia);

  const sCliente = textScore(answers.cliente);
  const sIdeia = textScore(answers.ideia);
  const sProblema = textScore(answers.problema);

  const sMerc = mercadoTamanhoScore(answers.mercado_tamanho);
  const sCap = capitalScore(answers.capital);
  const sRec = receitaScore(answers.receita);
  const sReg = regulacaoScore(answers.regulacao);

  // Eixos principais (visíveis).
  const mercado = clamp(sCliente * 0.4 + lDemanda * 0.4 + sMerc * 0.2);
  const execucao = clamp(lExec * 0.6 + sCap * 0.4);
  const difer = clamp(sIdeia * 0.3 + sProblema * 0.2 + lDif * 0.5);
  const modelo = clamp(sRec * 0.7 + sCap * 0.3);
  // Regulatório: regulação alta com capital baixo piora; capital alto compensa.
  const regAjuste = (sCap - 50) * 0.2;
  const regulatorio = clamp(sReg + regAjuste);

  const overall = clamp(
    mercado * 0.25 + execucao * 0.2 + difer * 0.25 + modelo * 0.2 + regulatorio * 0.1
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
      ? "Tese com sinais fortes. Vale acelerar agora, com foco em diferenciação e canal."
      : overall >= 50
        ? "Sinais positivos com pontos a validar nos próximos 60 a 90 dias."
        : overall >= 25
          ? "Em desenvolvimento: a tese existe, mas falta clareza em mercado ou modelo."
          : "Tese desafiadora hoje, vale recomeçar pelo problema antes da solução.";

  const axes: DiagnosticAxis[] = [
    {
      label: "Mercado",
      value: mercado,
      hint: "Demanda mencionada, com porte de cliente bem delimitado.",
    },
    {
      label: "Execução",
      value: execucao,
      hint: "Clareza técnica autodeclarada para os próximos 90 dias.",
    },
    { label: "Diferenciação", value: difer },
    { label: "Modelo", value: modelo },
    { label: "Regulatório", value: regulatorio },
  ];

  // lockedAxes: 5 eixos secundários.
  const defensabilidade = clamp(lDif * 0.7 + sProblema * 0.3);
  const timeToMarket = clamp(lUrg * 0.5 + lExec * 0.5);
  const capitalEficiente = clamp(sCap * 0.6 + (100 - sMerc) * 0.4 * 0.5 + sMerc * 0.2);
  const canalAquisicao = clamp(sRec * 0.4 + lDemanda * 0.6);
  const riscoRegulatorio = clamp(100 - sReg + (sCap - 50) * 0.1);

  const lockedAxes: DiagnosticAxis[] = [
    {
      label: "Defensabilidade",
      value: defensabilidade,
      hint: "Quão difícil seria para um concorrente copiar em 12 meses.",
    },
    {
      label: "Time-to-market",
      value: timeToMarket,
      hint: "Janela de mercado vs capacidade de execução.",
    },
    {
      label: "Capital eficiente",
      value: capitalEficiente,
      hint: "Caixa disponível vs tamanho do mercado a conquistar.",
    },
    {
      label: "Canal de aquisição",
      value: canalAquisicao,
      hint: "Modelo de receita vs sinais de demanda já validados.",
    },
    {
      label: "Risco regulatório",
      value: riscoRegulatorio,
      hint: "Exposição regulatória ponderada por capital disponível.",
    },
  ];

  // Insights free (2): 1 insight + 1 warning.
  const insights: DiagnosticInsight[] = [
    {
      kind: "insight",
      label: "Insight",
      body:
        overall >= 50
          ? "Sua descrição de cliente já passa a régua, porte e segmento estão claros. Escreva um pitch de 2 linhas que isole esse cliente e use no próximo contato comercial."
          : "Falta concretude na descrição do cliente que paga. Antes de seguir, defina um único perfil ideal com porte, dor e canal de aquisição.",
    },
    {
      kind: "warning",
      label: "Atenção",
      body:
        execucao < 60
          ? "Você sinalizou pouca clareza técnica de execução. Esse é o eixo que mais derruba teses em estágio inicial: feche um plano técnico de 90 dias antes de captar."
          : "Diferenciação ainda parece incremental. Investigue uma vantagem defensável (dado proprietário, integração, regulação) que faça o concorrente demorar 12 meses pra copiar.",
    },
  ];

  // Insights locked (3 a 4): conteúdo de valor que fica atrás do paywall.
  const lockedInsights: DiagnosticInsight[] = [];
  if (riscoRegulatorio > 55) {
    lockedInsights.push({
      kind: "warning",
      label: "Risco regulatório",
      body:
        "O nível de regulação do setor combinado com o seu caixa disponível indica exposição relevante. Mapeamos no diagnóstico completo as 3 frentes de compliance que mais consomem capital em estágio inicial e o cronograma realista de adequação.",
    });
  }
  if (canalAquisicao < 65) {
    lockedInsights.push({
      kind: "insight",
      label: "Canal de aquisição",
      body:
        "Seu modelo de receita exige um canal de aquisição específico para funcionar economicamente. No diagnóstico completo detalhamos os 2 canais que historicamente performam pra esse tipo de tese e o CAC esperado nos primeiros 12 meses.",
    });
  }
  if (defensabilidade < 70) {
    lockedInsights.push({
      kind: "warning",
      label: "Defensabilidade",
      body:
        "A vantagem defensável que você descreveu pode ser copiada em menos de 12 meses. Identificamos 4 vetores de defensa (dado, rede, regulação, custo de troca) e qual deles é viável construir antes do próximo ciclo de captação.",
    });
  }
  lockedInsights.push({
    kind: "insight",
    label: "Estrutura societária",
    body:
      "Cap table e estrutura jurídica influenciam diretamente a capacidade de captar nos próximos 18 meses. No diagnóstico completo revisamos vesting, opções e a tese de equity para o seu estágio.",
  });

  // Recomendação.
  const recommendation: DiagnosticRecommendation =
    overall >= 75 ? "ENTRAR" : overall >= 50 ? "OBSERVAR" : "NAO_ENTRAR";
  const recommendationReason =
    recommendation === "ENTRAR"
      ? "Sinais sólidos em mercado, modelo e diferenciação. Vale acelerar agora."
      : recommendation === "OBSERVAR"
        ? "Tese promissora, mas com 2 a 3 pontos a validar nos próximos 60 dias antes de comprometer capital."
        : "Recomendamos repensar o problema ou o cliente antes de seguir com investimento de tempo ou capital.";

  // Next steps (3) por bucket.
  let nextSteps: DiagnosticNextStep[];
  if (bucket === "Forte") {
    nextSteps = [
      {
        title: "Acelerar canal de aquisição com 10 contas-alvo",
        body: "Lista nominal de prospects com porte e ponto de entrada definidos.",
      },
      {
        title: "Estruturar deck de captação de pre-seed",
        body: "Narrativa, métricas e tese de retorno alinhadas ao tipo de fundo certo.",
      },
      {
        title: "Fechar ICP final e proibir desvios por 90 dias",
        body: "Foco em um único perfil para validar economics antes de expandir.",
      },
    ];
  } else if (bucket === "Promissor") {
    nextSteps = [
      {
        title: "Validar canal com 5 entrevistas pagas",
        body: "Cliente real, problema real, disposição a pagar testada na prática.",
      },
      {
        title: "Fechar plano técnico de 90 dias",
        body: "Backlog priorizado, riscos técnicos mapeados e marcos semanais.",
      },
      {
        title: "Mapear 3 concorrentes diretos e indiretos",
        body: "Posicionamento, preço e gaps de produto para isolar vantagem.",
      },
    ];
  } else if (bucket === "Em desenvolvimento") {
    nextSteps = [
      {
        title: "Refinar ICP com 10 conversas qualitativas",
        body: "Quem paga, qual o porte e qual o canal possível.",
      },
      {
        title: "Construir MVP enxuto em 6 semanas",
        body: "Hipótese central isolada, sem features secundárias.",
      },
      {
        title: "Definir métrica única de validação",
        body: "Um número que prova ou derruba a tese nos próximos 90 dias.",
      },
    ];
  } else {
    nextSteps = [
      {
        title: "Voltar ao problema, sem solução em mente",
        body: "5 entrevistas abertas com clientes potenciais antes de codar nada.",
      },
      {
        title: "Testar 2 hipóteses alternativas em paralelo",
        body: "Reduzir custo de descobrir que a tese atual não fecha.",
      },
      {
        title: "Estabelecer critério de parada honesto",
        body: "O sinal mínimo que precisa aparecer em 60 dias pra seguir investindo.",
      },
    ];
  }

  // 3 perguntas estratégicas.
  let strategicQuestions: string[];
  if (bucket === "Forte" || bucket === "Promissor") {
    strategicQuestions = [
      "Quem é o decisor real de compra na conta-alvo, e quanto tempo dura o ciclo de venda?",
      "Qual o CAC esperado nos primeiros 12 meses, e como ele se compara ao LTV projetado?",
      "Que evidência você tem de que o problema vale pelo menos 10x o preço cobrado?",
    ];
  } else {
    strategicQuestions = [
      "Qual a evidência mais forte que você tem hoje de que esse cliente paga por essa solução?",
      "Se a tese estiver errada, qual o sinal que faria você mudar de direção nos próximos 60 dias?",
      "Quem na sua mesa vai construir isso, e por que essa pessoa é a certa pra esse problema?",
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
const REQUIRED_AXES = ["Mercado", "Execução", "Diferenciação", "Modelo", "Regulatório"];
const REQUIRED_LOCKED_AXES = [
  "Defensabilidade",
  "Time-to-market",
  "Capital eficiente",
  "Canal de aquisição",
  "Risco regulatório",
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

  const apiKey = process.env.GOOGLE_API_KEY;
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
