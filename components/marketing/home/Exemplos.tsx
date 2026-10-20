import { CountUp } from "./CountUp";
import { ProvaGrade } from "./ProvaGrade";

/*
 * Prova: um caso só, o de 99% (copy v3, seção 5, cartão 1). As ressalvas da
 * copy ficam: "Cerca de", período medido, caso anônimo, número arredondado.
 * Os outros cartões (CT-e e clínicas) saíram no corte; o cartão de 13% segue
 * fora (pendência 12).
 */
export function Exemplos() {
  return (
    <section id="exemplos" className="lp2-section lp2-navy lp2-exemplos lp4-exemplos" data-rv="bg">
      <div className="lp2-container">
        <h2 className="lp2-rotulo" data-rv>
          EXEMPLO · CASO ANÔNIMO · NÚMERO ARREDONDADO
        </h2>

        <div className="lp2-casos">
          <div className="lp2-caso lp2-prova" data-rv>
            <p className="lp2-rotulo lp2-caso__frente">FINANCEIRO · UM CLIENTE DE LOGÍSTICA</p>
            <p className="lp2-caso__destaque lp2-caso__destaque--num lp2-prova__num">
              <span className="lp2-prova__pre">Cerca de </span>
              <CountUp to={99} />
              <span className="lp2-prova__pct">%</span>
            </p>
            <ProvaGrade />
            <p className="lp2-caso__texto">
              dos recebimentos conciliados no período medido. O financeiro confirma as baixas.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
