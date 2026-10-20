"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/*
 * Ícone no meio do título do hero (padrão Mobbin): o espaço entre as
 * palavras abre, o ícone entra com mola e depois se reveza com os próximos
 * (troca com desfoque e escala). Com movimento reduzido fica parado.
 */
type Ic = { nome: string; tom: string };

export function HeroIcone({ icones, atraso, intervalo }: { icones: Ic[]; atraso: number; intervalo: number }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let id: ReturnType<typeof setInterval> | undefined;
    const t = setTimeout(() => {
      id = setInterval(() => setI((n) => (n + 1) % icones.length), intervalo);
    }, atraso + 1200);
    return () => {
      clearTimeout(t);
      if (id) clearInterval(id);
    };
  }, [atraso, intervalo, icones.length]);

  return (
    <span className="mb-slot" style={{ animationDelay: `${atraso}ms` }} aria-hidden="true">
      <span className="mb-slot__in" style={{ animationDelay: `${atraso + 90}ms` }}>
        {icones.map((ic, k) => (
          <span key={ic.nome} className={`mb-slot__camada${k === i ? " is-on" : ""}`} style={{ "--tom": ic.tom } as React.CSSProperties}>
            <Image src={`/3d/${ic.nome}.png`} alt="" width={64} height={64} priority={k === 0} />
          </span>
        ))}
      </span>
    </span>
  );
}
