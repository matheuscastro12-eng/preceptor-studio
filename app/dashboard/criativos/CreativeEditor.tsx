"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";

// ─── Tipos ───────────────────────────────────────────────────────────────────
type BgKind = "gradient" | "solid" | "image";
type Align = "left" | "center";
type Corner = "tl" | "tr" | "bl" | "br";
type Theme = "dark" | "light";
type OverlayDir = "bottom" | "top" | "full" | "none";

interface Slide {
  bg: BgKind;
  gradientKey: string;
  solid: string;
  image: string | null;
  imageFit: "cover" | "contain";
  imagePosY: number;
  overlay: OverlayDir;
  overlayStrength: number;
  eyebrow: string;
  headline: string;
  accent: string;
  sub: string;
  cta: string;
  align: Align;
  theme: Theme;
  showLogo: boolean;
  logoCorner: Corner;
  logoImage: string | null;
}

interface Format {
  id: string;
  label: string;
  w: number;
  h: number;
}

// ─── Presets ─────────────────────────────────────────────────────────────────
const FORMATS: Format[] = [
  { id: "sq", label: "Feed 1:1", w: 1080, h: 1080 },
  { id: "pt", label: "Feed 4:5", w: 1080, h: 1350 },
  { id: "st", label: "Story / Reels 9:16", w: 1080, h: 1920 },
];

const GRADIENTS: Record<string, { label: string; css: string; dark: boolean }> = {
  navy: { label: "Navy", dark: true, css: "linear-gradient(180deg,#0A1F44 0%,#06122A 100%)" },
  navyGlow: {
    label: "Navy glow",
    dark: true,
    css:
      "radial-gradient(ellipse 60% 40% at 18% 8%, rgba(82,225,231,0.20), transparent 60%)," +
      "radial-gradient(ellipse 55% 38% at 100% 100%, rgba(93,87,235,0.22), transparent 60%)," +
      "linear-gradient(180deg,#0A1F44 0%,#06122A 100%)",
  },
  cyan: {
    label: "Cyan deep",
    dark: true,
    css:
      "radial-gradient(ellipse 70% 50% at 30% 0%, rgba(82,225,231,0.18), transparent 60%)," +
      "linear-gradient(160deg,#0F2A55 0%,#06122A 70%)",
  },
  purple: {
    label: "Purple glow",
    dark: true,
    css:
      "radial-gradient(ellipse 60% 45% at 80% 10%, rgba(185,100,255,0.22), transparent 60%)," +
      "linear-gradient(160deg,#10183a 0%,#06122A 80%)",
  },
  light: {
    label: "Claro",
    dark: false,
    css:
      "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(82,225,231,0.10), transparent)," +
      "radial-gradient(ellipse 60% 40% at 100% 0%, rgba(185,100,255,0.07), transparent),#F7F9FC",
  },
};

const C = {
  navy: "#0A1F44",
  navyDeep: "#06122A",
  cyan: "#52E1E7",
  cyanDeep: "#3BC8CF",
  ink: "#0F1729",
  inkSoft: "#475569",
  inkMute: "#94A3B8",
  line: "rgba(15,23,41,0.10)",
  surface: "#FFFFFF",
  surface2: "#F8FAFC",
};

function newSlide(): Slide {
  return {
    bg: "gradient",
    gradientKey: "navyGlow",
    solid: "#0A1F44",
    image: null,
    imageFit: "cover",
    imagePosY: 50,
    overlay: "bottom",
    overlayStrength: 70,
    eyebrow: "DIAGNÓSTICO GRÁTIS",
    headline: "Sua ideia aguenta o mercado?",
    accent: "o mercado",
    sub: "5 eixos. Nota de 0 a 100. Na hora. 3 minutos.",
    cta: "Faça grátis · preceptorstudio.com",
    align: "left",
    theme: "dark",
    showLogo: true,
    logoCorner: "tl",
    logoImage: null,
  };
}

function overlayCss(dir: OverlayDir, strength: number): string {
  const a = Math.min(1, Math.max(0, strength / 100));
  const navy = (op: number) => `rgba(6,18,42,${op.toFixed(3)})`;
  if (dir === "none") return "none";
  if (dir === "full") return `linear-gradient(180deg, ${navy(a * 0.55)}, ${navy(a * 0.75)})`;
  if (dir === "top") return `linear-gradient(180deg, ${navy(a)} 0%, ${navy(a * 0.55)} 40%, ${navy(0)} 100%)`;
  // bottom (default)
  return `linear-gradient(180deg, ${navy(0)} 30%, ${navy(a * 0.6)} 70%, ${navy(a)} 100%)`;
}

// ─── O canvas de um slide (renderizado em tamanho real, 1080px de largura) ────
function SlideCanvas({ slide, format }: { slide: Slide; format: Format }) {
  const grad = GRADIENTS[slide.gradientKey] || GRADIENTS.navy;
  const isDark = slide.theme === "dark";
  const pad = 84;
  const headColor = isDark ? "#FFFFFF" : C.navy;
  const eyebrowColor = C.cyan;
  const subColor = isDark ? "rgba(255,255,255,0.80)" : C.inkSoft;

  const background =
    slide.bg === "solid"
      ? slide.solid
      : slide.bg === "image"
      ? grad.css
      : grad.css;

  const headParts = (() => {
    const h = slide.headline;
    const acc = slide.accent.trim();
    if (!acc || !h.includes(acc)) return [{ t: h, c: false }];
    const idx = h.indexOf(acc);
    return [
      { t: h.slice(0, idx), c: false },
      { t: acc, c: true },
      { t: h.slice(idx + acc.length), c: false },
    ].filter((p) => p.t.length > 0);
  })();

  const logo = (
    <div
      style={{
        position: "absolute",
        ...(slide.logoCorner.includes("t") ? { top: pad } : { bottom: pad }),
        ...(slide.logoCorner.includes("l") ? { left: pad } : { right: pad }),
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      {slide.logoImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={slide.logoImage} alt="" style={{ height: 56, objectFit: "contain" }} crossOrigin="anonymous" />
      ) : (
        <>
          <div style={{ width: 34, height: 34, background: C.cyan, transform: "rotate(45deg)", borderRadius: 6 }} />
          <span style={{ fontFamily: "var(--font-sans)", fontWeight: 900, fontSize: 30, color: isDark ? "#fff" : C.navy, letterSpacing: "-0.01em" }}>
            PRECEPTOR!
          </span>
          <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 14, letterSpacing: "0.24em", color: C.cyan, textTransform: "uppercase" }}>
            Studio
          </span>
        </>
      )}
    </div>
  );

  return (
    <div
      style={{
        width: format.w,
        height: format.h,
        position: "relative",
        overflow: "hidden",
        background,
        fontFamily: "var(--font-sans)",
        flexShrink: 0,
      }}
    >
      {/* imagem de fundo */}
      {slide.bg === "image" && slide.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={slide.image}
          alt=""
          crossOrigin="anonymous"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: slide.imageFit,
            objectPosition: `50% ${slide.imagePosY}%`,
          }}
        />
      )}
      {/* gradiente por cima da imagem */}
      {slide.bg === "image" && slide.overlay !== "none" && (
        <div style={{ position: "absolute", inset: 0, background: overlayCss(slide.overlay, slide.overlayStrength) }} />
      )}

      {logo}

      {/* conteúdo de texto */}
      <div
        style={{
          position: "absolute",
          left: pad,
          right: pad,
          bottom: pad + 8,
          display: "flex",
          flexDirection: "column",
          alignItems: slide.align === "center" ? "center" : "flex-start",
          textAlign: slide.align,
          gap: 0,
        }}
      >
        {slide.eyebrow.trim() && (
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: eyebrowColor, marginBottom: 22 }}>
            {slide.eyebrow}
          </div>
        )}
        <div style={{ fontWeight: 900, fontSize: 82, lineHeight: 1.04, letterSpacing: "-0.03em", color: headColor, maxWidth: "100%" }}>
          {headParts.map((p, i) => (
            <span key={i} style={p.c ? { color: C.cyan } : undefined}>
              {p.t}
            </span>
          ))}
        </div>
        {slide.sub.trim() && (
          <div style={{ fontSize: 34, lineHeight: 1.45, color: subColor, marginTop: 24, maxWidth: "92%" }}>{slide.sub}</div>
        )}
        {slide.cta.trim() && (
          <div
            style={{
              marginTop: 34,
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              background: isDark ? C.cyan : C.navy,
              color: isDark ? C.navyDeep : "#fff",
              fontWeight: 800,
              fontSize: 30,
              padding: "16px 28px",
              borderRadius: 999,
            }}
          >
            {slide.cta}
            <span style={{ fontWeight: 700 }}>→</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Editor ──────────────────────────────────────────────────────────────────
export function CreativeEditor() {
  const [format, setFormat] = useState<Format>(FORMATS[0]);
  const [slides, setSlides] = useState<Slide[]>([newSlide()]);
  const [cur, setCur] = useState(0);
  const [exporting, setExporting] = useState(false);
  const exportRefs = useRef<(HTMLDivElement | null)[]>([]);

  const slide = slides[cur];

  const patch = useCallback(
    (p: Partial<Slide>) => {
      setSlides((arr) => arr.map((s, i) => (i === cur ? { ...s, ...p } : s)));
    },
    [cur]
  );

  function addSlide() {
    setSlides((a) => [...a, newSlide()]);
    setCur(slides.length);
  }
  function dupSlide() {
    setSlides((a) => {
      const copy = { ...a[cur] };
      const out = [...a];
      out.splice(cur + 1, 0, copy);
      return out;
    });
    setCur(cur + 1);
  }
  function delSlide() {
    if (slides.length === 1) return;
    setSlides((a) => a.filter((_, i) => i !== cur));
    setCur((c) => Math.max(0, c - 1));
  }

  function readImage(file: File, cb: (dataUrl: string) => void) {
    const reader = new FileReader();
    reader.onload = () => cb(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function exportOne(i: number) {
    const node = exportRefs.current[i];
    if (!node) return;
    try {
      if (typeof document !== "undefined" && (document as any).fonts?.ready) {
        await (document as any).fonts.ready;
      }
    } catch {}
    const dataUrl = await toPng(node, { pixelRatio: 1, cacheBust: true, width: format.w, height: format.h });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `preceptor-criativo-${i + 1}.png`;
    a.click();
  }

  async function exportCurrent() {
    setExporting(true);
    try {
      await exportOne(cur);
    } finally {
      setExporting(false);
    }
  }
  async function exportAll() {
    setExporting(true);
    try {
      for (let i = 0; i < slides.length; i++) {
        await exportOne(i);
        await new Promise((r) => setTimeout(r, 350));
      }
    } finally {
      setExporting(false);
    }
  }

  // escala do preview pra caber na área
  const previewMaxW = 360;
  const previewMaxH = 540;
  const scale = useMemo(() => Math.min(previewMaxW / format.w, previewMaxH / format.h), [format]);

  return (
    <div style={{ padding: "8px 4px 40px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.cyanDeep }}>Estúdio</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.02em", color: C.navy, marginTop: 4 }}>Criativos</h1>
          <p style={{ color: C.inkSoft, fontSize: 13, marginTop: 2 }}>Carrosséis e estáticos no design system. Imagem, gradiente, fontes da marca, logo. Exporta em PNG 1080.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={exportCurrent} disabled={exporting} style={btn(false)}>
            {exporting ? "Exportando..." : "Baixar PNG"}
          </button>
          <button onClick={exportAll} disabled={exporting} style={btn(true)}>
            Baixar todos ({slides.length})
          </button>
        </div>
      </div>

      {/* formato */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {FORMATS.map((f) => (
          <button key={f.id} onClick={() => setFormat(f)} style={chip(f.id === format.id)}>{f.label}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 18, alignItems: "start" }}>
        {/* ─── Controles ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Panel title="Fundo">
            <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
              {(["gradient", "image", "solid"] as BgKind[]).map((k) => (
                <button key={k} onClick={() => patch({ bg: k })} style={seg(slide.bg === k)}>
                  {k === "gradient" ? "Gradiente" : k === "image" ? "Imagem" : "Cor"}
                </button>
              ))}
            </div>
            {slide.bg === "gradient" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {Object.entries(GRADIENTS).map(([key, g]) => (
                  <button key={key} onClick={() => patch({ gradientKey: key, theme: g.dark ? "dark" : "light" })}
                    style={{ ...gradSwatch(slide.gradientKey === key), background: g.css }}>
                    <span style={{ background: "rgba(0,0,0,0.35)", color: "#fff", fontSize: 10, padding: "2px 6px", borderRadius: 5 }}>{g.label}</span>
                  </button>
                ))}
              </div>
            )}
            {slide.bg === "solid" && (
              <input type="color" value={slide.solid} onChange={(e) => patch({ solid: e.target.value })} style={{ width: "100%", height: 36, border: "1px solid " + C.line, borderRadius: 8 }} />
            )}
            {slide.bg === "image" && (
              <div>
                <UploadBtn label="Subir imagem" onFile={(f) => readImage(f, (d) => patch({ image: d }))} />
                {slide.image && (
                  <>
                    <Row label="Ajuste">
                      <button onClick={() => patch({ imageFit: "cover" })} style={seg(slide.imageFit === "cover")}>Preencher</button>
                      <button onClick={() => patch({ imageFit: "contain" })} style={seg(slide.imageFit === "contain")}>Conter</button>
                    </Row>
                    <Slider label={`Posição vertical ${slide.imagePosY}%`} value={slide.imagePosY} onChange={(v) => patch({ imagePosY: v })} />
                  </>
                )}
              </div>
            )}
          </Panel>

          {slide.bg === "image" && (
            <Panel title="Gradiente por cima (legibilidade)">
              <div style={{ display: "flex", gap: 5, marginBottom: 8, flexWrap: "wrap" }}>
                {([["bottom", "Embaixo"], ["full", "Total"], ["top", "Em cima"], ["none", "Sem"]] as [OverlayDir, string][]).map(([d, lbl]) => (
                  <button key={d} onClick={() => patch({ overlay: d })} style={seg(slide.overlay === d)}>{lbl}</button>
                ))}
              </div>
              {slide.overlay !== "none" && <Slider label={`Intensidade ${slide.overlayStrength}%`} value={slide.overlayStrength} onChange={(v) => patch({ overlayStrength: v })} />}
            </Panel>
          )}

          <Panel title="Texto">
            <Field label="Eyebrow (rótulo)"><input value={slide.eyebrow} onChange={(e) => patch({ eyebrow: e.target.value })} style={inp} /></Field>
            <Field label="Título"><textarea value={slide.headline} onChange={(e) => patch({ headline: e.target.value })} rows={2} style={{ ...inp, resize: "vertical" }} /></Field>
            <Field label="Palavra em destaque (cyan)"><input value={slide.accent} onChange={(e) => patch({ accent: e.target.value })} placeholder="parte do título" style={inp} /></Field>
            <Field label="Subtítulo"><textarea value={slide.sub} onChange={(e) => patch({ sub: e.target.value })} rows={2} style={{ ...inp, resize: "vertical" }} /></Field>
            <Field label="CTA"><input value={slide.cta} onChange={(e) => patch({ cta: e.target.value })} style={inp} /></Field>
            <Row label="Alinhamento">
              <button onClick={() => patch({ align: "left" })} style={seg(slide.align === "left")}>Esquerda</button>
              <button onClick={() => patch({ align: "center" })} style={seg(slide.align === "center")}>Centro</button>
            </Row>
            <Row label="Tema do texto">
              <button onClick={() => patch({ theme: "dark" })} style={seg(slide.theme === "dark")}>Claro (p/ fundo escuro)</button>
              <button onClick={() => patch({ theme: "light" })} style={seg(slide.theme === "light")}>Escuro</button>
            </Row>
          </Panel>

          <Panel title="Logo">
            <Row label="Mostrar">
              <button onClick={() => patch({ showLogo: true })} style={seg(slide.showLogo)}>Sim</button>
              <button onClick={() => patch({ showLogo: false })} style={seg(!slide.showLogo)}>Não</button>
            </Row>
            {slide.showLogo && (
              <>
                <Row label="Canto">
                  {(["tl", "tr", "bl", "br"] as Corner[]).map((c) => (
                    <button key={c} onClick={() => patch({ logoCorner: c })} style={seg(slide.logoCorner === c)}>{c.toUpperCase()}</button>
                  ))}
                </Row>
                <UploadBtn label={slide.logoImage ? "Trocar logo" : "Subir logo próprio"} onFile={(f) => readImage(f, (d) => patch({ logoImage: d }))} />
                {slide.logoImage && <button onClick={() => patch({ logoImage: null })} style={{ ...seg(false), marginTop: 6, width: "100%" }}>Usar logo PRECEPTOR! padrão</button>}
              </>
            )}
          </Panel>
        </div>

        {/* ─── Preview ─── */}
        <div>
          <div style={{ background: "#EEF2F7", borderRadius: 16, padding: 18, display: "flex", justifyContent: "center", minHeight: previewMaxH + 36 }}>
            <div style={{ width: format.w * scale, height: format.h * scale }}>
              <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", boxShadow: "0 20px 50px -20px rgba(10,31,68,0.5)", borderRadius: 4, overflow: "hidden", width: format.w, height: format.h }}>
                <SlideCanvas slide={slide} format={format} />
              </div>
            </div>
          </div>

          {/* Slides (carrossel) */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            {slides.map((s, i) => (
              <button key={i} onClick={() => setCur(i)} style={slideTab(i === cur)}>
                <div style={{ width: 34, height: 34 * (format.h / format.w), borderRadius: 3, overflow: "hidden", position: "relative", flexShrink: 0 }}>
                  <div style={{ transform: `scale(${34 / format.w})`, transformOrigin: "top left", width: format.w, height: format.h }}>
                    <SlideCanvas slide={s} format={format} />
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
              </button>
            ))}
            <button onClick={addSlide} style={{ ...slideTab(false), padding: "10px 14px", fontWeight: 800 }}>+ slide</button>
            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              <button onClick={dupSlide} style={miniBtn}>Duplicar</button>
              <button onClick={delSlide} disabled={slides.length === 1} style={{ ...miniBtn, color: slides.length === 1 ? C.inkMute : "#b91c1c" }}>Excluir</button>
            </div>
          </div>
          <p style={{ fontSize: 11, color: C.inkMute, marginTop: 10 }}>Carrossel: adicione slides e use "Baixar todos" para exportar a sequência. Cada PNG sai em 1080px, pronto pro Instagram.</p>
        </div>
      </div>

      {/* render oculto em tamanho real (fonte do export) */}
      <div style={{ position: "fixed", left: -99999, top: 0, pointerEvents: "none", opacity: 0 }} aria-hidden>
        {slides.map((s, i) => (
          <div key={i} ref={(el) => { exportRefs.current[i] = el; }}>
            <SlideCanvas slide={s} format={format} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── UI helpers ──────────────────────────────────────────────────────────────
const inp: React.CSSProperties = {
  width: "100%", border: "1px solid " + C.line, borderRadius: 8, padding: "8px 10px",
  fontSize: 12.5, color: C.ink, fontFamily: "var(--font-sans)", background: "#fff",
};

function btn(primary: boolean): React.CSSProperties {
  return {
    border: 0, cursor: "pointer", borderRadius: 10, padding: "9px 16px", fontWeight: 800, fontSize: 12.5,
    color: "#fff", background: primary ? "linear-gradient(180deg,#52E1E7,#3BC8CF)" : "linear-gradient(180deg,#0A1F44,#06122A)",
    ...(primary ? { color: C.navyDeep } : {}),
  };
}
function chip(active: boolean): React.CSSProperties {
  return {
    border: "1px solid " + (active ? C.navy : C.line), background: active ? "linear-gradient(180deg,#0A1F44,#06122A)" : "#fff",
    color: active ? "#fff" : C.inkSoft, borderRadius: 999, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer",
  };
}
function seg(active: boolean): React.CSSProperties {
  return {
    border: "1px solid " + (active ? C.cyanDeep : C.line), background: active ? "rgba(82,225,231,0.12)" : "#fff",
    color: active ? C.cyanDeep : C.inkSoft, borderRadius: 7, padding: "6px 9px", fontSize: 11, fontWeight: 700, cursor: "pointer",
  };
}
function gradSwatch(active: boolean): React.CSSProperties {
  return { height: 48, borderRadius: 8, cursor: "pointer", border: "2px solid " + (active ? C.cyan : "transparent"), display: "flex", alignItems: "flex-end", padding: 6 };
}
function slideTab(active: boolean): React.CSSProperties {
  return { display: "flex", alignItems: "center", gap: 6, border: "1px solid " + (active ? C.cyanDeep : C.line), background: active ? "rgba(82,225,231,0.10)" : "#fff", borderRadius: 9, padding: "5px 8px", cursor: "pointer", color: C.navy };
}
const miniBtn: React.CSSProperties = { border: "1px solid " + C.line, background: "#fff", borderRadius: 7, padding: "6px 10px", fontSize: 11, fontWeight: 700, color: C.inkSoft, cursor: "pointer" };

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid " + C.line, borderRadius: 12, padding: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: C.inkMute, marginBottom: 9 }}>{title}</div>
      {children}
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: 8 }}>
      <span style={{ fontSize: 10.5, fontWeight: 700, color: C.inkSoft, display: "block", marginBottom: 3 }}>{label}</span>
      {children}
    </label>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <span style={{ fontSize: 10.5, fontWeight: 700, color: C.inkSoft, display: "block", marginBottom: 3 }}>{label}</span>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{children}</div>
    </div>
  );
}
function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label style={{ display: "block", marginTop: 8 }}>
      <span style={{ fontSize: 10.5, fontWeight: 700, color: C.inkSoft, display: "block", marginBottom: 3 }}>{label}</span>
      <input type="range" min={0} max={100} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: "100%", accentColor: C.cyanDeep }} />
    </label>
  );
}
function UploadBtn({ label, onFile }: { label: string; onFile: (f: File) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <button onClick={() => ref.current?.click()} style={{ width: "100%", border: "1px dashed " + C.cyanDeep, background: "rgba(82,225,231,0.06)", color: C.cyanDeep, borderRadius: 8, padding: "9px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
        {label}
      </button>
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.currentTarget.value = ""; }} />
    </>
  );
}
