import "../../opera/opera.css";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { membroOpera, operaDB } from "@/lib/opera/server";
import { OperaHeader } from "@/components/opera/OperaUI";
import { onboardingDe, ventureDoOnboarding } from "@/lib/onboarding";
import { BUCKET_ONBOARDING, todosOsCampos, type Campo } from "@/lib/onboarding/model";

// Respostas do formulário público /onboarding/<slug>, só para a equipe.
// Os arquivos ficam no bucket privado; os links de download valem 1 hora.

export const dynamic = "force-dynamic";

type Arquivo = { campo: string; caminho: string; nome: string; bytes: number };
type Linha = {
  id: string; respondente_nome: string; respondente_funcao: string | null; respondente_contato: string | null;
  criado_em: string; respostas: { valores?: Record<string, unknown>; arquivos?: Arquivo[] } | null;
};

function mostrar(c: Campo | undefined, v: unknown): React.ReactNode {
  if (v === null || v === undefined) return "";
  if (c?.tipo === "tabela" && Array.isArray(v)) {
    return (
      <div style={{ overflowX: "auto" }}>
        <table className="op-table">
          <thead><tr>{c.colunas.map((col) => <th key={col.id}>{col.rotulo}</th>)}</tr></thead>
          <tbody>{(v as Record<string, string>[]).map((l, i) => <tr key={i}>{c.colunas.map((col) => <td key={col.id}>{l[col.id] ?? ""}</td>)}</tr>)}</tbody>
        </table>
      </div>
    );
  }
  if (typeof v === "object") {
    const x = v as { escolha?: string | null; outro?: string | null };
    return [x.escolha, x.outro].filter(Boolean).join(" · ");
  }
  return String(v);
}

export default async function OnboardingRespostas({ params }: { params: { slug: string } }) {
  if (!await membroOpera()) redirect(`/login?redirect=/dashboard/onboarding/${params.slug}`);
  const def = onboardingDe(params.slug);
  if (!def) notFound();
  const campos = new Map(todosOsCampos(def).map((c) => [c.id, c]));

  const db = operaDB();
  const { data, error } = await db
    .from("colheita_respostas")
    .select("id,respondente_nome,respondente_funcao,respondente_contato,criado_em,respostas")
    .eq("venture", ventureDoOnboarding(def.slug))
    .order("criado_em", { ascending: false })
    .limit(100);
  const respostas = (data ?? []) as Linha[];

  const caminhos = respostas.flatMap((r) => (r.respostas?.arquivos ?? []).map((a) => a.caminho));
  const links = new Map<string, string>();
  if (caminhos.length) {
    const { data: assinados } = await db.storage.from(BUCKET_ONBOARDING).createSignedUrls(caminhos, 3600, { download: true });
    for (const a of assinados ?? []) if (a.path && a.signedUrl) links.set(a.path, a.signedUrl);
  }

  return (
    <>
      <Link className="op-back" href="/dashboard/opera">← OPERA</Link>
      <OperaHeader titulo={`Onboarding ${def.cliente}`} descricao="Respostas do formulário do Momento 0. Cada envio é registrado separado; confira e consolide antes de usar.">
        <a className="op-pill" href={`/onboarding/${def.slug}`} target="_blank" rel="noreferrer">Abrir formulário público <ArrowUpRight size={14} /></a>
      </OperaHeader>
      <section className="op-panel">
        <div className="op-section-title"><h2>Envios</h2><span>{error ? "erro ao carregar" : `${respostas.length} envio(s)`}</span></div>
        {error ? <p className="op-note warning">Não foi possível carregar as respostas.</p>
          : !respostas.length ? <p className="op-empty">Nenhum envio ainda. Link para a {def.cliente}: /onboarding/{def.slug}</p>
          : respostas.map((r) => (
            <details className="op-response" key={r.id}>
              <summary>{r.respondente_nome}<small>{[r.respondente_funcao, r.respondente_contato, new Date(r.criado_em).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })].filter(Boolean).join(" · ")}</small></summary>
              {def.secoes.map((sec) => {
                const itens = sec.campos.filter((c) => r.respostas?.valores?.[c.id] !== undefined || (r.respostas?.arquivos ?? []).some((a) => a.campo === c.id));
                if (!itens.length) return null;
                return (
                  <div key={sec.id}>
                    <h3 style={{ margin: "16px 0 6px" }}>{sec.fase} · {sec.titulo}</h3>
                    <dl>
                      {itens.map((c) => (
                        <div key={c.id}>
                          <dt>{c.rotulo}</dt>
                          <dd>
                            {mostrar(campos.get(c.id), r.respostas?.valores?.[c.id])}
                            {(r.respostas?.arquivos ?? []).filter((a) => a.campo === c.id).map((a) => (
                              <div key={a.caminho}>{links.get(a.caminho) ? <a href={links.get(a.caminho)}>{a.nome}</a> : a.nome}</div>
                            ))}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                );
              })}
            </details>
          ))}
      </section>
    </>
  );
}
