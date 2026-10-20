"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

/*
 * Palco do hero: uma janela grande com o agente trabalhando em uma das três
 * frentes. A entrada chega, os campos são preenchidos, a conferência ganha os
 * vistos e a equipe aprova (selo teal). As abas trocam sozinhas quando a
 * barra de progresso termina (só com o palco na tela e sem o mouse em cima);
 * o primeiro clique ou tecla nas abas desliga a troca automática. Com reduced
 * motion as animações não rodam, a barra não termina e o palco fica parado no
 * estado final da aba escolhida. Dados fictícios, selo DEMONSTRAÇÃO.
 */

type Campo = { rot: string; valor: string; largo?: boolean };

type Frente = {
  id: string;
  aba: string;
  exemplo: string;
  janela: string;
  entrada: { tipo: string; titulo: string; linhas: string[] };
  campos: Campo[];
  checks: string[];
  resultado: string;
  link?: { href: string; texto: string };
};

const FRENTES: Frente[] = [
  {
    id: "logistica",
    aba: "Logística",
    exemplo: "CT-e pronto para conferir",
    janela: "Emissão de CT-e",
    entrada: { tipo: "E-mail", titulo: "NF 4821 e romaneio", linhas: ["romaneio.pdf", "12 vol. · 380 kg", "Destino SP"] },
    campos: [
      { rot: "NF", valor: "4821" },
      { rot: "Volumes", valor: "12" },
      { rot: "Peso", valor: "380 kg" },
      { rot: "UF destino", valor: "SP" },
    ],
    checks: ["Peso confere com o romaneio", "Destino confere com a nota", "Frete pela tabela"],
    resultado: "CT-e pronto",
    link: { href: "/transporte", texto: "Ver como funciona em logística" },
  },
  {
    id: "financeiro",
    aba: "Financeiro",
    exemplo: "Extrato conciliado com prova",
    janela: "Conciliação",
    entrada: {
      tipo: "Extrato",
      titulo: "Banco · 13/03",
      linhas: ["PIX recebido  R$ 2.350,00", "TED recebida  R$ 1.180,00", "Boleto  R$ 780,00"],
    },
    campos: [
      { rot: "Tít. 0412", valor: "R$ 2.350,00" },
      { rot: "Tít. 0398", valor: "R$ 1.180,00" },
      { rot: "Tít. 0420", valor: "R$ 780,00" },
      { rot: "Prova", valor: "prova.pdf" },
    ],
    checks: ["Valor igual ao título", "Data dentro do período", "Comprovante anexado"],
    resultado: "Baixa proposta",
    // PENDENTE copy v3 (pendência 20): link do financeiro entra quando a rota existir.
  },
  {
    id: "clinica",
    aba: "Clínicas",
    exemplo: "WhatsApp da recepção em dia",
    janela: "Recepção",
    entrada: { tipo: "Mensagem", titulo: "Paciente", linhas: ["Vocês atendem sábado?"] },
    campos: [
      { rot: "Assunto", valor: "Horário" },
      { rot: "Tipo", valor: "Administrativa" },
      { rot: "Rascunho", valor: "Sim, das 8h às 12h. Quer agendar um horário?", largo: true },
    ],
    checks: ["Pergunta administrativa", "Resposta segue o roteiro", "Sem dado de saúde"],
    resultado: "Resposta enviada",
    link: { href: "/medicina", texto: "Ver como funciona em clínicas" },
  },
];

const ETAPAS = ["Entrada", "Preenchimento", "Conferência", "Aprovação"];

/* Linha do tempo de cada aba, em ms (casa com visuais-hero.css). */
const T_CAMPO = (i: number) => 1000 + i * 550;
const T_CHECK = (i: number) => 3500 + i * 550;
const T_ETAPA = [0, 1000, 3500, 5600];

function Janela({ f }: { f: Frente }) {
  return (
    <div className="lp2-janela" aria-hidden="true">
      <div className="lp2-janela__barra">
        <span className="lp2-janela__pontos">
          <span />
          <span />
          <span />
        </span>
        <span className="lp2-janela__nome">{f.janela}</span>
        <span className="lp2-janela__demo">Demonstração</span>
      </div>

      <div className="lp2-janela__corpo">
        <div className="lp2-janela__lateral">
          <p className="lp2-janela__agente">
            <span className="lp2-janela__pulso" />
            Agente
          </p>
          <ol className="lp2-janela__etapas">
            {ETAPAS.map((e, i) => (
              <li key={e} style={{ "--t": `${T_ETAPA[i]}ms` } as React.CSSProperties}>
                <span className="lp2-janela__etapa-ponto" />
                {e}
              </li>
            ))}
          </ol>
        </div>

        <div className="lp2-janela__col lp2-janela__col--entrada">
          <p className="lp2-janela__coltit">Entrada</p>
          <div className="lp2-janela__doc">
            <p className="lp2-janela__doc-tipo">{f.entrada.tipo}</p>
            <p className="lp2-janela__doc-tit">{f.entrada.titulo}</p>
            <ul>
              {f.entrada.linhas.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lp2-janela__col lp2-janela__col--campos">
          <p className="lp2-janela__coltit">Agente preenche</p>
          <div className="lp2-janela__campos">
            {f.campos.map((c, i) => (
              <div
                key={c.rot}
                className={`lp2-janela__campo${c.largo ? " lp2-janela__campo--largo" : ""}`}
                style={{ "--t": `${T_CAMPO(i)}ms` } as React.CSSProperties}
              >
                <span className="lp2-janela__campo-rot">{c.rot}</span>
                <span className="lp2-janela__campo-valor">{c.valor}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lp2-janela__col lp2-janela__col--conf">
          <p className="lp2-janela__coltit">Conferência</p>
          <ul className="lp2-janela__checks">
            {f.checks.map((c, i) => (
              <li key={c} style={{ "--t": `${T_CHECK(i)}ms` } as React.CSSProperties}>
                <span className="lp2-janela__visto">✓</span>
                {c}
              </li>
            ))}
          </ul>
          <div className="lp2-janela__aprova">
            <span className="lp2-janela__resultado">{f.resultado}</span>
            <span className="lp2-janela__espera">Aguardando a equipe</span>
            <span className="lp2-janela__selo">
              <span className="lp2-janela__selo-visto">✓</span>
              Aprovado pela equipe
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroPalco() {
  const [ativa, setAtiva] = useState(0);
  const [auto, setAuto] = useState(true);
  const [visivel, setVisivel] = useState(false);
  const [pausa, setPausa] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const abas = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const el = raiz.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisivel(true);
      return;
    }
    const obs = new IntersectionObserver(([e]) => setVisivel(e.isIntersecting), { threshold: 0.25 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const escolher = (i: number, foco = false) => {
    setAuto(false);
    setAtiva(i);
    if (foco) abas.current[i]?.focus();
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const n = FRENTES.length;
    const mapa: Record<string, number> = {
      ArrowRight: (ativa + 1) % n,
      ArrowLeft: (ativa - 1 + n) % n,
      Home: 0,
      End: n - 1,
    };
    if (e.key in mapa) {
      e.preventDefault();
      escolher(mapa[e.key], true);
    }
  };

  const link = FRENTES[ativa].link;

  return (
    <div
      ref={raiz}
      className={`lp2-palco${visivel ? " is-vis" : ""}${pausa ? " is-pausa" : ""}`}
      // Só mouse pausa: no toque o "leave" não vem e a troca pararia de vez.
      onPointerEnter={(e) => e.pointerType === "mouse" && setPausa(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setPausa(false)}
    >
      <div className="lp2-palco__abas" role="tablist" aria-label="Frentes" onKeyDown={onKey}>
        {FRENTES.map((f, i) => (
          <button
            key={f.id}
            ref={(b) => {
              abas.current[i] = b;
            }}
            type="button"
            role="tab"
            id={`lp2-aba-${f.id}`}
            aria-selected={ativa === i}
            aria-controls={`lp2-painel-${f.id}`}
            tabIndex={ativa === i ? 0 : -1}
            className="lp2-palco__aba"
            onClick={() => escolher(i)}
          >
            <span className="lp2-palco__aba-nome">{f.aba}</span>
            <span className="lp2-palco__aba-ex" id={`lp2-aba-${f.id}-ex`}>
              {f.exemplo}
            </span>
            {auto && ativa === i ? (
              <span
                className="lp2-palco__prog"
                aria-hidden="true"
                onAnimationEnd={() => setAtiva((a) => (a + 1) % FRENTES.length)}
              />
            ) : null}
          </button>
        ))}
      </div>

      {/* A cena inclina uma vez ao carregar; as abas trocam só o painel de dentro. */}
      <div className="lp2-palco__cena">
        {FRENTES.map((f, i) => (
          <div
            key={f.id}
            role="tabpanel"
            id={`lp2-painel-${f.id}`}
            aria-labelledby={`lp2-aba-${f.id}`}
            aria-describedby={`lp2-aba-${f.id}-ex`}
            hidden={ativa !== i}
            className="lp2-palco__painel"
          >
            <Janela f={f} />
          </div>
        ))}
      </div>

      {/* Linha sempre presente: a altura do palco não pula entre as abas. */}
      <p className="lp2-palco__link">
        {link ? (
          <Link href={link.href} className="lp2-textlink">
            {link.texto} <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </p>
    </div>
  );
}
