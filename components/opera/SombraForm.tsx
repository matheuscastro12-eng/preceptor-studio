"use client";

import { useEffect, useMemo, useState } from "react";
import { DECISOES, type TipoDeAcao } from "@/lib/opera/sombra";

// A tela da sombra: uma pessoa da operação registra a decisão que acabou de
// tomar, antes do agente.
//
// Esta tela NUNCA mostra decisão de agente, e nada aqui vai buscar uma. Se ela
// mostrasse, a apuração passaria a medir concordância com uma resposta que a
// pessoa leu, e concordância não mede nada. O motivo está escrito na própria
// página, para quem usa entender por que a tela é assim.
//
// Quem preenche está no meio do trabalho e tem trinta segundos: nome, ordem e
// nota ficam guardados neste navegador, e o próximo registro começa com eles
// preenchidos.

const CHAVE = (v: string) => `sombra:${v}:rascunho`;

interface Rascunho {
  quem: string;
  ordem_carregamento: string;
  chave_nfe: string;
  tipo: string;
  decisao: string;
  nota: string;
  tela: string;
  sistema: string;
}

const SISTEMAS = ["TRAFLOG", "SEFAZ", "Registradora", "Gerenciadora", "WhatsApp", "Pátio"];

export default function SombraForm({ venture, cliente, processo, tipos }: {
  venture: string; cliente: string; processo: string; tipos: TipoDeAcao[];
}) {
  const VAZIO = useMemo<Rascunho>(() => ({
    quem: "", ordem_carregamento: "", chave_nfe: "", tipo: "", decisao: "", nota: "", tela: "", sistema: "",
  }), []);
  const [r, setR] = useState<Rascunho>(VAZIO);
  const [carregado, setCarregado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE(venture));
      if (salvo) setR({ ...VAZIO, ...(JSON.parse(salvo) as Partial<Rascunho>) });
    } catch { /* sem rascunho */ }
    setCarregado(true);
  }, [venture, VAZIO]);

  useEffect(() => {
    if (!carregado) return;
    try { localStorage.setItem(CHAVE(venture), JSON.stringify(r)); } catch { /* sem armazenamento */ }
  }, [r, venture, carregado]);

  const set = (patch: Partial<Rascunho>) => setR((a) => ({ ...a, ...patch }));
  const escolhido = tipos.find((t) => t.id === r.tipo) ?? null;
  const digitos = r.chave_nfe.replace(/\D/g, "");
  const degraus = useMemo(() => [...new Set(tipos.map((t) => t.degrau))], [tipos]);

  async function enviar() {
    setErro(null);
    if (!r.quem.trim()) { setErro("Diga quem decidiu. Decisão sem nome não entra na sombra."); return; }
    if (!r.ordem_carregamento.trim()) { setErro("Diga qual a ordem de carregamento."); return; }
    if (digitos.length !== 44) { setErro("A chave da nota tem 44 dígitos. Confira e cole de novo."); return; }
    if (!escolhido) { setErro("Escolha o tipo de ação."); return; }
    if (!r.decisao) { setErro("Diga o que você decidiu."); return; }
    if (r.decisao === "outra" && !r.nota.trim()) { setErro("Você marcou Outra. Escreva com as suas palavras o que decidiu."); return; }
    setEnviando(true);
    try {
      const res = await fetch("/api/public/sombra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venture, quem: r.quem, ordem_carregamento: r.ordem_carregamento, chave_nfe: digitos,
          tipo: r.tipo, decisao: r.decisao, nota: r.nota, tela: r.tela, sistema: r.sistema,
        }),
      });
      const j = (await res.json()) as { ok?: boolean; id?: string; error?: string };
      if (!res.ok || !j.ok) { setErro(j.error ?? "Não conseguimos gravar agora."); return; }
      setEnviado(j.id ?? "ok");
    } catch {
      setErro("Sem conexão agora. A sua decisão fica salva neste navegador; tente de novo em um minuto.");
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <Casca nome={cliente}>
        <div className="surface rounded-2xl p-10 max-w-xl mx-auto">
          <div className="eyebrow mb-2">Registrado</div>
          <h1 className="text-2xl font-black text-navy mb-3">Ficou guardado, {r.quem.split(" ")[0]}.</h1>
          <p className="text-ink-soft mb-2">
            A sua decisão foi gravada antes de o agente decidir este caso. Ela não pode mais ser reescrita, e é isso que faz o par valer.
          </p>
          <p className="text-ink-mute text-sm mb-5">Ordem {r.ordem_carregamento} · {escolhido?.curto}</p>
          <div className="flex gap-2 flex-wrap">
            <button className="btn-primary" onClick={() => { setEnviado(null); set({ tipo: "", decisao: "", nota: "", tela: "" }); }}>
              Próximo passo deste carregamento
            </button>
            <button className="btn-ghost" onClick={() => { setEnviado(null); set({ ordem_carregamento: "", chave_nfe: "", tipo: "", decisao: "", nota: "", tela: "" }); }}>
              Outro carregamento
            </button>
          </div>
        </div>
      </Casca>
    );
  }

  return (
    <Casca nome={cliente}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="eyebrow mb-2">{cliente} · {processo}</div>
          <h1 className="text-3xl font-black text-navy tracking-tight mb-3" style={{ fontFamily: "var(--font-display)" }}>
            Registre a sua decisão antes do agente
          </h1>
          <p className="text-ink-soft leading-relaxed">
            Você acabou de decidir alguma coisa num carregamento. Anote aqui, em trinta segundos, e siga o seu trabalho.
          </p>
          <p className="text-ink-soft text-sm mt-3 border-l-2 border-cyan pl-3">
            Esta tela não mostra o que o agente decidiu, e nunca vai mostrar: se você visse a resposta dele antes de decidir, a comparação mediria concordância, e não acerto.
          </p>
        </div>

        <section className="surface rounded-2xl p-6 mb-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Campo rotulo="Quem decidiu" obrigatorio>
              <input className="input-field" value={r.quem} onChange={(e) => set({ quem: e.target.value })} placeholder="Seu nome" autoComplete="name" />
            </Campo>
            <Campo rotulo="Ordem de carregamento" obrigatorio>
              <input className="input-field" value={r.ordem_carregamento} onChange={(e) => set({ ordem_carregamento: e.target.value })} placeholder="Como aparece no TRAFLOG" />
            </Campo>
          </div>
          <div className="mt-4">
            <Campo rotulo="Chave da NF-e" obrigatorio>
              <input className="input-field font-mono text-sm" value={r.chave_nfe} onChange={(e) => set({ chave_nfe: e.target.value })}
                placeholder="44 dígitos, pode colar com espaços" inputMode="numeric" />
            </Campo>
            <div className={`text-xs mt-1 ${digitos.length === 44 ? "text-ink-mute" : "text-ink-soft"}`}>
              {digitos.length} de 44 dígitos
            </div>
          </div>
        </section>

        <section className="surface rounded-2xl p-6 mb-4">
          <h2 className="text-base font-extrabold text-navy mb-1">Qual passo era</h2>
          <p className="text-ink-mute text-xs mb-3">Os dezessete passos da cadeia, como a partitura os nomeia.</p>
          <select className="input-field" value={r.tipo} onChange={(e) => set({ tipo: e.target.value })}>
            <option value="">Escolha o passo</option>
            {degraus.map((d) => (
              <optgroup key={d} label={d}>
                {tipos.filter((t) => t.degrau === d).map((t) => (
                  <option key={t.id} value={t.id}>{t.curto}</option>
                ))}
              </optgroup>
            ))}
          </select>
          {escolhido && (
            <p className="text-ink-mute text-xs mt-3 leading-relaxed">
              {escolhido.nome}
              {escolhido.nuncaGradua && <span className="text-danger-rose font-bold"> · passo irreversível, nunca gradua</span>}
            </p>
          )}
        </section>

        <section className="surface rounded-2xl p-6 mb-4">
          <h2 className="text-base font-extrabold text-navy mb-3">O que você decidiu</h2>
          <div className="flex flex-wrap gap-2">
            {DECISOES.map((d) => (
              <button key={d.id} type="button" onClick={() => set({ decisao: r.decisao === d.id ? "" : d.id })}
                title={d.ajuda}
                className={`px-3 py-2 rounded-lg text-sm font-semibold border transition ${r.decisao === d.id ? "bg-cyan text-navy-deep border-cyan shadow-cyan" : "bg-white text-ink-soft border-ink/10 hover:border-cyan"}`}>
                {d.rotulo} <span className={`text-xs font-medium ${r.decisao === d.id ? "text-navy-deep/70" : "text-ink-mute"}`}>· {d.ajuda}</span>
              </button>
            ))}
          </div>
          <div className="mt-4">
            <Campo rotulo={r.decisao === "outra" ? "Com as suas palavras" : "Quer dizer mais alguma coisa? (opcional)"} obrigatorio={r.decisao === "outra"}>
              <input className="input-field" value={r.nota} onChange={(e) => set({ nota: e.target.value })}
                placeholder={r.decisao === "outra" ? "O que você fez" : "Motivo, ressalva, nome de quem você avisou"} />
            </Campo>
          </div>
        </section>

        <section className="surface rounded-2xl p-6 mb-4">
          <h2 className="text-base font-extrabold text-navy mb-1">O que estava na tela</h2>
          <p className="text-ink-mute text-xs mb-3">
            Sem isto o par mede a decisão, mas não vira caso do corpus depois: ninguém saberá com o que você decidiu.
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {SISTEMAS.map((s) => (
              <button key={s} type="button" onClick={() => set({ sistema: r.sistema === s ? "" : s })}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition ${r.sistema === s ? "bg-navy-deep text-white border-navy-deep" : "bg-white text-ink-soft border-ink/10 hover:border-ink/25"}`}>
                {s}
              </button>
            ))}
          </div>
          <textarea className="input-field min-h-[90px]" value={r.tela} onChange={(e) => set({ tela: e.target.value })}
            placeholder="Cole ou resuma: status, cStat, protocolo, mensagem de erro, o que o sistema mostrou" />
        </section>

        {erro && <div className="rounded-xl border border-danger-rose/40 bg-danger-rose/5 text-danger-rose text-sm p-4 mb-4">{erro}</div>}

        <div className="flex items-center gap-3 pb-16">
          <button className="btn-primary" onClick={enviar} disabled={enviando}>
            {enviando ? "Gravando..." : "Registrar a minha decisão"}
          </button>
          <span className="text-ink-mute text-xs">Uma vez gravada, não se reescreve.</span>
        </div>
      </div>
    </Casca>
  );
}

function Campo({ rotulo, obrigatorio, children }: { rotulo: string; obrigatorio?: boolean; children: React.ReactNode }) {
  return <label className="block"><span className="block text-xs font-bold text-ink-soft mb-1">{rotulo}{obrigatorio && <span className="text-danger-rose"> *</span>}</span>{children}</label>;
}

function Casca({ children, nome }: { children: React.ReactNode; nome: string }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-navy-deep border-b border-cyan/30">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent opacity-80" />
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex shrink-0 items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/p-mark-teal.png" alt="" className="w-7 h-7 rounded-md" />
            <div className="flex items-baseline gap-2">
              <span className="text-white font-black text-base tracking-tight">PRECEPTOR!</span>
              <span className="text-cyan text-[10px] font-bold tracking-[0.25em] hidden sm:inline">STUDIO</span>
            </div>
          </div>
          <span title={`Sombra · ${nome}`} className="min-w-0 truncate text-[10px] uppercase tracking-widest text-cyan/70 font-bold">Sombra · {nome}</span>
        </div>
      </header>
      <main className="px-6 py-10">{children}</main>
    </div>
  );
}
