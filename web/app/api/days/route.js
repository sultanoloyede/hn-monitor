import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year"), 10);
  const month = parseInt(searchParams.get("month"), 10);

  if (!year || !month) {
    return NextResponse.json(
      { error: "year and month are required" },
      { status: 400 }
    );
  }

  const { rows } = await pool.query(
    `
    SELECT
      DATE(created_at AT TIME ZONE 'UTC') AS day,
      COUNT(*)::int                        AS run_count,
      BOOL_AND(passed)                     AS all_passed,
      SUM(violation_count)::int            AS total_violations
    FROM runs
    WHERE EXTRACT(YEAR  FROM created_at AT TIME ZONE 'UTC') = $1
      AND EXTRACT(MONTH FROM created_at AT TIME ZONE 'UTC') = $2
    GROUP BY day
    ORDER BY day
    `,
    [year, month]
  );

  return NextResponse.json(
    rows.map((r) => ({
      day: r.day.toISOString().slice(0, 10),
      runCount: r.run_count,
      allPassed: r.all_passed,
      totalViolations: r.total_violations,
    }))
  );
}
