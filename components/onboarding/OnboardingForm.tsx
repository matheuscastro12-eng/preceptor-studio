"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import {
  BUCKET_ONBOARDING,
  MAX_BYTES_ARQUIVO,
  extensao,
  type Campo,
  type Coluna,
  type Onboarding,
  type Secao,
} from "@/lib/onboarding/model";
import s from "./onboarding.module.css";

type Escolha = { escolha?: string; outro?: string };
type Linha = Record<string, string>;
type Arquivo = { campo: string; caminho: string; nome: string; bytes: number };
type Rascunho = { nome: string; funcao: string; contato: string; valores: Record<string, unknown>; arquivos: Arquivo[] };
type Envio = { id: number; campo: string; nome: string; estado: "enviando" | "erro"; msg?: string };

const VAZIO: Rascunho = { nome: "", funcao: "", contato: "", valores: {}, arquivos: [] };
const chaveRascunho = (o: Onboarding) => `onboarding:${o.slug}:v${o.versao}`;

function preenchido(c: Campo, valores: Record<string, unknown>, arquivos: Arquivo[]): boolean {
  if (arquivos.some((a) => a.campo === c.id)) return true;
  const v = valores[c.id];
  if (c.tipo === "texto" || c.tipo === "longo") return typeof v === "string" && v.trim() !== "";
  if (c.tipo === "escolha") return !!v && (!!(v as Escolha).escolha || !!(v as Escolha).outro?.trim());
  if (c.tipo === "tabela") return Array.isArray(v) && (v as Linha[]).some((l) => Object.values(l).some((x) => x?.trim()));
  return false;
}

function tamanho(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
}

export default function OnboardingForm({ def }: { def: Onboarding }) {
  const [r, setR] = useState<Rascunho>(VAZIO);
  const [carregado, setCarregado] = useState(false);
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const seq = useRef(0);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(chaveRascunho(def));
      if (salvo) setR({ ...VAZIO, ...(JSON.parse(salvo) as Partial<Rascunho>) });
    } catch { /* sem armazenamento: segue em memória */ }
    setCarregado(true);
  }, [def]);

  useEffect(() => {
    if (!carregado) return;
    try { localStorage.setItem(chaveRascunho(def), JSON.stringify(r)); } catch { /* ok */ }
  }, [r, carregado, def]);

  const setValor = (id: string, v: unknown) => setR((a) => ({ ...a, valores: { ...a.valores, [id]: v } }));

  const progresso = useMemo(
    () =>
      def.secoes.map((sec) => ({
        id: sec.id,
        feitos: sec.campos.filter((c) => preenchido(c, r.valores, r.arquivos)).length,
        total: sec.campos.length,
      })),
    [def, r.valores, r.arquivos],
  );
  const totalFeitos = progresso.reduce((n, p) => n + p.feitos, 0);
  const totalCampos = progresso.reduce((n, p) => n + p.total, 0);

  async function enviarArquivos(campo: string, lista: FileList | null) {
    if (!lista?.length) return;
    const sb = getBrowserSupabase();
    for (const file of Array.from(lista)) {
      const id = ++seq.current;
      setEnvios((e) => [...e, { id, campo, nome: file.name, estado: "enviando" }]);
      const falhar = (msg: string) => setEnvios((e) => e.map((x) => (x.id === id ? { ...x, estado: "erro", msg } : x)));
      if (file.size > MAX_BYTES_ARQUIVO) { falhar("Maior que 20 MB. Divida em partes ou compacte."); continue; }
      try {
        const res = await fetch("/api/public/onboarding/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: def.slug, campo, nome: file.name, bytes: file.size }),
        });
        const j = (await res.json()) as { caminho?: string; token?: string; error?: string };
        if (!res.ok || !j.caminho || !j.token) { falhar(j.error ?? "Não foi possível enviar."); continue; }
        const up = await sb.storage.from(BUCKET_ONBOARDING).uploadToSignedUrl(j.caminho, j.token, file);
        if (up.error) { falhar("O envio foi interrompido. Tente de novo."); continue; }
        const caminho = j.caminho;
        setR((a) => ({ ...a, arquivos: [...a.arquivos, { campo, caminho, nome: file.name, bytes: file.size }] }));
        setEnvios((e) => e.filter((x) => x.id !== id));
      } catch {
        falhar("Sem conexão. Tente de novo.");
      }
    }
  }

  async function enviar() {
    setErro(null);
    if (!r.nome.trim()) { setErro("Diga seu nome no topo do formulário."); document.getElementById("onb-nome")?.focus(); return; }
    if (envios.some((e) => e.estado === "enviando")) { setErro("Espere os arquivos terminarem de subir."); return; }
    setEnviando(true);
    try {
      const res = await fetch("/api/public/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: def.slug, versao: def.versao, ...r }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) { setErro(j.error ?? "Não conseguimos enviar agora. Suas respostas continuam salvas neste navegador."); return; }
      try { localStorage.removeItem(chaveRascunho(def)); } catch { /* ok */ }
      setEnviado(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErro("Sem conexão. Suas respostas continuam salvas neste navegador; tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <main className={s.stage}>
        <section className={`${s.sheet} ${s.glow} ${s.cover}`}>
          <div className={s.brand} aria-label="PRECEPTOR!"><span className={s.word} /></div>
          <p className={s.eyebrow}>Recebido</p>
          <h1 className={s.h1}>Obrigado, {r.nome.trim().split(/\s+/)[0]}. <span className={s.it}>Está com a gente.</span></h1>
          <p className={s.lead}>Suas respostas foram gravadas. Se lembrar de mais alguma coisa, ou se outra pessoa da {def.cliente} for responder a parte dela, é só abrir o link de novo: cada envio fica registrado separado.</p>
          <div>
            <button type="button" className={s.btnLight} onClick={() => { setEnviado(false); setR({ ...VAZIO, nome: r.nome, funcao: r.funcao, contato: r.contato }); }}>
              Enviar outra resposta
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={s.stage}>
      <section className={`${s.sheet} ${s.glow} ${s.cover}`}>
        <div className={s.brand} aria-label="PRECEPTOR!"><span className={s.word} /></div>
        <p className={s.eyebrow}>Momento 0 · PRECEPTOR! para {def.cliente}</p>
        <h1 className={s.h1}>O que precisamos da <span className={s.it}>{def.cliente}</span></h1>
        <p className={s.lead}>{def.introducao}</p>
        <div className={s.warn} role="note"><b>Senhas ficam fora daqui.</b> {def.avisoCredenciais}</div>
        <ol className={s.fases} aria-label="Seções do formulário">
          {def.secoes.map((sec, i) => (
            <li key={sec.id}>
              <a href={`#${sec.id}`}>
                <span className={s.faseNum}>{sec.fase}</span>
                <span className={s.faseTit}>{sec.titulo}</span>
                <span className={s.faseProg}>{progresso[i]!.feitos}/{progresso[i]!.total}</span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      <section className={`${s.sheet} ${s.light}`} aria-labelledby="quem">
        <Trilho def={def} atual={null} />
        <div className={s.content}>
          <p className={s.eyebrowDark}>Antes de começar</p>
          <h2 id="quem" className={s.h2}>Quem está <span className={s.it}>respondendo</span></h2>
          <div className={s.grid3}>
            <Rotulo id="onb-nome" rotulo="Seu nome" obrigatorio>
              <input id="onb-nome" className={s.input} value={r.nome} onChange={(e) => setR({ ...r, nome: e.target.value })} placeholder="Nome e sobrenome" autoComplete="name" />
            </Rotulo>
            <Rotulo id="onb-funcao" rotulo="Função">
              <input id="onb-funcao" className={s.input} value={r.funcao} onChange={(e) => setR({ ...r, funcao: e.target.value })} placeholder="Ex.: gestor de relacionamento" />
            </Rotulo>
            <Rotulo id="onb-contato" rotulo="E-mail ou WhatsApp">
              <input id="onb-contato" className={s.input} value={r.contato} onChange={(e) => setR({ ...r, contato: e.target.value })} placeholder="Para tirar dúvida sobre uma resposta" />
            </Rotulo>
          </div>
        </div>
      </section>

      {def.secoes.map((sec, i) => (
        <SecaoForm
          key={sec.id}
          def={def}
          sec={sec}
          prog={progresso[i]!}
          r={r}
          setValor={setValor}
          envios={envios.filter((e) => sec.campos.some((c) => c.id === e.campo))}
          onArquivos={enviarArquivos}
          onRemoverArquivo={(caminho) => setR((a) => ({ ...a, arquivos: a.arquivos.filter((x) => x.caminho !== caminho) }))}
          onDescartarEnvio={(id) => setEnvios((e) => e.filter((x) => x.id !== id))}
        />
      ))}

      <section className={`${s.sheet} ${s.glow} ${s.fecho}`}>
        <div>
          <p className={s.eyebrow}>Enviar</p>
          <p className={s.fechoNum}><span>{totalFeitos}</span> de {totalCampos} itens respondidos</p>
          <p className={s.small}>Pode enviar o que já tem e voltar depois: cada envio fica registrado separado.</p>
          {erro && <p role="alert" className={s.erro}>{erro}</p>}
        </div>
        <div className={s.fechoAcoes}>
          <button type="button" className={s.btnCyan} disabled={enviando} onClick={enviar}>{enviando ? "Enviando…" : "Enviar respostas"}</button>
          <p className={s.sign}>Dúvidas: <strong>{def.responsavel.nome}</strong> · {def.responsavel.empresa} · <span className={s.sel}>{def.responsavel.email}</span></p>
        </div>
      </section>
    </main>
  );
}

function Trilho({ def, atual }: { def: Onboarding; atual: string | null }) {
  return (
    <nav className={s.rail} aria-hidden="true">
      <span className={s.mark} />
      <ol>{def.secoes.map((sec) => <li key={sec.id} aria-current={sec.id === atual ? "step" : undefined}>{sec.fase}</li>)}</ol>
    </nav>
  );
}

function Rotulo({ id, rotulo, ajuda, obrigatorio, children }: { id: string; rotulo: string; ajuda?: string; obrigatorio?: boolean; children: React.ReactNode }) {
  return (
    <div className={s.field}>
      <label htmlFor={id} className={s.label}>{rotulo}{obrigatorio && <span className={s.req}> *</span>}</label>
      {ajuda && <p className={s.help}>{ajuda}</p>}
      {children}
    </div>
  );
}

function SecaoForm(props: {
  def: Onboarding; sec: Secao; prog: { feitos: number; total: number }; r: Rascunho;
  setValor: (id: string, v: unknown) => void; envios: Envio[];
  onArquivos: (campo: string, l: FileList | null) => void; onRemoverArquivo: (caminho: string) => void; onDescartarEnvio: (id: number) => void;
}) {
  const { def, sec, prog, r, setValor } = props;
  return (
    <section id={sec.id} className={`${s.sheet} ${s.light}`} aria-labelledby={`${sec.id}-t`}>
      <Trilho def={def} atual={sec.id} />
      <div className={s.content}>
        <div className={s.secHead}>
          <div>
            <p className={s.eyebrowDark}>{sec.fase} · Destrava: {sec.destrava}</p>
            <h2 id={`${sec.id}-t`} className={s.h2}>{sec.titulo}</h2>
            {sec.descricao && <p className={s.body}>{sec.descricao}</p>}
          </div>
          <p className={s.secProg}><span>{prog.feitos}</span>/{prog.total}</p>
        </div>
        <div className={s.campos}>
          {sec.campos.map((c) => (
            <CampoForm
              key={c.id}
              c={c}
              valor={r.valores[c.id]}
              setValor={(v) => setValor(c.id, v)}
              arquivos={r.arquivos.filter((a) => a.campo === c.id)}
              envios={props.envios.filter((e) => e.campo === c.id)}
              onArquivos={(l) => props.onArquivos(c.id, l)}
              onRemoverArquivo={props.onRemoverArquivo}
              onDescartarEnvio={props.onDescartarEnvio}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CampoForm({ c, valor, setValor, arquivos, envios, onArquivos, onRemoverArquivo, onDescartarEnvio }: {
  c: Campo; valor: unknown; setValor: (v: unknown) => void; arquivos: Arquivo[]; envios: Envio[];
  onArquivos: (l: FileList | null) => void; onRemoverArquivo: (caminho: string) => void; onDescartarEnvio: (id: number) => void;
}) {
  const id = `onb-${c.id}`;
  if (c.tipo === "texto") {
    return <Rotulo id={id} rotulo={c.rotulo} ajuda={c.ajuda}><input id={id} className={s.input} value={(valor as string) ?? ""} placeholder={c.placeholder} onChange={(e) => setValor(e.target.value)} /></Rotulo>;
  }
  if (c.tipo === "longo") {
    return <div className={s.wide}><Rotulo id={id} rotulo={c.rotulo} ajuda={c.ajuda}><textarea id={id} className={`${s.input} ${s.textarea}`} value={(valor as string) ?? ""} placeholder={c.placeholder} onChange={(e) => setValor(e.target.value)} /></Rotulo></div>;
  }
  if (c.tipo === "escolha") {
    const v = (valor as Escolha) ?? {};
    return (
      <fieldset className={`${s.field} ${s.wide} ${s.fieldset}`}>
        <legend className={s.label}>{c.rotulo}</legend>
        {c.ajuda && <p className={s.help}>{c.ajuda}</p>}
        <div className={s.chips}>
          {c.opcoes.map((op) => {
            const on = v.escolha === op;
            return (
              <button key={op} type="button" aria-pressed={on} className={`${s.chip} ${on ? s.chipOn : ""}`} onClick={() => setValor({ ...v, escolha: on ? undefined : op })}>{op}</button>
            );
          })}
        </div>
        {c.outro && <input id={`${id}-outro`} aria-label={`${c.rotulo}: outra resposta`} className={s.input} value={v.outro ?? ""} placeholder="Outra resposta, ou um detalhe" onChange={(e) => setValor({ ...v, outro: e.target.value })} />}
      </fieldset>
    );
  }
  if (c.tipo === "tabela") {
    const linhas: Linha[] = Array.isArray(valor) && (valor as Linha[]).length ? (valor as Linha[]) : Array.from({ length: c.linhasIniciais ?? 1 }, (): Linha => ({}));
    const setLinha = (i: number, col: Coluna, x: string) => setValor(linhas.map((l, j) => (j === i ? { ...l, [col.id]: x } : l)));
    return (
      <div className={`${s.field} ${s.wide}`}>
        <p className={s.label}>{c.rotulo}</p>
        {c.ajuda && <p className={s.help}>{c.ajuda}</p>}
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead><tr>{c.colunas.map((col) => <th key={col.id} scope="col">{col.rotulo}</th>)}<th aria-label="Remover" /></tr></thead>
            <tbody>
              {linhas.map((l, i) => (
                <tr key={i}>
                  {c.colunas.map((col) => (
                    <td key={col.id}>
                      {col.opcoes ? (
                        <select id={`${id}-${i}-${col.id}`} aria-label={`${col.rotulo}, linha ${i + 1}`} className={s.cell} value={l[col.id] ?? ""} onChange={(e) => setLinha(i, col, e.target.value)}>
                          <option value="">—</option>
                          {col.opcoes.map((op) => <option key={op} value={op}>{op}</option>)}
                        </select>
                      ) : (
                        <input id={`${id}-${i}-${col.id}`} aria-label={`${col.rotulo}, linha ${i + 1}`} className={s.cell} value={l[col.id] ?? ""} placeholder={col.placeholder} onChange={(e) => setLinha(i, col, e.target.value)} />
                      )}
                    </td>
                  ))}
                  <td><button type="button" className={s.rm} aria-label={`Remover linha ${i + 1}`} onClick={() => setValor(linhas.filter((_, j) => j !== i))}>×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={s.tableActions}>
          <button type="button" className={s.btnGhost} onClick={() => setValor([...linhas, {}])}>+ Adicionar linha</button>
          {c.aceitaPlanilha && <Upload id={`${id}-planilha`} rotulo="ou envie a planilha (.xlsx ou .csv)" aceita={["xlsx", "xls", "csv"]} onArquivos={onArquivos} />}
        </div>
        <ListaArquivos arquivos={arquivos} envios={envios} onRemover={onRemoverArquivo} onDescartar={onDescartarEnvio} />
      </div>
    );
  }
  return (
    <div className={`${s.field} ${s.wide}`}>
      <p className={s.label}>{c.rotulo}</p>
      {c.ajuda && <p className={s.help}>{c.ajuda}</p>}
      <Upload id={`${id}-arquivos`} rotulo={`Escolher arquivos (${c.aceita.join(", ")})`} aceita={c.aceita} onArquivos={onArquivos} destaque />
      <ListaArquivos arquivos={arquivos} envios={envios} onRemover={onRemoverArquivo} onDescartar={onDescartarEnvio} />
    </div>
  );
}

function Upload({ id, rotulo, aceita, onArquivos, destaque }: { id: string; rotulo: string; aceita: string[]; onArquivos: (l: FileList | null) => void; destaque?: boolean }) {
  return (
    <label htmlFor={id} className={destaque ? s.drop : s.btnGhost}>
      <input id={id} type="file" multiple className={s.fileInput} accept={aceita.map((x) => `.${x}`).join(",")} onChange={(e) => { onArquivos(e.target.files); e.target.value = ""; }} />
      {rotulo}
    </label>
  );
}

function ListaArquivos({ arquivos, envios, onRemover, onDescartar }: { arquivos: Arquivo[]; envios: Envio[]; onRemover: (c: string) => void; onDescartar: (id: number) => void }) {
  if (!arquivos.length && !envios.length) return null;
  return (
    <ul className={s.files}>
      {arquivos.map((a) => (
        <li key={a.caminho}><span className={s.ext}>{extensao(a.nome)}</span><span className={s.fname}>{a.nome}</span><span className={s.fsize}>{tamanho(a.bytes)}</span><button type="button" className={s.rm} aria-label={`Remover ${a.nome}`} onClick={() => onRemover(a.caminho)}>×</button></li>
      ))}
      {envios.map((e) => (
        <li key={e.id} className={e.estado === "erro" ? s.fileErr : undefined}>
          <span className={s.ext}>{extensao(e.nome)}</span><span className={s.fname}>{e.nome}</span>
          <span className={s.fsize}>{e.estado === "enviando" ? "enviando…" : e.msg}</span>
          {e.estado === "erro" && <button type="button" className={s.rm} aria-label="Descartar" onClick={() => onDescartar(e.id)}>×</button>}
        </li>
      ))}
    </ul>
  );
}
