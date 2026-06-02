import type { ReactNode } from "react";
import Link from "next/link";
import {
  MeshTexture,
  Sparkle,
  CircleRing,
  MiniDiamond,
} from "@/components/marketing/MarketingShared";

export function AuthShell({
  children,
  eyebrow,
  title,
  lead,
  panelTitle,
  panelLead,
  bullets,
}: {
  children: ReactNode;
  eyebrow: string;
  title: ReactNode;
  lead: string;
  panelTitle: string;
  panelLead: string;
  bullets: string[];
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
        background:
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(82,225,231,0.08), transparent), #f7f9fc",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "56px 48px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420 }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              marginBottom: 36,
            }}
            aria-label="Voltar para a home"
          >
            <span
              style={{
                width: 14,
                height: 14,
                background: "var(--cyan)",
                transform: "rotate(45deg)",
                borderRadius: 3,
                display: "inline-block",
              }}
              aria-hidden="true"
            />
            <span
              style={{
                fontWeight: 900,
                fontSize: 16,
                color: "var(--navy)",
                letterSpacing: "-0.012em",
              }}
            >
              PRECEPTOR!
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--cyan-deep)",
              }}
            >
              Studio
            </span>
          </Link>
          <span
            className="eyebrow"
            style={{ display: "block", marginBottom: 10 }}
          >
            {eyebrow}
          </span>
          <h1
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 900,
              fontSize: 36,
              color: "var(--navy)",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              margin: "0 0 12px",
            }}
          >
            {title}
          </h1>
          <p
            style={{
              color: "var(--ink-soft)",
              fontSize: 15,
              lineHeight: 1.55,
              margin: "0 0 28px",
            }}
          >
            {lead}
          </p>
          {children}
        </div>
      </div>

      <aside
        aria-hidden="true"
        style={{
          position: "relative",
          background: "linear-gradient(160deg, #0F2A55 0%, #06122A 100%)",
          color: "#fff",
          overflow: "hidden",
          padding: 56,
          display: "flex",
          alignItems: "center",
        }}
      >
        <MeshTexture />
        <Sparkle size={28} style={{ top: 64, left: 56 }} />
        <Sparkle size={14} style={{ top: 120, left: 130, opacity: 0.6 }} />
        <CircleRing size={120} dashed style={{ bottom: 60, right: 56 }} />
        <Sparkle size={20} style={{ bottom: 120, left: 80 }} />

        <div style={{ position: "relative", maxWidth: 420 }}>
          <span className="mkt-chip" style={{ marginBottom: 24 }}>
            <span className="mkt-chip__dot" />
            Workspace privado
          </span>
          <h2
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 900,
              fontSize: 32,
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
              margin: "0 0 14px",
              color: "#fff",
            }}
          >
            {panelTitle}
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 15,
              lineHeight: 1.55,
              margin: "0 0 28px",
            }}
          >
            {panelLead}
          </p>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {bullets.map((b) => (
              <li
                key={b}
                style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
              >
                <span style={{ marginTop: 6 }}>
                  <MiniDiamond size={9} color="var(--cyan)" />
                </span>
                <span style={{ color: "rgba(255,255,255,0.86)", fontSize: 14 }}>
                  {b}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        marginTop: 14,
        background: "rgba(239,68,68,0.08)",
        border: "1px solid rgba(239,68,68,0.25)",
        color: "#b91c1c",
        borderRadius: 12,
        padding: "12px 14px",
        fontSize: 13.5,
        lineHeight: 1.45,
      }}
    >
      {message}
    </div>
  );
}

export function AuthSuccess({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        marginTop: 14,
        background: "rgba(16,185,129,0.08)",
        border: "1px solid rgba(16,185,129,0.25)",
        color: "#047857",
        borderRadius: 12,
        padding: "12px 14px",
        fontSize: 13.5,
        lineHeight: 1.45,
      }}
    >
      {message}
    </div>
  );
}
