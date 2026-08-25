"use client";

import React, { forwardRef, useRef } from "react";
import { Truck, Wheat, Stethoscope, Workflow, Clock, Gauge } from "lucide-react";

import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/ui/animated-beam";

/* Diagrama da seção de segmentos: as operações (logística, agro, medicina)
   entram, passam pela PRECEPTOR! no centro, e saem como automação medida.
   Feixes na paleta da marca (teal sobre navy claro). */

const Node = forwardRef<
  HTMLDivElement,
  { className?: string; label?: string; children?: React.ReactNode }
>(({ className, label, children }, ref) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div
        ref={ref}
        className={cn(
          "z-10 flex size-14 items-center justify-center rounded-full bg-white",
          className,
        )}
        style={{
          border: "1px solid var(--line)",
          boxShadow: "0 10px 24px -14px rgba(0, 3, 61, 0.35)",
          color: "var(--navy)",
        }}
      >
        {children}
      </div>
      {label && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--ink-soft)",
            textAlign: "center",
            maxWidth: 110,
            lineHeight: 1.4,
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
});

Node.displayName = "Node";

export function SegmentsBeam() {
  const containerRef = useRef<HTMLDivElement>(null);
  const logisticaRef = useRef<HTMLDivElement>(null);
  const agroRef = useRef<HTMLDivElement>(null);
  const medicinaRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const automacaoRef = useRef<HTMLDivElement>(null);
  const horasRef = useRef<HTMLDivElement>(null);
  const painelRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative flex w-full items-center justify-center overflow-hidden"
      style={{
        minHeight: 420,
        borderRadius: 20,
        border: "1px solid var(--line)",
        background:
          "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(59, 202, 206, 0.06), transparent 70%), var(--bg-soft)",
        padding: "48px 32px",
      }}
    >
      <div
        className="flex size-full flex-col items-stretch justify-between"
        style={{ maxWidth: 720, maxHeight: 320, gap: 32 }}
      >
        <div className="flex flex-row items-center justify-between">
          <Node ref={logisticaRef} label="Logística e Transportes">
            <Truck size={22} strokeWidth={1.8} />
          </Node>
          <Node ref={automacaoRef} label="Automação em produção">
            <Workflow size={22} strokeWidth={1.8} />
          </Node>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Node ref={agroRef} label="Agro">
            <Wheat size={22} strokeWidth={1.8} />
          </Node>
          <Node ref={centerRef} className="size-20" label="Engenharia + IA">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/p-mark.png"
              alt="PRECEPTOR!"
              style={{ width: 44, height: 44, objectFit: "contain" }}
            />
          </Node>
          <Node ref={horasRef} label="Horas devolvidas">
            <Clock size={22} strokeWidth={1.8} />
          </Node>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Node ref={medicinaRef} label="Medicina">
            <Stethoscope size={22} strokeWidth={1.8} />
          </Node>
          <Node ref={painelRef} label="Painel de indicadores">
            <Gauge size={22} strokeWidth={1.8} />
          </Node>
        </div>
      </div>

      {/* Operações entrando na PRECEPTOR! */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={logisticaRef}
        toRef={centerRef}
        curvature={-70}
        endYOffset={-10}
        pathColor="var(--navy)"
        pathOpacity={0.08}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={agroRef}
        toRef={centerRef}
        pathColor="var(--navy)"
        pathOpacity={0.08}
        delay={0.6}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={medicinaRef}
        toRef={centerRef}
        curvature={70}
        endYOffset={10}
        pathColor="var(--navy)"
        pathOpacity={0.08}
        delay={1.2}
      />

      {/* Resultado saindo pro dia a dia */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={automacaoRef}
        toRef={centerRef}
        curvature={-70}
        endYOffset={-10}
        reverse
        pathColor="var(--navy)"
        pathOpacity={0.08}
        delay={0.3}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={horasRef}
        toRef={centerRef}
        reverse
        pathColor="var(--navy)"
        pathOpacity={0.08}
        delay={0.9}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={painelRef}
        toRef={centerRef}
        curvature={70}
        endYOffset={10}
        reverse
        pathColor="var(--navy)"
        pathOpacity={0.08}
        delay={1.5}
      />
    </div>
  );
}
