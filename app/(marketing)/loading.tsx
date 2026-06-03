export default function MarketingLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Carregando landing"
      style={{ padding: "120px 32px" }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <Shimmer height={28} width="38%" />
        <div style={{ height: 24 }} />
        <Shimmer height={72} width="86%" />
        <div style={{ height: 14 }} />
        <Shimmer height={72} width="70%" />
        <div style={{ height: 36 }} />
        <Shimmer height={18} width="44%" />
        <div style={{ height: 40 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <Shimmer height={300} />
          <Shimmer height={300} />
        </div>
      </div>
      <style>{`@keyframes preceptor-shimmer {
        0% { background-position: -400px 0; }
        100% { background-position: 400px 0; }
      }`}</style>
    </div>
  );
}

function Shimmer({
  height,
  width = "100%",
}: {
  height: number;
  width?: string | number;
}) {
  return (
    <div
      style={{
        height,
        width,
        borderRadius: 14,
        background:
          "linear-gradient(90deg, rgba(15,23,41,0.04) 0%, rgba(82,225,231,0.08) 50%, rgba(15,23,41,0.04) 100%)",
        backgroundSize: "800px 100%",
        animation: "preceptor-shimmer 1400ms linear infinite",
      }}
      aria-hidden="true"
    />
  );
}
