export default function StatCards({ stats }) {
  const { totalRuns, passRate, avgDurationMs, lastPassed, lastRunAt } =
    stats ?? {};

  const cards = [
    {
      label: "Last Run",
      value:
        lastPassed != null ? (
          <span
            style={{
              display: "inline-block",
              padding: "2px 10px",
              borderRadius: 4,
              fontSize: 14,
              fontWeight: 700,
              background: lastPassed ? "#166534" : "#7f1d1d",
              color: lastPassed ? "#bbf7d0" : "#fecaca",
            }}
          >
            {lastPassed ? "PASS" : "FAIL"}
          </span>
        ) : (
          "—"
        ),
      sub: lastRunAt ? new Date(lastRunAt).toUTCString() : "—",
    },
    {
      label: "Total Runs",
      value: totalRuns ?? "—",
    },
    {
      label: "Pass Rate",
      value: passRate != null ? `${passRate}%` : "—",
    },
    {
      label: "Avg Duration",
      value:
        avgDurationMs != null
          ? `${(avgDurationMs / 1000).toFixed(1)}s`
          : "—",
    },
  ];

  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
      {cards.map((card) => (
        <div
          key={card.label}
          style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: 8,
            padding: "16px 24px",
            minWidth: 160,
          }}
        >
          <div style={{ fontSize: 12, color: "#8b949e", marginBottom: 8 }}>
            {card.label}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#f0f6fc" }}>
            {card.value}
          </div>
          {card.sub && (
            <div style={{ fontSize: 11, color: "#8b949e", marginTop: 6 }}>
              {card.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
