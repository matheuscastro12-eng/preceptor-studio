'use client';
import { useEffect, useRef, useState } from 'react';
import { CAMPOS_REUNIAO, type CampoReuniao, type ReuniaoEntrada, validarTranscricao } from '@/lib/opera/reuniao';
export default function ReuniaoEditor({ value, onChange, onUsar }: { value: ReuniaoEntrada; onChange: (v: ReuniaoEntrada) => void; onUsar?: () => void }) {
  const [erro, setErro] = useState(''); const [lendo, setLendo] = useState(false); const [consentimento, setConsentimento] = useState(false);
  const versao = useRef(0);
  useEffect(() => { versao.current++; }, [value]);
  function mudar(v: ReuniaoEntrada) { versao.current++; onChange({ ...v, revisada: false }); }
  async function analisar() {
    setErro(''); setLendo(true); const inicio = versao.current;
    try {
      validarTranscricao(value.transcricao);
      const r = await fetch('/api/opera/reunioes/analisar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transcricao: value.transcricao, consentimento }) });
      const d = await r.json(); if (!r.ok) throw Error(d.error);
      if (inicio !== versao.current) throw Error('A fonte mudou durante a leitura. Analise novamente.');
      mudar({ ...value, leitura: d.leitura });
    } catch (e) { setErro((e as Error).message); } finally { setLendo(false); }
  }
  return <section className="op-panel"><div className="op-section-title"><h2>A conversa como ponto de partida.</h2><span>Fonte privada · sem LP obrigatória</span></div>
    <p className="op-empty">Cole a transcrição ou importe texto. A leitura organiza o que foi dito; não aprova entregas. Remova informações sensíveis que não sejam necessárias.</p>
    <label>Título da reunião<input name="reuniao_titulo" value={value.titulo} maxLength={160} onChange={e => mudar({ ...value, titulo: e.target.value })} placeholder="Descoberta com a operação · 10/09" /></label>
    <label>Importar TXT, Markdown, VTT ou SRT<input type="file" accept=".txt,.md,.vtt,.srt,text/plain" disabled={lendo} onChange={async e => {
      const f = e.target.files?.[0]; if (!f) return;
      try { if (f.size > 500_000) throw Error('Arquivo muito grande. Limite: 500 KB e 120.000 caracteres.'); const texto = await f.text(); validarTranscricao(texto); mudar({ ...value, transcricao: texto }); setErro(''); } catch (err) { setErro((err as Error).message); }
      e.target.value = '';
    }} /></label>
    <label>Transcrição<textarea name="transcricao" value={value.transcricao} maxLength={120000} rows={10} onChange={e => mudar({ ...value, transcricao: e.target.value })} placeholder="Participante: hoje fazemos esse processo…" /></label>
    <label className="op-check"><input type="checkbox" checked={consentimento} onChange={e => setConsentimento(e.target.checked)} /> Posso enviar este conteúdo ao provedor de IA configurado (Anthropic) para gerar uma leitura.</label>
    <button type="button" className="op-button secondary" disabled={lendo || !consentimento} onClick={analisar}>{lendo ? 'Lendo a reunião…' : 'Gerar leitura assistida'}</button>
    {erro && <p className="op-note warning" role="alert">{erro}</p>}
    <p className="op-note">Também é possível preencher manualmente. Para cada interpretação, copie um trecho literal da transcrição. Deixe em branco o que não foi informado.</p>
    <div className="op-form-grid">{Object.entries(CAMPOS_REUNIAO).map(([key, titulo]) => {
      const k = key as CampoReuniao; const c = value.leitura.campos[k];
      const campo = (prop: 'texto' | 'trecho', texto: string) => mudar({ ...value, leitura: { ...value.leitura, campos: { ...value.leitura.campos, [k]: { ...c, [prop]: texto } } } });
      return <fieldset className="op-meeting-field" key={k}><legend>{titulo}</legend><label>Leitura<textarea value={c.texto} maxLength={2000} onChange={e => campo('texto', e.target.value)} /></label><label>Trecho que sustenta a leitura<textarea value={c.trecho} maxLength={2000} onChange={e => campo('trecho', e.target.value)} /></label></fieldset>;
    })}</div>
    <label>Perguntas ainda sem resposta (uma por linha)<textarea value={value.leitura.lacunas.join('\n')} onChange={e => mudar({ ...value, leitura: { ...value.leitura, lacunas: e.target.value.split('\n') } })} onBlur={() => mudar({ ...value, leitura: { ...value.leitura, lacunas: value.leitura.lacunas.map(x => x.trim()).filter(Boolean) } })} /></label>
    <label className="op-check"><input type="checkbox" checked={value.revisada} onChange={e => onChange({ ...value, revisada: e.target.checked })} /> Conferi a leitura e os trechos. Isso não representa aceite comercial ou aprovação técnica.</label>
    {onUsar && <button type="button" className="op-button secondary" disabled={!value.revisada || lendo} onClick={onUsar}>Usar processo e lacunas no cadastro</button>}
  </section>;
}
