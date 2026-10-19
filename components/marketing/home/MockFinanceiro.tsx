/*
 * Mockup do financeiro (CSS puro, loop de 10s): extrato à esquerda, títulos à
 * direita. Uma linha de varredura desce pelo extrato; cada lançamento se liga
 * ao seu título e ganha o selo "Conciliado". No fim aparece "Baixa proposta"
 * com a prova anexada (clipe em SVG). Datas, valores e títulos fictícios.
 */
const LINHAS = [
  { data: "12/03", desc: "PIX recebido", valor: "R$ 2.350,00", titulo: "Tít. 0412" },
  { data: "12/03", desc: "TED recebida", valor: "R$ 1.180,00", titulo: "Tít. 0398" },
  { data: "13/03", desc: "Boleto", valor: "R$ 780,00", titulo: "Tít. 0420" },
  { data: "13/03", desc: "PIX recebido", valor: "R$ 4.215,90", titulo: "Tít. 0405" },
];

export function MockFinanceiro() {
  return (
    <div className="lp2-mock lp2-mock--fin" aria-hidden="true">
      <div className="lp2-mock__barra">
        <span className="lp2-mock__nome">Conciliação</span>
        <span className="lp2-mock__selo">Demonstração</span>
      </div>
      <div className="lp2-mock__palco">
        <div className="lp2-mock-fin">
          <div className="lp2-mock-fin__cab">
            <span>Extrato</span>
            <span>Títulos</span>
          </div>
          <div className="lp2-mock-fin__linhas">
            {LINHAS.map((l, i) => (
              <div key={l.titulo} className={`lp2-mock-fin__linha lp2-mock-fin--l${i + 1}`}>
                <span className="lp2-mock-fin__ext">
                  <span className="lp2-mock-fin__desc">
                    <span className="lp2-mock-fin__data">{l.data}</span> {l.desc}
                  </span>
                  <span className="lp2-mock-fin__valor">{l.valor}</span>
                </span>
                <span className="lp2-mock-fin__fio" />
                <span className="lp2-mock-fin__tit">
                  <span>{l.titulo}</span>
                  <span className="lp2-mock-fin__selo">Conciliado</span>
                </span>
              </div>
            ))}
            <span className="lp2-mock-fin__varredura" />
          </div>
          <div className="lp2-mock-fin__baixa">
            <span className="lp2-mock-fin__proposta">Baixa proposta</span>
            <span className="lp2-mock-fin__prova">
              <svg className="lp2-mock-fin__clipe" viewBox="0 0 10 16" width="10" height="16">
                <path
                  d="M7.5 5v6.5a2.5 2.5 0 0 1-5 0V3.5a1.75 1.75 0 0 1 3.5 0V11a1 1 0 0 1-2 0V5.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
              prova.pdf
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
