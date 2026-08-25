import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PRECEPTOR! Studio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(ellipse 60% 50% at 20% 0%, rgba(33,84,204,0.28), transparent 60%), linear-gradient(180deg, #0A1F44 0%, #071633 100%)",
          display: "flex",
          flexDirection: "column",
          padding: 80,
          position: "relative",
          color: "#fff",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 70,
            right: 90,
            width: 160,
            height: 160,
            background: "#FFFFFF",
            transform: "rotate(45deg)",
            borderRadius: 24,
            boxShadow: "0 0 120px rgba(169,195,242,0.5)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 22,
            letterSpacing: 4,
            color: "#A9C3F2",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              background: "#A9C3F2",
              transform: "rotate(45deg)",
            }}
          />
          IA Aplicada a Processos
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 132,
            fontWeight: 900,
            letterSpacing: "-0.035em",
            lineHeight: 1,
            marginTop: 90,
          }}
        >
          PRECEPTOR!
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 44,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            marginTop: 28,
            color: "rgba(255,255,255,0.92)",
            maxWidth: 900,
          }}
        >
          Primeiro o processo, depois a inteligência.
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 70,
            left: 80,
            right: 80,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            color: "rgba(255,255,255,0.6)",
            fontFamily: "monospace",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          <span>preceptorstudio.com</span>
          <span>est. 2026 · Itajubá, MG</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
