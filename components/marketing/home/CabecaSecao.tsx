/* Cabeça de seção centralizada: selo, título e nota manuscrita opcional. */
export function CabecaSecao({
  selo,
  titulo,
  nota,
  claro = false,
}: {
  selo: string;
  titulo: React.ReactNode;
  nota?: string;
  claro?: boolean;
}) {
  return (
    <header className={`lp4-cabeca${claro ? " lp4-cabeca--claro" : ""}`} data-rv>
      <p className="lp4-selo">
        <span aria-hidden="true" />
        {selo}
      </p>
      <h2 className="lp2-h2 lp4-cabeca__titulo">{titulo}</h2>
      {nota ? <p className="lp4-nota">{nota}</p> : null}
    </header>
  );
}
