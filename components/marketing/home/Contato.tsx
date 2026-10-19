import { LeadForm } from "./LeadForm";
import { Marca } from "./Marca";

export function Contato() {
  return (
    <section id="contato" className="lp2-section lp2-navy lp2-grain lp2-contato">
      <div className="lp2-container lp2-contato__grid">
        <header className="lp2-contato__head" data-rv>
          <h2 className="lp2-h2">
            Qual processo <Marca>come o dia</Marca> da sua equipe?
          </h2>
          <p className="lp2-lead">
            Conta pra gente em poucas linhas. Em 30 minutos de conversa, você sai sabendo se dá para
            automatizar e por onde começar.
          </p>
        </header>
        <div className="lp2-contato__card" data-rv style={{ "--rv-d": "120ms" } as React.CSSProperties}>
          <LeadForm />
        </div>
      </div>
    </section>
  );
}
