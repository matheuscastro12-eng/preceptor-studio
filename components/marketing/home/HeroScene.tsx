/*
 * Cena do hero (CSS puro, loop de 10s): o documento de carga é lido pela linha
 * de varredura, o painel do agente marca cada conferência, a exceção vai para
 * a equipe e o botão "Aprovar" recebe o clique. Dados fictícios de
 * demonstração, rotulados como tal.
 */

const CAMPOS = [
  ["Remetente", "Distribuidora Sul"],
  ["NF-e", "4821"],
  ["Volumes", "12"],
  ["Peso bruto", "380 kg"],
  ["Destino", "Campinas · SP"],
];

const CHECKS = [
  { k: "NF-e 4821 × romaneio", v: "confere" },
  { k: "Volumes 12 × 12", v: "confere" },
  { k: "Peso 380 kg", v: "confere" },
  { k: "CFOP do destino", v: "equipe", exc: true },
];

export function HeroScene() {
  return (
    <div className="lp3-scene" aria-hidden="true">
      <div className="lp3-scene__glow" />

      <div className="lp3-doc">
        <div className="lp3-doc__head">
          <span className="lp3-doc__tipo">Nota de transporte</span>
          <span className="lp3-doc__num">CT-e 35-0921</span>
        </div>
        <dl className="lp3-doc__campos">
          {CAMPOS.map(([k, v]) => (
            <div key={k} className="lp3-doc__campo">
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <span className="lp3-doc__scan" />
      </div>

      <div className="lp3-agent">
        <div className="lp3-agent__core">
          <div className="lp3-agent__head">
            <span className="lp3-agent__dot" />
            <span>Agente de conferência</span>
            <span className="lp3-agent__tag">demonstração</span>
          </div>
          <ul className="lp3-agent__lista">
            {CHECKS.map((c, i) => (
              <li
                key={c.k}
                className={`lp3-agent__row${c.exc ? " is-exc" : ""}`}
                style={{ "--i": i } as React.CSSProperties}
              >
                <span className="lp3-agent__ic">{c.exc ? "!" : "✓"}</span>
                <span className="lp3-agent__k">{c.k}</span>
                <span className="lp3-agent__v">{c.v}</span>
              </li>
            ))}
          </ul>
          <div className="lp3-agent__foot">
            <span>Pronto para aprovar</span>
            <span className="lp3-agent__btn">
              Aprovar
              <span className="lp3-agent__cursor" />
            </span>
          </div>
        </div>
      </div>

      <div className="lp3-chip">
        <span className="lp3-chip__dot" />
        Exceção enviada para a equipe
      </div>
    </div>
  );
}
