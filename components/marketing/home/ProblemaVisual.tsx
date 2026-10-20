/*
 * Visual antes/depois do Problema (CSS puro, aria-hidden; o texto ao lado
 * carrega o sentido). Dados fictícios de demonstração.
 * Antes: caixa de entrada lotada de anexos, planilha com uma célula que não
 * bate, WhatsApp acumulando e o lembrete colado no monitor.
 * Depois: uma fila de conferência — tudo conferido, a exceção destacada e
 * um botão para aprovar o lote.
 */

const EMAILS = [
  { de: "Transportes Sul", assunto: "CT-e 35-0921 + romaneio", hora: "08:12" },
  { de: "Fornecedor Agro", assunto: "NF-e 4821 em anexo", hora: "08:31" },
  { de: "Filial Campinas", assunto: "Re: canhoto faltando", hora: "09:02" },
];

const PLANILHA = [
  ["4818", "12", "380", "ok"],
  ["4819", "8", "214", "ok"],
  ["4820", "15", "402", "?"],
  ["4821", "12", "380", "ok"],
];

const FILA = [
  { doc: "CT-e 35-0918", st: "ok" },
  { doc: "CT-e 35-0919", st: "ok" },
  { doc: "CT-e 35-0920", st: "exc" },
  { doc: "CT-e 35-0921", st: "ok" },
  { doc: "CT-e 35-0922", st: "ok" },
];

export function ProblemaVisual() {
  return (
    <div className="lp2-antes-depois" data-rv aria-hidden="true">
      <div className="lp2-antes-depois__painel lp2-antes-depois__painel--antes">
        <p className="lp2-rotulo lp2-antes-depois__rotulo">ANTES</p>
        <div className="lp2-antes-depois__palco lp3-antes">
          <div className="lp3-win lp3-mail">
            <div className="lp3-win__bar">
              <i /><i /><i />
              <span>Entrada</span>
              <b className="lp3-badge">47</b>
            </div>
            <ul>
              {EMAILS.map((e) => (
                <li key={e.assunto}>
                  <span className="lp3-mail__dot" />
                  <span className="lp3-mail__de">{e.de}</span>
                  <span className="lp3-mail__as">{e.assunto}</span>
                  <span className="lp3-mail__h">{e.hora}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lp3-win lp3-sheet">
            <div className="lp3-win__bar">
              <i /><i /><i />
              <span>conferencia_marco_v3_FINAL.xlsx</span>
            </div>
            <table>
              <thead>
                <tr><th>NF</th><th>Vol.</th><th>Kg</th><th /></tr>
              </thead>
              <tbody>
                {PLANILHA.map((r) => (
                  <tr key={r[0]} className={r[3] === "?" ? "is-erro" : undefined}>
                    <td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lp3-zap">
            <span className="lp3-zap__ic" />
            <span>
              <b>WhatsApp</b>
              <em>38 mensagens não lidas</em>
            </span>
          </div>

          <div className="lp3-postit">conferir tudo<br />até as 17h!!</div>
        </div>
      </div>

      <div className="lp2-antes-depois__painel lp2-antes-depois__painel--depois">
        <p className="lp2-rotulo lp2-antes-depois__rotulo">DEPOIS</p>
        <div className="lp2-antes-depois__palco lp3-depois">
          <div className="lp3-fila">
            <div className="lp3-fila__head">
              <span>Conferência de hoje</span>
              <span className="lp3-fila__resumo">4 conferidos · 1 exceção</span>
            </div>
            <ul>
              {FILA.map((f, i) => (
                <li
                  key={f.doc}
                  className={f.st === "exc" ? "is-exc" : undefined}
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <span className="lp3-fila__ic">{f.st === "exc" ? "!" : "✓"}</span>
                  <span className="lp3-fila__doc">{f.doc}</span>
                  <span className="lp3-fila__st">
                    {f.st === "exc" ? "peso não bate · ver" : "conferido"}
                  </span>
                </li>
              ))}
            </ul>
            <div className="lp3-fila__foot">
              <span className="lp3-fila__btn">Aprovar 4 conferidos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
