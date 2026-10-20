/*
 * P! da marca em contorno, gigante, atrás do hero: o traço se desenha,
 * o ponto cai em teal e depois a marca flutua devagar. Decorativo.
 */
export function MarcaFundo({ variante }: { variante?: "contato" }) {
  return (
    <svg className={`mb-marca${variante ? ` mb-marca--${variante}` : ""}`} viewBox="0 0 1600 1600" aria-hidden="true" data-rv={variante ? "" : undefined}>
      <path
        className="mb-marca__traco"
        pathLength={1}
        fillRule="evenodd"
        d="M300 248H770A387 387 0 0 1 770 1023H557V1326H300ZM557 464H738A171 171 0 0 1 738 807H557Z"
      />
      <path className="mb-marca__traco mb-marca__traco--2" pathLength={1} d="M1036 256H1268V959H1082A470 470 0 0 0 1036 276Z" />
      <circle className="mb-marca__ponto" cx="1152" cy="1203" r="148" />
    </svg>
  );
}
