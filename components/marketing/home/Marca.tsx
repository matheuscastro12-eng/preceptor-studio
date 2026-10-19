/* Marca de caneta: faixa teal que se desenha atrás de uma expressão do título
   quando o bloco [data-rv] mais próximo ganha .is-in. Use em expressão curta,
   que caiba numa linha (a marca não quebra). */
export function Marca({ children }: { children: React.ReactNode }) {
  return <span className="lp2-marca">{children}</span>;
}
