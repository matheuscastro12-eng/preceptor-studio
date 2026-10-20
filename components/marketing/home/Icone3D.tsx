import Image from "next/image";

/* Ícone 3D decorativo (Microsoft Fluent Emoji, MIT, em public/3d). */
export function Icone3D({ nome, tamanho = 56, className }: { nome: string; tamanho?: number; className?: string }) {
  return (
    <Image
      src={`/3d/${nome}.png`}
      alt=""
      aria-hidden="true"
      width={tamanho}
      height={tamanho}
      className={`lp4-ic3d${className ? ` ${className}` : ""}`}
    />
  );
}
