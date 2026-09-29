// Formulário de onboarding de cliente: o que a PRECEPTOR! precisa receber para
// começar uma implantação (acessos, cadastros, exemplos reais). Cada cliente tem
// uma definição em lib/onboarding/<slug>.ts; a página e a rota pública são genéricas.
//
// Nunca pedir senha, token ou chave aqui: credencial vai por canal combinado
// com o responsável da PRECEPTOR!. A rota pública recusa campos com cara de segredo.

export type Campo =
  | { tipo: "texto"; id: string; rotulo: string; ajuda?: string; placeholder?: string }
  | { tipo: "longo"; id: string; rotulo: string; ajuda?: string; placeholder?: string }
  | { tipo: "escolha"; id: string; rotulo: string; ajuda?: string; opcoes: string[]; outro?: boolean }
  | { tipo: "tabela"; id: string; rotulo: string; ajuda?: string; colunas: Coluna[]; linhasIniciais?: number; aceitaPlanilha?: boolean }
  | { tipo: "arquivos"; id: string; rotulo: string; ajuda?: string; aceita: string[]; maxArquivos?: number };

export interface Coluna {
  id: string;
  rotulo: string;
  opcoes?: string[];
  placeholder?: string;
}

export interface Secao {
  id: string;
  /** Rótulo curto da fase, como no deck: "Fase 1", "Tudo". */
  fase: string;
  titulo: string;
  destrava: string;
  descricao?: string;
  campos: Campo[];
}

export interface Onboarding {
  slug: string;
  versao: number;
  cliente: string;
  titulo: string;
  introducao: string;
  /** Aviso sobre credenciais, mostrado no topo. */
  avisoCredenciais: string;
  responsavel: { nome: string; empresa: string; email: string };
  secoes: Secao[];
}

export const EXTENSOES_PERMITIDAS: Record<string, string> = {
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  csv: "text/csv",
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  svg: "image/svg+xml",
  eml: "message/rfc822",
  msg: "application/vnd.ms-outlook",
  txt: "text/plain",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  zip: "application/zip",
};
export const MAX_BYTES_ARQUIVO = 20 * 1024 * 1024;
export const BUCKET_ONBOARDING = "onboarding";

export function extensao(nome: string): string {
  const m = /\.([a-z0-9]{1,5})$/i.exec(nome.trim());
  return m ? m[1]!.toLowerCase() : "";
}

export function todosOsCampos(o: Onboarding): Campo[] {
  return o.secoes.flatMap((s) => s.campos);
}

/** A resposta que o navegador envia e que a rota grava depois de limpar. */
export interface RespostaOnboarding {
  nome: string;
  funcao: string;
  contato: string;
  valores: Record<string, unknown>;
  arquivos: { campo: string; caminho: string; nome: string; bytes: number }[];
}

const MAX_CURTO = 400;
const MAX_LONGO = 12000;
const MAX_LINHAS = 500;

function curto(v: unknown, max = MAX_CURTO): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/**
 * Palavras que indicam credencial. O formulário não é lugar de senha: se alguém
 * colar uma, recusamos o envio inteiro e explicamos o canal certo.
 */
const PARECE_SEGREDO = [
  /senha\s*[:=]/i,
  /password\s*[:=]/i,
  /\bsk-[A-Za-z0-9_-]{16,}/,
  /\b(pk|sk|rk)_(live|test)_[A-Za-z0-9]{10,}/,
  /\bre_[A-Za-z0-9_]{16,}/,
  /\bgh[pousr]_[A-Za-z0-9]{20,}/,
  /\bsbp_[a-f0-9]{20,}/,
  /GOCSPX-[A-Za-z0-9_-]{10,}/,
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
];

export function pareceSegredo(texto: string): boolean {
  return PARECE_SEGREDO.some((re) => re.test(texto));
}

/** Limpa os valores enviados contra a definição. Campos desconhecidos são descartados. */
export function limparValores(bruto: unknown, o: Onboarding): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!bruto || typeof bruto !== "object" || Array.isArray(bruto)) return out;
  const b = bruto as Record<string, unknown>;
  for (const campo of todosOsCampos(o)) {
    const v = b[campo.id];
    if (v === undefined || v === null) continue;
    if (campo.tipo === "texto") {
      const t = curto(v);
      if (t) out[campo.id] = t;
    } else if (campo.tipo === "longo") {
      const t = curto(v, MAX_LONGO);
      if (t) out[campo.id] = t;
    } else if (campo.tipo === "escolha") {
      if (typeof v !== "object") continue;
      const x = v as Record<string, unknown>;
      const escolha = curto(x.escolha, 200);
      const valida = campo.opcoes.includes(escolha) ? escolha : "";
      const outro = campo.outro ? curto(x.outro) : "";
      if (valida || outro) out[campo.id] = { escolha: valida || null, outro: outro || null };
    } else if (campo.tipo === "tabela") {
      if (!Array.isArray(v)) continue;
      const linhas: Record<string, string>[] = [];
      for (const linha of v.slice(0, MAX_LINHAS)) {
        if (!linha || typeof linha !== "object") continue;
        const l: Record<string, string> = {};
        for (const col of campo.colunas) {
          const c = curto((linha as Record<string, unknown>)[col.id]);
          if (!c) continue;
          if (col.opcoes && !col.opcoes.includes(c)) continue;
          l[col.id] = c;
        }
        if (Object.keys(l).length) linhas.push(l);
      }
      if (linhas.length) out[campo.id] = linhas;
    }
  }
  return out;
}

export function textoDosValores(valores: Record<string, unknown>): string {
  return JSON.stringify(valores);
}
