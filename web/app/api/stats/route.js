import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const { rows } = await pool.query(`
    SELECT
      COUNT(*)::int                                          AS "totalRuns",
      ROUND(AVG(CASE WHEN passed THEN 1 ELSE 0 END) * 100, 1)::float AS "passRate",
      ROUND(AVG(duration_ms))::int                          AS "avgDurationMs",
      (SELECT passed    FROM runs ORDER BY created_at DESC LIMIT 1) AS "lastPassed",
      (SELECT created_at FROM runs ORDER BY created_at DESC LIMIT 1) AS "lastRunAt"
    FROM runs
  `);

  return NextResponse.json(rows[0]);
}
