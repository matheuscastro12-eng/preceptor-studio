"use client";

export function LikertField({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  const labels = ["Discordo", "Discordo um pouco", "Neutro", "Concordo um pouco", "Concordo"];
  return (
    <div>
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginTop: 6 }}
      >
        {labels.map((opt, idx) => {
          const checked = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              style={{
                padding: "14px 8px 10px",
                border: `2px solid ${checked ? "var(--cyan)" : "rgba(15,23,41,0.08)"}`,
                background: checked ? "rgba(82,225,231,0.1)" : "#fff",
                borderRadius: 12,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                boxShadow: checked ? "var(--glow-cyan)" : "none",
                transition: "all 160ms var(--ease-out)",
                fontFamily: "var(--font-sans)",
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: checked ? "var(--navy)" : "var(--ink-soft)",
                  transform: checked ? "scale(1.08)" : "none",
                  transition: "transform 160ms",
                }}
              >
                {idx + 1}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: checked ? "var(--navy)" : "var(--ink-soft)",
                  lineHeight: 1.15,
                  textAlign: "center",
                }}
              >
                {opt}
              </span>
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, padding: "0 6px" }}>
        <span className="overline">Discordo</span>
        <span className="overline">Concordo</span>
      </div>
    </div>
  );
}

export function SingleChoice({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {options.map((opt) => {
        const checked = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 16px",
              borderRadius: 12,
              border: `2px solid ${checked ? "var(--cyan)" : "rgba(15,23,41,0.08)"}`,
              background: checked ? "rgba(82,225,231,0.05)" : "#fff",
              boxShadow: checked ? "var(--glow-cyan)" : "none",
              textAlign: "left",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              transition: "all 160ms var(--ease-out)",
            }}
          >
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                border: `2px solid ${checked ? "var(--cyan)" : "rgba(15,23,41,0.2)"}`,
                background: checked ? "var(--cyan)" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {checked && (
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--navy-deep)",
                  }}
                />
              )}
            </span>
            <span style={{ color: "var(--navy)", fontSize: 14, fontWeight: 500 }}>{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

export function LongText({
  value,
  onChange,
  placeholder,
}: {
  value: string | undefined;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      className="input"
      rows={4}
      placeholder={placeholder}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
