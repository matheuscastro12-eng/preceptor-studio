export default function DashboardLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Carregando dashboard"
      style={{ padding: 32 }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Shimmer height={24} width="32%" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 14,
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <Shimmer key={i} height={120} />
          ))}
        </div>
        <Shimmer height={320} />
        <Shimmer height={220} />
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
