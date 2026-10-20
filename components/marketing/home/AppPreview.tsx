/*
 * Print do produto no hero: a central de conferência com a fila do dia e o
 * detalhe do documento com exceção. Dados de demonstração; decorativo.
 */

const FILA = [
  { doc: "CT-e 35-0918", origem: "Transportes Sul", st: "ok" },
  { doc: "CT-e 35-0919", origem: "Filial Campinas", st: "ok" },
  { doc: "CT-e 35-0920", origem: "Fornecedor Agro", st: "exc", ativo: true },
  { doc: "CT-e 35-0921", origem: "Transportes Sul", st: "ok" },
  { doc: "CT-e 35-0922", origem: "Distribuidora Leste", st: "ok" },
] as const;

const CAMPOS = [
  { k: "NF-e × romaneio", v: "4820 = 4820", ok: true },
  { k: "Volumes", v: "15 = 15", ok: true },
  { k: "Peso bruto", v: "402 kg = 402 kg", ok: true },
  { k: "CFOP do destino", v: "6.353 ≠ 5.353", ok: false },
];

export function AppPreview() {
  return (
    <figure className="ap" aria-hidden="true">
      <div className="ap__barra">
        <span className="ap__pontos"><i /><i /><i /></span>
        <span className="ap__url">preceptor · central de conferência</span>
        <span className="ap__demo">demonstração</span>
      </div>
      <div className="ap__corpo">
        <aside className="ap__lado">
          <p className="ap__ws">Operação · Matriz</p>
          <ul>
            <li className="is-on">Conferência</li>
            <li>Exceções <b>1</b></li>
            <li>Agentes</li>
            <li>Regras</li>
            <li>Relatórios</li>
          </ul>
        </aside>
        <div className="ap__main">
          <div className="ap__cab">
            <div>
              <p className="ap__titulo">Conferência de hoje</p>
              <p className="ap__sub">Agente de conferência de CT-e · 12 regras ativas</p>
            </div>
            <span className="ap__btn">Aprovar 4 conferidos</span>
          </div>
          <div className="ap__abas">
            <span className="is-on">Todos 5</span>
            <span>Conferidos 4</span>
            <span>Exceções 1</span>
          </div>
          <table className="ap__tab">
            <thead>
              <tr><th>Documento</th><th>Origem</th><th>Status</th></tr>
            </thead>
            <tbody>
              {FILA.map((f) => (
                <tr key={f.doc} className={"ativo" in f && f.ativo ? "is-ativo" : undefined}>
                  <td className="ap__mono">{f.doc}</td>
                  <td>{f.origem}</td>
                  <td>
                    <span className={`ap__st ap__st--${f.st}`}>{f.st === "ok" ? "Conferido" : "Exceção"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="ap__det">
          <p className="ap__det-tag">CT-e 35-0920</p>
          <p className="ap__det-titulo">1 divergência encontrada</p>
          <ul className="ap__campos">
            {CAMPOS.map((c) => (
              <li key={c.k} className={c.ok ? undefined : "is-erro"}>
                <span className="ap__ic">{c.ok ? "✓" : "!"}</span>
                <span className="ap__k">{c.k}</span>
                <span className="ap__v">{c.v}</span>
              </li>
            ))}
          </ul>
          <p className="ap__nota">O CFOP do pedido não bate com o do documento. O agente parou e pediu revisão.</p>
          <div className="ap__acoes">
            <span className="ap__btn ap__btn--sec">Corrigir</span>
            <span className="ap__btn">Aprovar</span>
          </div>
        </div>
      </div>
    </figure>
  );
}
