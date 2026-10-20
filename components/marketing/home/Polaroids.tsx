import Image from "next/image";

/*
 * Polaroids presas com tachinha em volta da cena do hero: cada uma é uma
 * frente onde o agente trabalha. Ícones 3D: Microsoft Fluent Emoji (MIT),
 * em public/3d. Decoração; o texto do hero carrega o sentido.
 */
const FOTOS = [
  { img: "caminhao", legenda: "Logística", lado: "e", tom: "#E3F1FF" },
  { img: "estetoscopio", legenda: "Clínicas", lado: "e", tom: "#FFE9EC" },
  { img: "documento", legenda: "Notas fiscais", lado: "e", tom: "#F1ECFF" },
  { img: "trator", legenda: "Agro", lado: "d", tom: "#E6F8E1" },
  { img: "dinheiro", legenda: "Financeiro", lado: "d", tom: "#FFF4D6" },
  { img: "mensagem", legenda: "WhatsApp", lado: "d", tom: "#DFF7F7" },
] as const;

export function Polaroids() {
  return (
    <div className="lp4-fotos" aria-hidden="true">
      {FOTOS.map((f, i) => (
        <figure
          key={f.img}
          className={`lp4-foto lp4-foto--${f.lado} lp4-foto--${i + 1}`}
          style={{ "--tom": f.tom, "--i": i } as React.CSSProperties}
        >
          <Image className="lp4-foto__pino" src="/3d/tachinha.png" alt="" width={34} height={34} />
          <div className="lp4-foto__img">
            <Image src={`/3d/${f.img}.png`} alt="" width={128} height={128} />
          </div>
          <figcaption>{f.legenda}</figcaption>
        </figure>
      ))}
    </div>
  );
}
