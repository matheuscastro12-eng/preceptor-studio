const CTA_TEXTO = "Quero meu diagnóstico de 30 min";

/* CTA único da página: pílula com a seta num círculo próprio, que anda no
   hover e afunda no clique. Sempre leva ao formulário. */
export function CtaLink({ onNavy = false }: { onNavy?: boolean }) {
  return (
    <a href="#contato" className={`lp2-cta${onNavy ? " lp2-cta--navy" : ""}`}>
      <span className="lp2-cta__txt">{CTA_TEXTO}</span>
      <span className="lp2-cta__seta" aria-hidden="true">
        →
      </span>
    </a>
  );
}

export const CTA_MICROCOPY = "30 minutos, sem compromisso de piloto.";

export { CTA_TEXTO };
