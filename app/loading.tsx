export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Carregando"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(82,225,231,0.08), transparent), #f7f9fc",
      }}
    >
      <div
        className="surface"
        style={{
          padding: 28,
          borderRadius: 20,
          display: "inline-flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            border: "2.5px solid rgba(82,225,231,0.18)",
            borderTopColor: "var(--cyan-deep)",
            animation: "preceptor-spin 700ms linear infinite",
            display: "inline-block",
          }}
          aria-hidden="true"
        />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--ink-soft)",
          }}
        >
          carregando
        </span>
      </div>
      <style>{`@keyframes preceptor-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
