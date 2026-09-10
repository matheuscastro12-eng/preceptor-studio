'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ReuniaoEditor from './ReuniaoEditor';
import { leituraVazia, validarReuniao, type ReuniaoEntrada } from '@/lib/opera/reuniao';
export default function ReunioesProjeto({ slug, fontes = [] }: { slug: string; fontes?: (ReuniaoEntrada & { id: string })[] }) {
  const router = useRouter(); const [valor, setValor] = useState<ReuniaoEntrada>({ titulo: '', transcricao: '', leitura: leituraVazia(), revisada: false });
  const [erro, setErro] = useState(''); const [salvando, setSalvando] = useState(false);
  return <form className="op-form" onSubmit={async e => {
    e.preventDefault(); setErro(''); setSalvando(true);
    try {
      validarReuniao(valor);
      const r = await fetch(`/api/opera/projetos/${slug}/reunioes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(valor) });
      const d = await r.json(); if (!r.ok) throw Error(d.error);
      setValor({ titulo: '', transcricao: '', leitura: leituraVazia(), revisada: false }); router.refresh();
    } catch (err) { setErro((err as Error).message); } finally { setSalvando(false); }
  }}><section className="op-panel"><label>Nova reunião ou revisão de uma fonte<select value="" onChange={e => { const r = fontes.find(x => x.id === e.target.value); if (r) setValor({ titulo: r.titulo, transcricao: r.transcricao, leitura: r.leitura, revisada: false }); }}><option value="">Selecionar uma leitura anterior para revisar…</option>{fontes.map(r => <option key={r.id} value={r.id}>{r.titulo} · {r.id.slice(0, 8)}</option>)}</select></label><p className="op-empty">Salvar preserva a versão anterior. Nenhuma reunião altera o contrato ou aprova a construção automaticamente.</p></section><ReuniaoEditor value={valor} onChange={setValor} />{erro && <p className="op-note warning" role="alert">{erro}</p>}<button className="op-button" disabled={salvando}>{salvando ? 'Registrando…' : 'Registrar fonte privada'}</button></form>;
}
