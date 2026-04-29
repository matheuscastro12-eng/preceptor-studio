"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const isNew = pathname?.startsWith("/dashboard/new");

  return (
    <header className="sticky top-0 z-30 bg-navy-deep border-b border-cyan/30">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent opacity-80" />
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-2.5 h-2.5 bg-cyan rounded-sm rotate-45 group-hover:rotate-[225deg] transition-transform duration-500" />
            <div className="absolute inset-0 w-2.5 h-2.5 bg-cyan rounded-sm rotate-45 blur-md opacity-60" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-white font-black text-base tracking-tight">PRECEPTOR!</span>
            <span className="text-cyan text-[10px] font-bold tracking-[0.25em] hidden sm:inline">
              STUDIO
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className={`relative px-4 py-2 text-sm rounded-lg transition ${
              !isNew
                ? "text-white font-bold bg-white/5"
                : "text-white/80 hover:text-white font-semibold"
            }`}
          >
            Estudos
            {!isNew && (
              <span className="absolute inset-x-3 -bottom-px h-0.5 bg-cyan rounded-full" />
            )}
          </Link>
          <Link
            href="/dashboard/new"
            className="ml-2 inline-flex items-center gap-1.5 font-black px-4 py-2 rounded-lg text-sm transition"
            style={{
              background: "linear-gradient(180deg, #52E1E7 0%, #3BC8CF 100%)",
              color: "#06122A",
              boxShadow: "0 4px 12px -4px rgba(82,225,231,0.5), inset 0 1px 0 rgba(255,255,255,0.4)",
            }}
          >
            <span className="text-base leading-none">+</span> Novo Estudo
          </Link>
        </nav>
      </div>
    </header>
  );
}
