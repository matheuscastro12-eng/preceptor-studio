import * as oasis from "../colheita/oasis";

export interface Pergunta {
  id: string; grupo: string; texto: string; tipo: "texto" | "simnao" | "escolha";
  detalhe?: string; opcoes?: string[]; multipla?: boolean; origem: string;
}
export interface Colheita {
  versao: number;
  titulo: string;
  introducao: string;
  instrucaoFichas: string;
  grupos: { id: string; nome: string; quem: string }[];
  perguntas: Pergunta[];
  ocorrencias: { id: string; texto: string; ficha: string; origem: string }[];
  fichas: Record<string, { nome: string; quando: string; campos: { id: string; rotulo: string; ajuda?: string; longo?: boolean; obrigatorio?: boolean }[] }>;
  listas: { id: string; titulo: string; ajuda: string; origem: string }[];
}
export const ETAPAS = ["escopo", "partitura", "personas", "corpus", "esqueleto", "passos", "ensaio", "verificacao", "sombra", "operacao"] as const;
export type Etapa = typeof ETAPAS[number];
export const NOMES: Record<Etapa, string> = { escopo: "Escopo", partitura: "Partitura", personas: "Personas", corpus: "Corpus", esqueleto: "Esqueleto", passos: "Passos", ensaio: "Ensaio", verificacao: "Verificação", sombra: "Sombra", operacao: "Operação" };
export interface Snapshot {
  atualizadoEm: string;
  etapa: Etapa;
  resumo: string;
  proximaAcao: string;
  testes: { passaram: number; total: number } | null;
  corpus: { validados: number; meta: number } | null;
  achados: { titulo: string; severidade: "alta" | "media" | "baixa"; estado: "aberto" | "resolvido" }[];
  atividades: { quando: string; titulo: string; detalhe: string }[];
  artefatos?: { id: string; titulo: string; estado: "proposto" | "aprovado" | "recusado" | "informativo"; conteudo: string }[];
}
export interface ProjetoOpera {
  slug: string; nome: string; cliente: string; processo: string; responsavel: string;
  tipo: "agente" | "plataforma" | "automacao";
  colheita_publica: boolean; painel_publico: boolean;
  colheita: Colheita; snapshot: Snapshot | null;
  atualizado_em?: string;
}
export const OASIS: ProjetoOpera = {
  slug: oasis.VENTURE.slug, nome: "OASIS CT-e", cliente: oasis.VENTURE.nome,
  processo: oasis.VENTURE.processo, responsavel: "", tipo: "agente",
  colheita_publica: true, painel_publico: true, snapshot: null,
  colheita: {
    versao: 1, titulo: "O que precisamos de vocês antes de ligar o agente",
    introducao: "Estamos construindo o agente que emite CT-e, CIOT, MDF-e e SM, e que para e avisa quando algo foge do esperado. Precisamos das respostas abaixo e de ocorrências reais, com data e nome de quem decidiu. O que não conseguirmos validar com vocês não será feito sozinho pelo agente.",
    instrucaoFichas: "Uma ficha por ocorrência real. Precisamos de 20 de cada tipo. Se o histórico do TRAFLOG puder ser exportado, a maior parte sai de lá.",
    grupos: oasis.GRUPOS, perguntas: oasis.PERGUNTAS, ocorrencias: oasis.OCORRENCIAS_PEDIDAS,
    fichas: oasis.FICHAS, listas: oasis.LISTAS_DE_RESPOSTAS,
  },
};

export function colheitaInicial(): Colheita {
  return {
    versao: 1, titulo: "Vamos entender como o trabalho acontece",
    introducao: "Conte como vocês trabalham hoje, quem toma as decisões e o que acontece quando algo sai do esperado. Respostas e ocorrências serão revisadas pela equipe antes de orientar a construção.",
    instrucaoFichas: "Registre uma ocorrência real por ficha, com data, evidência e a pessoa que decidiu. Uma resposta recebida ainda precisa ser validada para entrar no corpus.",
    grupos: [{ id: "operacao", nome: "Operação", quem: "quem realiza o trabalho" }, { id: "gestao", nome: "Gestão", quem: "quem responde pelo resultado" }],
    perguntas: [
      { id: "fluxo", grupo: "operacao", texto: "O que inicia o trabalho, quais passos vêm depois e como vocês sabem que terminou?", tipo: "texto", origem: "observar" },
      { id: "excecao", grupo: "operacao", texto: "Quando algo dá errado, quem decide o que fazer? Como essa pessoa é avisada?", tipo: "texto", origem: "observar" },
      { id: "dados", grupo: "operacao", texto: "Em quais sistemas ou arquivos estão os dados usados no processo?", tipo: "texto", origem: "observar" },
      { id: "resultado", grupo: "gestao", texto: "Qual resultado precisa melhorar e como ele é medido hoje?", tipo: "texto", origem: "linha-de-base" },
      { id: "limites", grupo: "gestao", texto: "Quais decisões precisam continuar com uma pessoa? Quem é responsável por elas?", tipo: "texto", origem: "risco" },
    ],
    ocorrencias: [{ id: "excecao", texto: "O processo parou e alguém precisou decidir como continuar", ficha: "caso", origem: "corpus" }],
    fichas: { caso: { nome: "Ocorrência real", quando: "Uma situação que já aconteceu na operação.", campos: [
      { id: "quando", rotulo: "Data da ocorrência", obrigatorio: true },
      { id: "referencia", rotulo: "Referência do caso", obrigatorio: true },
      { id: "entrada", rotulo: "O que aconteceu e qual informação chegou", longo: true, obrigatorio: true },
      { id: "decisao", rotulo: "O que foi decidido", longo: true, obrigatorio: true },
      { id: "quem", rotulo: "Quem decidiu", obrigatorio: true },
      { id: "resultado", rotulo: "O que aconteceu depois", longo: true },
    ] } },
    listas: [{ id: "decisoes", titulo: "O que pode ser decidido quando o processo para?", ajuda: "Uma opção por linha, com as palavras de quem trabalha hoje.", origem: "espaco-de-saida" }],
  };
}

const obj = (v: unknown): v is Record<string, any> => !!v && typeof v === "object" && !Array.isArray(v);
const str = (v: unknown, max = 400): v is string => typeof v === "string" && v.trim().length > 0 && v.length <= max;
export const slugValido = (v: unknown): v is string => typeof v === "string" && /^[a-z0-9][a-z0-9-]{1,60}$/.test(v);
const ids = (xs: Record<string, any>[]) => xs.every(x => typeof x.id === "string" && /^[a-zA-Z0-9_-]{1,60}$/.test(x.id) && !["__proto__", "constructor", "prototype"].includes(x.id)) && new Set(xs.map(x => x.id)).size === xs.length;

export function validarColheita(v: unknown): asserts v is Colheita {
  if (!obj(v) || !Number.isSafeInteger(v.versao) || v.versao < 1 || !str(v.titulo) || !str(v.introducao, 5000) || !str(v.instrucaoFichas, 2000)) throw new Error("Informe versão, título e instruções da colheita.");
  for (const key of ["grupos", "perguntas", "ocorrencias", "listas"]) {
    if (!Array.isArray(v[key]) || v[key].length > 200 || !v[key].every(obj) || !ids(v[key])) throw new Error(`Lista inválida: ${key}. Use identificadores únicos.`);
  }
  if (!v.grupos.length || !v.perguntas.length || !v.grupos.every((g: any) => str(g.nome) && str(g.quem))) throw new Error("Defina grupos e perguntas da colheita.");
  for (const p of v.perguntas) {
    if (!str(p.texto, 3000) || !str(p.origem) || !v.grupos.some((g: any) => g.id === p.grupo) || !["texto", "simnao", "escolha"].includes(p.tipo)) throw new Error("Pergunta inválida ou sem grupo.");
    if (p.tipo === "escolha" && (!Array.isArray(p.opcoes) || !p.opcoes.length || p.opcoes.length > 40 || !p.opcoes.every((x: any) => str(x)))) throw new Error("Pergunta de escolha precisa de opções.");
    if ((p.detalhe !== undefined && !str(p.detalhe, 3000)) || (p.multipla !== undefined && typeof p.multipla !== "boolean")) throw new Error("Detalhe ou seleção da pergunta inválidos.");
  }
  if (!obj(v.fichas) || !Object.keys(v.fichas).length || Object.keys(v.fichas).length > 20 || !ids(Object.keys(v.fichas).map(id => ({ id })))) throw new Error("Defina as fichas de ocorrência.");
  for (const f of Object.values(v.fichas)) {
    if (!obj(f) || !str(f.nome) || !str(f.quando, 2000) || !Array.isArray(f.campos) || !f.campos.length || f.campos.length > 50 || !f.campos.every((c: any) => obj(c) && str(c.id) && str(c.rotulo) && (c.ajuda === undefined || str(c.ajuda, 3000)) && (c.longo === undefined || typeof c.longo === "boolean") && (c.obrigatorio === undefined || typeof c.obrigatorio === "boolean")) || !ids(f.campos)) throw new Error("Ficha inválida.");
  }
  if (!v.ocorrencias.every((o: any) => str(o.texto, 3000) && Object.hasOwn(v.fichas, o.ficha)) || !v.listas.every((l: any) => str(l.titulo) && str(l.ajuda, 3000))) throw new Error("Ocorrência ou lista inválida.");
}

export function validarSnapshot(v: unknown): asserts v is Snapshot {
  if (!obj(v) || !str(v.atualizadoEm) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(v.atualizadoEm) || !Number.isFinite(Date.parse(v.atualizadoEm)) || new Date(v.atualizadoEm).toISOString() !== v.atualizadoEm || Date.parse(v.atualizadoEm) > Date.now() + 300_000 || !ETAPAS.includes(v.etapa) || !str(v.resumo, 5000) || !str(v.proximaAcao, 2000)) throw new Error("Informe data UTC válida, etapa, resumo e próxima ação do painel.");
  for (const [key, a, b] of [["testes", "passaram", "total"], ["corpus", "validados", "meta"]]) {
    const m = v[key];
    if (m !== null && (!obj(m) || !Number.isSafeInteger(m[a]) || !Number.isSafeInteger(m[b]) || m[a] < 0 || m[b] < m[a])) throw new Error(`Contagem inválida: ${key}.`);
  }
  if (!Array.isArray(v.achados) || v.achados.length > 200 || !v.achados.every((a: any) => obj(a) && str(a.titulo, 2000) && ["alta", "media", "baixa"].includes(a.severidade) && ["aberto", "resolvido"].includes(a.estado))) throw new Error("Achados inválidos.");
  if (!Array.isArray(v.atividades) || v.atividades.length > 100 || !v.atividades.every((a: any) => obj(a) && str(a.titulo) && str(a.detalhe, 5000) && str(a.quando) && Number.isFinite(Date.parse(a.quando)))) throw new Error("Atividades inválidas.");
  if (v.artefatos !== undefined && (!Array.isArray(v.artefatos) || v.artefatos.length > 30 || !v.artefatos.every((a: any) => obj(a) && str(a.titulo) && str(a.conteudo, 50_000) && ["proposto", "aprovado", "recusado", "informativo"].includes(a.estado)) || !ids(v.artefatos))) throw new Error("Artefatos inválidos. Use IDs únicos e conteúdo legível.");
}

export function validarProjeto(v: unknown): asserts v is ProjetoOpera {
  if (!obj(v) || !slugValido(v.slug) || !str(v.nome, 160) || !str(v.cliente, 160) || !str(v.processo, 2000) || !str(v.responsavel, 160) || !["agente", "plataforma", "automacao"].includes(v.tipo) || typeof v.colheita_publica !== "boolean" || typeof v.painel_publico !== "boolean") throw new Error("Preencha projeto, cliente, processo, responsável e visibilidade.");
  validarColheita(v.colheita);
  if (v.snapshot !== null) validarSnapshot(v.snapshot);
}
