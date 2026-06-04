import Link from "next/link";
import type { FunnelSummary, FunnelRow } from "@/lib/funnelData";

function pct(n: number, base: number): string {
  if (!base) return "0%";
  return Math.round((n / base) * 100) + "%";
}

const navy = "#0A1F44";
const cyan = "#3BC8CF";
const inkSoft = "#475569";
const inkMute = "#94A3B8";
const line = "rgba(15,23,41,0.08)";

export function FunilView({ data, days }: { data: FunnelSummary; days: number }) {
  const steps = [
    { label: "Visitantes (sessões únicas)", value: data.visitors, color: navy },
    { label: "Abriram o diagnóstico", value: data.diag_views, color: "#1B2F5C" },
    { label: "Começaram a responder", value: data.diag_starts, color: "#5D57EB" },
    { label: "Viraram lead", value: data.leads, color: cyan },
    { label: "Pediram contato", value: data.contacts, color: "#10B981" },
  ];
  const top = Math.max(data.visitors, data.leads, 1);
  const hasData = data.page_views > 0 || data.leads > 0;

  return (
    <div style={{ padding: "8px 4px 40px", maxWidth: 1000 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: cyan }}>
            Aquisição
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.02em", color: navy, marginTop: 4 }}>
            Funil de aquisição
          </h1>
          <p style={{ color: inkSoft, fontSize: 13, marginTop: 2 }}>
            Da visita ao lead. Últimos <strong>{days} dias</strong>. Origem rastreada por UTM.
          </p>
        </div>
        <div style={{ display: "inline-flex", gap: 4, background: "#F1F5F9", padding: 4, borderRadius: 999 }}>
          {[7, 30, 90].map((d) => (
            <Link
              key={d}
              href={`/dashboard/funil?d=${d}`}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                fontSize: 12.5,
                fontWeight: 700,
                textDecoration: "none",
                color: d === days ? "#fff" : inkSoft,
                background: d === days ? "linear-gradient(180deg,#0A1F44,#06122A)" : "transparent",
              }}
            >
              {d}d
            </Link>
          ))}
        </div>
      </div>

      {!hasData && (
        <div style={{ marginTop: 20, background: "#FEF3C7", border: "1px solid #F59E0B", borderRadius: 12, padding: "14px 16px", color: "#7c5a09", fontSize: 13 }}>
          Ainda sem dados de tráfego neste período. Assim que você ligar o Meta Ads (ou tiver visitas orgânicas), o funil começa a preencher aqui automaticamente.
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginTop: 18 }}>
        <Kpi label="Visitantes" value={data.visitors} />
        <Kpi label="Page views" value={data.page_views} />
        <Kpi label="Leads" value={data.leads} accent />
        <Kpi label="Pediram contato" value={data.contacts} />
      </div>

      {/* Funil */}
      <div style={{ marginTop: 20, background: "#fff", border: `1px solid ${line}`, borderRadius: 16, padding: 20, boxShadow: "0 1px 2px rgba(15,23,41,0.04)" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: navy, marginBottom: 14 }}>Conversão passo a passo</div>
        {steps.map((s, i) => {
          const w = Math.max(6, Math.round((s.value / top) * 100));
          const prev = i > 0 ? steps[i - 1].value : null;
          return (
            <div key={s.label} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: navy }}>{s.label}</span>
                <span style={{ fontSize: 12, color: inkSoft }}>
                  <strong style={{ color: navy, fontVariantNumeric: "tabular-nums" }}>{s.value.toLocaleString("pt-BR")}</strong>
                  {prev !== null && (
                    <span style={{ color: inkMute, marginLeft: 8, fontFamily: "var(--font-mono)", fontSize: 11 }}>
                      {pct(s.value, prev)} do passo anterior
                    </span>
                  )}
                </span>
              </div>
              <div style={{ height: 26, borderRadius: 8, background: "#F1F5F9", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${w}%`, background: s.color, borderRadius: 8, transition: "width 600ms" }} />
              </div>
            </div>
          );
        })}
        {data.visitors > 0 && (
          <div style={{ marginTop: 8, fontSize: 12, color: inkSoft }}>
            Conversão visita → lead: <strong style={{ color: cyan }}>{pct(data.leads, data.visitors)}</strong>
          </div>
        )}
      </div>

      {/* Tabelas de origem */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>
        <OriginTable title="Leads por origem (utm_source)" rows={data.by_source} metric="leads" />
        <OriginTable title="Tráfego por origem" rows={data.traffic_by_source} metric="visitors" />
        <OriginTable title="Leads por campanha (utm_campaign)" rows={data.by_campaign} metric="leads" showScore />
        <OriginTable title="Leads por criativo (utm_content)" rows={data.by_content} metric="leads" />
      </div>

      <p style={{ marginTop: 16, fontSize: 11, color: inkMute }}>
        Os criativos seguem a convenção PS-Mx-Sx-ANGULO-FORMATO-V (o mesmo código vira utm_content), então você vê aqui qual criativo trouxe cada lead.
      </p>
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div style={{ background: accent ? "linear-gradient(135deg, rgba(82,225,231,0.12), rgba(93,87,235,0.08))" : "#fff", border: `1px solid ${line}`, borderRadius: 12, padding: 14 }}>
      <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700, color: inkMute }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.02em", color: navy, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
        {value.toLocaleString("pt-BR")}
      </div>
    </div>
  );
}

function OriginTable({ title, rows, metric, showScore }: { title: string; rows: FunnelRow[]; metric: "leads" | "visitors"; showScore?: boolean }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${line}`, borderRadius: 14, padding: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: navy, marginBottom: 8 }}>{title}</div>
      {rows.length === 0 ? (
        <div style={{ fontSize: 11.5, color: inkMute }}>Sem dados ainda.</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${line}` }}>
                <td style={{ padding: "5px 4px", color: inkSoft }}>{r.label}</td>
                {showScore && (
                  <td style={{ padding: "5px 4px", color: inkMute, textAlign: "right", fontFamily: "var(--font-mono)" }}>
                    score {r.score ?? 0}
                  </td>
                )}
                <td style={{ padding: "5px 4px", color: navy, fontWeight: 700, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  {(metric === "leads" ? r.leads : r.visitors) ?? 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
