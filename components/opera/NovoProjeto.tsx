"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { colheitaInicial, validarProjeto, type ProjetoOpera } from "@/lib/opera/model";

export default function NovoProjeto() {
  const router = useRouter();
  const [config, setConfig] = useState(() => JSON.stringify(colheitaInicial(), null, 2));
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  async function criar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErro("");
    const f = new FormData(e.currentTarget);
    try {
      const projeto = { slug: f.get("slug"), nome: f.get("nome"), cliente: f.get("cliente"), processo: f.get("processo"), responsavel: f.get("responsavel"), tipo: f.get("tipo"), colheita_publica: f.get("colheita_publica") === "on", painel_publico: f.get("painel_publico") === "on", colheita: JSON.parse(config), snapshot: null } as ProjetoOpera;
      validarProjeto(projeto); setSalvando(true);
      const res = await fetch("/api/opera/projetos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(projeto) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao criar projeto.");
      router.push(data.portal); router.refresh();
    } catch (e) { setErro(e instanceof Error ? e.message : "Não foi possível criar o projeto."); }
    finally { setSalvando(false); }
  }
  return <form className="op-form" onSubmit={criar}><section className="op-panel"><div className="op-section-title"><h2>O que vamos construir?</h2><span>Identidade da entrega</span></div><div className="op-form-grid"><label>Nome do projeto<input name="nome" required maxLength={160} placeholder="Como a equipe chama o projeto" /></label><label>Cliente<input name="cliente" required maxLength={160} placeholder="Empresa ou operação" /></label><label>Endereço do projeto<input name="slug" required pattern="[a-z0-9][a-z0-9-]{1,60}" maxLength={61} placeholder="nome-do-projeto" /><small>Usado em /painel/ e /colheita/. Não muda após o cadastro.</small></label><label>Responsável pela construção<input name="responsavel" required maxLength={160} placeholder="Nome de quem conduz a entrega" /></label><label>Tipo de solução<select name="tipo"><option value="agente">Sistema de agentes</option><option value="plataforma">Plataforma</option><option value="automacao">Automação determinística</option></select></label></div><label style={{ marginTop: 20 }}>Qual processo ou resultado a solução atende?<textarea name="processo" required maxLength={2000} placeholder="Descreva o trabalho e o resultado esperado." /></label></section>
    <section className="op-panel"><div className="op-section-title"><h2>Colheita do projeto</h2><span>Um instrumento próprio</span></div><p className="op-empty">Começamos com cinco perguntas sobre o processo, uma ficha de ocorrência e uma lista de decisões. O responsável pode adaptar o instrumento abaixo ao material e às lacunas deste projeto.</p><details><summary>Revisar perguntas e fichas</summary><label style={{ marginTop: 15 }}>Instrumento da colheita<textarea className="op-code" value={config} onChange={e => setConfig(e.target.value)} spellCheck={false} /></label></details></section>
    <section className="op-panel"><div className="op-section-title"><h2>Compartilhamento</h2><span>Privado por padrão</span></div><label className="op-check"><input type="checkbox" name="colheita_publica" /> Liberar o link da colheita para quem receber o endereço. As respostas continuam restritas à equipe.</label><label className="op-check" style={{ marginTop: 16 }}><input type="checkbox" name="painel_publico" /> Liberar o painel publicado para quem receber o endereço. Confirme que o acompanhamento pode ser compartilhado.</label></section>
    {erro && <p role="alert" className="op-note warning">{erro}</p>}<div className="op-actions"><button className="op-button" disabled={salvando}>{salvando ? "Criando projeto…" : "Criar projeto e seus espaços"}<ArrowRight size={16} /></button></div>
  </form>;
}
