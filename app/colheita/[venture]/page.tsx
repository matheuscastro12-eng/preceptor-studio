"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  FICHAS,
  GRUPOS,
  LISTAS_DE_RESPOSTAS,
  OCORRENCIAS_PEDIDAS,
  PERGUNTAS,
  VENTURE,
  type GrupoId,
  type Pergunta,
} from "@/lib/colheita/oasis";

// Formulario publico da colheita de corpus (OPERA). Rascunho no navegador,
// envio por /api/public/colheita. Sem login: quem responde e gente da
// operacao do cliente.

type SimNao = "sim" | "nao" | "nao_sei";
interface RespostaSimNao { resposta: SimNao | null; detalhe: string }
interface RespostaEscolha { escolhas: string[]; outro: string; detalhe: string }
interface RespostaTexto { texto: string }
type Resposta = RespostaSimNao | RespostaEscolha | RespostaTexto;
interface Ficha { tipo: "A" | "B" | "C"; campos: Record<string, string>; viu_sugestao: boolean }
interface Rascunho {
  nome: string; funcao: string; empresa: string; contato: string;
  grupos: GrupoId[];
  respostas: Record<string, Resposta>;
  pedidas: Record<string, { resposta: SimNao | null; quantas: string; detalhe: string }>;
  fichas: Ficha[];
  rotulos: Record<string, string>;
}

const VAZIO: Rascunho = { nome: "", funcao: "", empresa: "OASIS", contato: "", grupos: ["operacao"], respostas: {}, pedidas: {}, fichas: [], rotulos: {} };
const CHAVE = (v: string) => `colheita:${v}:rascunho`;

export default function ColheitaPage() {
  const params = useParams();
  const slug = String(params?.venture ?? "");
  const valido = slug === VENTURE.slug;
  const [r, setR] = useState<Rascunho>(VAZIO);
  const [carregado, setCarregado] = useState(false);
  const [etapa, setEtapa] = useState<"perguntas" | "ocorrencias" | "listas">("perguntas");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE(slug));
      if (salvo) setR({ ...VAZIO, ...(JSON.parse(salvo) as Partial<Rascunho>) });
    } catch { /* sem rascunho */ }
    setCarregado(true);
  }, [slug]);
  useEffect(() => {
    if (!carregado) return;
    try { localStorage.setItem(CHAVE(slug), JSON.stringify(r)); } catch { /* sem armazenamento */ }
  }, [r, slug, carregado]);

  const perguntasVisiveis = useMemo(() => PERGUNTAS.filter((p) => r.grupos.includes(p.grupo)), [r.grupos]);
  const respondidas = perguntasVisiveis.filter((p) => temResposta(p, r.respostas[p.id])).length;

  const set = (patch: Partial<Rascunho>) => setR((a) => ({ ...a, ...patch }));
  const setResposta = (id: string, v: Resposta) => setR((a) => ({ ...a, respostas: { ...a.respostas, [id]: v } }));

  async function enviar() {
    setErro(null);
    if (!r.nome.trim()) { setErro("Diga seu nome. Resposta sem nome a gente não consegue usar."); return; }
    setEnviando(true);
    try {
      const res = await fetch("/api/public/colheita", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venture: slug, nome: r.nome, funcao: r.funcao, empresa: r.empresa, contato: r.contato,
          grupos: r.grupos, respostas: r.respostas,
          ocorrencias: { pedidas: r.pedidas, fichas: r.fichas }, rotulos: r.rotulos,
        }),
      });
      const j = (await res.json()) as { ok?: boolean; id?: string; error?: string };
      if (!res.ok || !j.ok) { setErro(j.error ?? "Não conseguimos gravar agora."); return; }
      setEnviado(j.id ?? "ok");
      try { localStorage.removeItem(CHAVE(slug)); } catch { /* ok */ }
    } catch {
      setErro("Sem conexão agora. Suas respostas ficam salvas neste navegador; tente de novo em um minuto.");
    } finally {
      setEnviando(false);
    }
  }

  if (!valido) {
    return (
      <Casca>
        <div className="surface rounded-2xl p-10 text-center max-w-md mx-auto">
          <h1 className="text-xl font-black text-navy mb-2">Link não encontrado</h1>
          <p className="text-ink-soft text-sm">Confira o endereço com quem te mandou.</p>
        </div>
      </Casca>
    );
  }

  if (enviado) {
    return (
      <Casca>
        <div className="surface rounded-2xl p-10 max-w-xl mx-auto">
          <div className="eyebrow mb-2">Recebido</div>
          <h1 className="text-2xl font-black text-navy mb-3">Obrigado, {r.nome.split(" ")[0]}.</h1>
          <p className="text-ink-soft mb-4">Suas respostas foram gravadas. Se lembrar de mais alguma ocorrência, pode abrir o link de novo e mandar outra: cada envio fica registrado separado.</p>
          <button className="btn-ghost" onClick={() => { setEnviado(null); setR({ ...VAZIO, nome: r.nome, funcao: r.funcao, empresa: r.empresa, contato: r.contato, grupos: r.grupos }); }}>Mandar outra resposta</button>
        </div>
      </Casca>
    );
  }

  return (
    <Casca>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="eyebrow mb-2">{VENTURE.nome} · {VENTURE.processo}</div>
          <h1 className="text-3xl font-black text-navy tracking-tight mb-3" style={{ fontFamily: "var(--font-display)" }}>O que precisamos de vocês antes de ligar o agente</h1>
          <p className="text-ink-soft leading-relaxed">
            Estamos construindo o agente que emite CT-e, CIOT, MDF-e e SM, e que para e avisa quando algo foge do esperado.
            Para ele nunca decidir nada que uma pessoa de vocês não decidiria hoje, precisamos de duas coisas: as respostas
            para as perguntas abaixo, e ocorrências reais que já aconteceram, com data e com o nome de quem decidiu.
            O que a gente não conseguir com vocês, o agente simplesmente não vai fazer sozinho.
          </p>
          <p className="text-ink-mute text-sm mt-2">Não precisa responder tudo de uma vez: o rascunho fica salvo neste navegador. Responda o que é da sua área.</p>
        </div>

        <section className="surface rounded-2xl p-6 mb-6">
          <h2 className="text-base font-extrabold text-navy mb-4">Quem está respondendo</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Campo rotulo="Seu nome" obrigatorio><input className="input-field" value={r.nome} onChange={(e) => set({ nome: e.target.value })} placeholder="Nome e sobrenome" /></Campo>
            <Campo rotulo="Função"><input className="input-field" value={r.funcao} onChange={(e) => set({ funcao: e.target.value })} placeholder="Ex.: operação, faturamento, gestor" /></Campo>
            <Campo rotulo="Empresa"><input className="input-field" value={r.empresa} onChange={(e) => set({ empresa: e.target.value })} /></Campo>
            <Campo rotulo="Contato (WhatsApp ou e-mail)"><input className="input-field" value={r.contato} onChange={(e) => set({ contato: e.target.value })} placeholder="Para tirar dúvida sobre uma resposta" /></Campo>
          </div>
          <div className="mt-5">
            <div className="text-xs font-bold text-ink-soft mb-2">Sobre o que você responde? (pode marcar mais de um)</div>
            <div className="flex flex-wrap gap-2">
              {GRUPOS.map((g) => {
                const on = r.grupos.includes(g.id);
                return (
                  <button key={g.id} type="button" onClick={() => set({ grupos: on ? r.grupos.filter((x) => x !== g.id) : [...r.grupos, g.id] })}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold border transition ${on ? "bg-navy-deep text-white border-navy-deep" : "bg-white text-ink-soft border-ink/10 hover:border-ink/25"}`}>
                    {g.nome} <span className={`text-xs font-medium ${on ? "text-cyan" : "text-ink-mute"}`}>· {g.quem}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <nav className="flex gap-2 mb-4 flex-wrap">
          <Aba on={etapa === "perguntas"} onClick={() => setEtapa("perguntas")}>1. Perguntas <span className="opacity-70">{respondidas}/{perguntasVisiveis.length}</span></Aba>
          <Aba on={etapa === "ocorrencias"} onClick={() => setEtapa("ocorrencias")}>2. Ocorrências reais <span className="opacity-70">{r.fichas.length} ficha{r.fichas.length === 1 ? "" : "s"}</span></Aba>
          <Aba on={etapa === "listas"} onClick={() => setEtapa("listas")}>3. Respostas possíveis</Aba>
        </nav>

        {etapa === "perguntas" && (
          <div className="space-y-6">
            {GRUPOS.filter((g) => r.grupos.includes(g.id)).map((g) => (
              <section key={g.id} className="surface rounded-2xl p-6">
                <div className="eyebrow mb-1">{g.nome}</div>
                <h2 className="text-base font-extrabold text-navy mb-4">Para {g.quem}</h2>
                <ol className="space-y-6">
                  {PERGUNTAS.filter((p) => p.grupo === g.id).map((p) => (
                    <li key={p.id} className="border-t border-ink/5 pt-5 first:border-t-0 first:pt-0">
                      <PerguntaView p={p} valor={r.respostas[p.id]} onChange={(v) => setResposta(p.id, v)} numero={PERGUNTAS.indexOf(p) + 1} />
                    </li>
                  ))}
                </ol>
              </section>
            ))}
            {!r.grupos.length && <p className="text-ink-mute text-sm">Marque acima sobre o que você responde.</p>}
          </div>
        )}

        {etapa === "ocorrencias" && (
          <div className="space-y-6">
            <section className="surface rounded-2xl p-6">
              <h2 className="text-base font-extrabold text-navy mb-1">Já aconteceu na {VENTURE.nome}?</h2>
              <p className="text-sm text-ink-soft mb-5">Se alguma nunca aconteceu, marque <b>Não</b>: isso também é resposta, e muda o desenho. Cenário hipotético não serve; ocorrência com data vale mais que dez descrições.</p>
              <ol className="space-y-5">
                {OCORRENCIAS_PEDIDAS.map((o, i) => {
                  const v = r.pedidas[o.id] ?? { resposta: null, quantas: "", detalhe: "" };
                  const setP = (patch: Partial<typeof v>) => setR((a) => ({ ...a, pedidas: { ...a.pedidas, [o.id]: { ...v, ...patch } } }));
                  return (
                    <li key={o.id} className="border-t border-ink/5 pt-4 first:border-t-0 first:pt-0">
                      <div className="flex gap-3">
                        <span className="text-xs font-mono text-ink-mute pt-1 w-6 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-navy mb-2">{o.texto} <span className="text-xs font-medium text-ink-mute">· ficha {o.ficha}</span></p>
                          <SimNaoBotoes valor={v.resposta} onChange={(x) => setP({ resposta: x })} />
                          {v.resposta === "sim" && (
                            <div className="grid sm:grid-cols-[140px_1fr] gap-3 mt-3">
                              <input className="input-field" placeholder="Quantas vezes?" value={v.quantas} onChange={(e) => setP({ quantas: e.target.value })} />
                              <input className="input-field" placeholder="Quando foi a última vez, e o que foi feito" value={v.detalhe} onChange={(e) => setP({ detalhe: e.target.value })} />
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>

            <section className="surface rounded-2xl p-6">
              <h2 className="text-base font-extrabold text-navy mb-1">Fichas de ocorrência</h2>
              <p className="text-sm text-ink-soft mb-4">Uma ficha por ocorrência real. Quanto mais, melhor: precisamos de 20 de cada tipo. Se o histórico do TRAFLOG puder ser exportado, a maior parte sai de lá.</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {(["A", "B", "C"] as const).map((t) => (
                  <button key={t} type="button" className="btn-ghost text-sm" onClick={() => set({ fichas: [...r.fichas, { tipo: t, campos: {}, viu_sugestao: false }] })}>+ {FICHAS[t].nome.split(".")[0]}</button>
                ))}
              </div>
              {r.fichas.length === 0 && <p className="text-ink-mute text-sm">Nenhuma ficha ainda. Ficha A: o veículo ainda estava no pátio? Ficha B: o retorno da gerenciadora. Ficha C: o fluxo parou no meio.</p>}
              <div className="space-y-5">
                {r.fichas.map((f, i) => {
                  const def = FICHAS[f.tipo];
                  const setF = (patch: Partial<Ficha>) => setR((a) => ({ ...a, fichas: a.fichas.map((x, j) => (j === i ? { ...x, ...patch } : x)) }));
                  return (
                    <div key={i} className="rounded-xl border border-ink/10 p-4 bg-surface-2">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div>
                          <div className="font-bold text-navy">{def.nome}</div>
                          <div className="text-xs text-ink-mute">{def.quando}</div>
                        </div>
                        <button type="button" className="text-xs font-bold text-danger-rose" onClick={() => set({ fichas: r.fichas.filter((_, j) => j !== i) })}>remover</button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3 mt-3">
                        {def.campos.map((c) => (
                          <div key={c.id} className={c.longo ? "sm:col-span-2" : ""}>
                            <label className="block text-xs font-bold text-ink-soft mb-1">{c.rotulo}{c.obrigatorio && <span className="text-danger-rose"> *</span>}{c.ajuda && <span className="font-medium text-ink-mute"> · {c.ajuda}</span>}</label>
                            {c.longo
                              ? <textarea className="input-field min-h-[72px]" value={f.campos[c.id] ?? ""} onChange={(e) => setF({ campos: { ...f.campos, [c.id]: e.target.value } })} />
                              : <input className="input-field" value={f.campos[c.id] ?? ""} onChange={(e) => setF({ campos: { ...f.campos, [c.id]: e.target.value } })} />}
                          </div>
                        ))}
                      </div>
                      <label className="flex items-center gap-2 mt-3 text-xs text-ink-soft"><input type="checkbox" checked={f.viu_sugestao} onChange={(e) => setF({ viu_sugestao: e.target.checked })} /> Quem decidiu já tinha visto alguma sugestão nossa antes de decidir</label>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {etapa === "listas" && (
          <section className="surface rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-base font-extrabold text-navy mb-1">As respostas possíveis, nas palavras de quem decide</h2>
              <p className="text-sm text-ink-soft">Cada lista precisa de pelo menos duas opções. São as palavras de vocês: se chamam de "segurar", a opção se chama "segurar". Se tiver um "depende", vira duas: depende do quê.</p>
            </div>
            {LISTAS_DE_RESPOSTAS.map((l) => (
              <div key={l.id}>
                <label className="block font-semibold text-navy mb-1">{l.titulo}</label>
                <p className="text-xs text-ink-mute mb-2">{l.ajuda}</p>
                <textarea className="input-field min-h-[96px] font-mono text-sm" placeholder={"uma opção por linha"} value={r.rotulos[l.id] ?? ""} onChange={(e) => set({ rotulos: { ...r.rotulos, [l.id]: e.target.value } })} />
              </div>
            ))}
          </section>
        )}

        <div className="surface rounded-2xl p-5 mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-ink-soft">
            <b className="text-navy">{respondidas}</b> de {perguntasVisiveis.length} perguntas · <b className="text-navy">{Object.values(r.pedidas).filter((x) => x.resposta).length}</b> de {OCORRENCIAS_PEDIDAS.length} ocorrências · <b className="text-navy">{r.fichas.length}</b> fichas
            {erro && <div className="text-danger-rose font-semibold mt-1">{erro}</div>}
          </div>
          <button className="btn-cyan" disabled={enviando} onClick={enviar}>{enviando ? "Enviando…" : "Enviar respostas"}</button>
        </div>
        <p className="text-xs text-ink-mute mt-4">Pode enviar mais de uma vez: cada envio fica registrado separado. O que não serve: cenário hipotético, "costuma acontecer" sem data, ocorrência sem o nome de quem decidiu, ficha com um status só, e resumo do retorno da gerenciadora ou da SEFAZ no lugar do texto como veio.</p>
      </div>
    </Casca>
  );
}

function temResposta(p: Pergunta, v: Resposta | undefined): boolean {
  if (!v) return false;
  if (p.tipo === "simnao") { const x = v as RespostaSimNao; return !!x.resposta || !!x.detalhe?.trim(); }
  if (p.tipo === "escolha") { const x = v as RespostaEscolha; return x.escolhas.length > 0 || !!x.outro?.trim() || !!x.detalhe?.trim(); }
  return !!(v as RespostaTexto).texto?.trim();
}

function PerguntaView({ p, valor, onChange, numero }: { p: Pergunta; valor: Resposta | undefined; onChange: (v: Resposta) => void; numero: number }) {
  return (
    <div className="flex gap-3">
      <span className="text-xs font-mono text-ink-mute pt-1 w-6 shrink-0">{String(numero).padStart(2, "0")}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-navy mb-2 leading-snug">{p.texto}</p>
        {p.tipo === "simnao" && (() => { const v = (valor as RespostaSimNao) ?? { resposta: null, detalhe: "" }; return (
          <>
            <SimNaoBotoes valor={v.resposta} onChange={(x) => onChange({ ...v, resposta: x })} />
            {(p.detalhe || v.resposta) && <input className="input-field mt-3" placeholder={p.detalhe ?? "Conte mais, se quiser"} value={v.detalhe} onChange={(e) => onChange({ ...v, detalhe: e.target.value })} />}
          </>
        ); })()}
        {p.tipo === "escolha" && (() => { const v = (valor as RespostaEscolha) ?? { escolhas: [], outro: "", detalhe: "" }; return (
          <>
            <div className="flex flex-wrap gap-2">
              {(p.opcoes ?? []).map((o) => {
                const on = v.escolhas.includes(o);
                return <Opcao key={o} on={on} onClick={() => onChange({ ...v, escolhas: p.multipla ? (on ? v.escolhas.filter((x) => x !== o) : [...v.escolhas, o]) : (on ? [] : [o]) })}>{o}</Opcao>;
              })}
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <input className="input-field" placeholder="Outro" value={v.outro} onChange={(e) => onChange({ ...v, outro: e.target.value })} />
              {p.detalhe && <input className="input-field" placeholder={p.detalhe} value={v.detalhe} onChange={(e) => onChange({ ...v, detalhe: e.target.value })} />}
            </div>
          </>
        ); })()}
        {p.tipo === "texto" && (
          <textarea className="input-field min-h-[80px]" placeholder={p.detalhe ?? "Sua resposta"} value={(valor as RespostaTexto)?.texto ?? ""} onChange={(e) => onChange({ texto: e.target.value })} />
        )}
      </div>
    </div>
  );
}

function SimNaoBotoes({ valor, onChange }: { valor: SimNao | null; onChange: (v: SimNao | null) => void }) {
  const ops: [SimNao, string][] = [["sim", "Sim"], ["nao", "Não"], ["nao_sei", "Não sei"]];
  return (
    <div className="flex gap-2" role="radiogroup">
      {ops.map(([k, t]) => <Opcao key={k} on={valor === k} onClick={() => onChange(valor === k ? null : k)} role="radio" checked={valor === k}>{t}</Opcao>)}
    </div>
  );
}

function Opcao({ on, onClick, children, role, checked }: { on: boolean; onClick: () => void; children: React.ReactNode; role?: string; checked?: boolean }) {
  return (
    <button type="button" role={role} aria-checked={checked} onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition ${on ? "bg-cyan text-navy-deep border-cyan shadow-cyan" : "bg-white text-ink-soft border-ink/10 hover:border-cyan"}`}>
      {children}
    </button>
  );
}

function Aba({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={`px-4 py-2 rounded-lg text-sm font-bold border transition ${on ? "bg-navy-deep text-white border-navy-deep" : "bg-white text-ink-soft border-ink/10 hover:border-ink/25"}`}>{children}</button>;
}

function Campo({ rotulo, obrigatorio, children }: { rotulo: string; obrigatorio?: boolean; children: React.ReactNode }) {
  return <label className="block"><span className="block text-xs font-bold text-ink-soft mb-1">{rotulo}{obrigatorio && <span className="text-danger-rose"> *</span>}</span>{children}</label>;
}

function Casca({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-navy-deep border-b border-cyan/30">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent opacity-80" />
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/p-mark-teal.png" alt="" className="w-7 h-7 rounded-md" />
            <div className="flex items-baseline gap-2">
              <span className="text-white font-black text-base tracking-tight">PRECEPTOR!</span>
              <span className="text-cyan text-[10px] font-bold tracking-[0.25em] hidden sm:inline">STUDIO</span>
            </div>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-cyan/70 font-bold">Colheita · {VENTURE.nome}</span>
        </div>
      </header>
      <main className="px-6 py-10">{children}</main>
    </div>
  );
}
