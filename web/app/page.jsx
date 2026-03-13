import Link from "next/link";
import pool from "@/lib/db";
import StatCards from "@/components/StatCards";
import ContributionGrid from "@/components/ContributionGrid";

export const dynamic = "force-dynamic";

async function getStats() {
  const { rows } = await pool.query(`
    SELECT
      COUNT(*)::int                                                    AS "totalRuns",
      ROUND(AVG(CASE WHEN passed THEN 1.0 ELSE 0.0 END) * 100, 1)::float AS "passRate",
      ROUND(AVG(duration_ms))::int                                    AS "avgDurationMs",
      (SELECT passed     FROM runs ORDER BY created_at DESC LIMIT 1)  AS "lastPassed",
      (SELECT created_at FROM runs ORDER BY created_at DESC LIMIT 1)  AS "lastRunAt"
    FROM runs
  `);
  return rows[0];
}

async function getGrid(year) {
  const { rows } = await pool.query(
    `
    SELECT
      DATE(created_at AT TIME ZONE 'UTC') AS day,
      BOOL_AND(passed)                    AS all_passed
    FROM runs
    WHERE EXTRACT(YEAR FROM created_at AT TIME ZONE 'UTC') = $1
    GROUP BY day
    ORDER BY day
    `,
    [year],
  );
  return rows.map((r) => ({
    day: r.day.toISOString().slice(0, 10),
    passed: r.all_passed,
  }));
}

export default async function Home() {
  const year = new Date().getFullYear();
  const [stats, gridData] = await Promise.all([getStats(), getGrid(year)]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0d1117",
        color: "#f0f6fc",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: "32px 40px",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 40,
          borderBottom: "1px solid #21262d",
          paddingBottom: 20,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
            HN Sort Monitor
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#8b949e" }}>
            Hacker News /newest — sort order validated every hour
          </p>
        </div>
        <Link
          href="/days"
          style={{
            color: "#58a6ff",
            textDecoration: "none",
            fontSize: 14,
            border: "1px solid #30363d",
            padding: "6px 14px",
            borderRadius: 6,
          }}
        >
          Day Details →
        </Link>
      </header>

      {/* Stat cards */}
      <StatCards stats={stats} />

      {/* Contribution grid */}
      <section>
        <h2
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#8b949e",
            marginBottom: 16,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {year} — Sort validation history
        </h2>
        <div
          style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: 8,
            padding: "20px 24px",
          }}
        >
          <ContributionGrid year={year} data={gridData} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 16,
              fontSize: 11,
              color: "#8b949e",
            }}
          >
            {[
              { color: "#21262d", label: "No run" },
              { color: "#26a641", label: "Pass" },
              { color: "#da3633", label: "Fail" },
            ].map(({ color, label }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  marginRight: 8,
                }}
              >
                <div
                  style={{
                    width: 11,
                    height: 11,
                    borderRadius: 2,
                    background: color,
                  }}
                />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
