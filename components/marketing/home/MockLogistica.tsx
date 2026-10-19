import { Fragment } from "react";

/*
 * Mockup de logística (CSS puro, loop de 9s): à esquerda o romaneio, à direita
 * o CT-e. Um fio sai de cada linha do romaneio e preenche o campo do CT-e, o
 * campo ganha visto, e no fim o botão "Aprovar" é pressionado e vira
 * "Aprovado". Dados fictícios.
 */
const LINHAS = [
  { rom: "NF 4821", campo: "NF", valor: "4821" },
  { rom: "12 vol.", campo: "Vol.", valor: "12" },
  { rom: "380 kg", campo: "Peso", valor: "380 kg" },
  { rom: "Destino SP", campo: "UF", valor: "SP" },
];

export function MockLogistica() {
  return (
    <div className="lp2-mock lp2-mock--log" aria-hidden="true">
      <div className="lp2-mock__barra">
        <span className="lp2-mock__nome">Emissão de CT-e</span>
        <span className="lp2-mock__selo">Demonstração</span>
      </div>
      <div className="lp2-mock__palco">
        <div className="lp2-mock-log">
          <span className="lp2-mock-log__papel lp2-mock-log__papel--rom" />
          <span className="lp2-mock-log__papel lp2-mock-log__papel--cte" />
          <span className="lp2-mock-log__tit lp2-mock-log__tit--rom">Romaneio</span>
          <span className="lp2-mock-log__tit lp2-mock-log__tit--cte">CT-e</span>
          {LINHAS.map((l, i) => (
            <Fragment key={l.campo}>
              <span className={`lp2-mock-log__rom lp2-mock-log--l${i + 1}`}>{l.rom}</span>
              <span className={`lp2-mock-log__fio lp2-mock-log--l${i + 1}`} />
              <span className={`lp2-mock-log__campo lp2-mock-log--l${i + 1}`}>
                <span className="lp2-mock-log__rot">{l.campo}</span>
                <span className="lp2-mock-log__valor">{l.valor}</span>
                <span className="lp2-mock__visto">✓</span>
              </span>
            </Fragment>
          ))}
          <span className="lp2-mock-log__botao">
            <span className="lp2-mock-log__estado lp2-mock-log__estado--pendente">Aprovar</span>
            <span className="lp2-mock-log__estado lp2-mock-log__estado--ok">Aprovado ✓</span>
          </span>
        </div>
      </div>
    </div>
  );
}
