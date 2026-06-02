import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PRECEPTOR! Venture Studio";
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
            "radial-gradient(ellipse 60% 50% at 20% 0%, rgba(82,225,231,0.22), transparent 60%), radial-gradient(ellipse 50% 40% at 100% 100%, rgba(93,87,235,0.22), transparent 60%), linear-gradient(180deg, #0A1F44 0%, #06122A 100%)",
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
            background: "#52E1E7",
            transform: "rotate(45deg)",
            borderRadius: 24,
            boxShadow: "0 0 120px rgba(82,225,231,0.55)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 22,
            letterSpacing: 4,
            color: "#52E1E7",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              background: "#52E1E7",
              transform: "rotate(45deg)",
            }}
          />
          Venture Studio
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
          Engenharia real. Resultados concretos.
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
          <span>preceptor-studio.vercel.app</span>
          <span>est. 2024 · São Paulo, BR</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
