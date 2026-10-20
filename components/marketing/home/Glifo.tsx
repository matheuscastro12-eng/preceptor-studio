/*
 * Ícones de traço fino (SVG inline) no lugar dos ícones 3D, que liam como
 * emoji. Herdam a cor do texto via currentColor.
 */
const P: Record<string, React.ReactNode> = {
  documento: <><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4M10 12h5M10 16h5" /></>,
  recibo: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6M9 16h3" /></>,
  arquivo: <><path d="M3 7h7l2 2h9v11H3z" /><path d="M3 7V5h7l2 2" /></>,
  mensagem: <><path d="M4 5h16v11H9l-5 4z" /><path d="M8 10h8" /></>,
  lupa: <><circle cx="11" cy="11" r="6" /><path d="m20 20-4.5-4.5" /></>,
  robo: <><rect x="5" y="8" width="14" height="11" rx="3" /><path d="M12 4v4M9.5 13v1M14.5 13v1" /></>,
  ampulheta: <><path d="M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9" /></>,
  grafico: <><path d="M4 20h16" /><path d="M7 16v-4M12 16V8M17 16v-7" /></>,
  check: <><circle cx="12" cy="12" r="8" /><path d="m8.5 12 2.5 2.5 4.5-5" /></>,
  dinheiro: <><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /></>,
  pacote: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></>,
  caminhao: <><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7" /><circle cx="7" cy="17.5" r="1.5" /><circle cx="17" cy="17.5" r="1.5" /></>,
};

export function Glifo({ nome, className }: { nome: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {P[nome]}
    </svg>
  );
}
