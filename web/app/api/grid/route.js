import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year"), 10);

  if (!year) {
    return NextResponse.json({ error: "year is required" }, { status: 400 });
  }

  const { rows } = await pool.query(
    `
    SELECT
      DATE(created_at AT TIME ZONE 'UTC') AS day,
      BOOL_AND(passed) AS all_passed
    FROM runs
    WHERE EXTRACT(YEAR FROM created_at AT TIME ZONE 'UTC') = $1
    GROUP BY day
    ORDER BY day
    `,
    [year]
  );

  return NextResponse.json(
    rows.map((r) => ({
      day: r.day.toISOString().slice(0, 10),
      passed: r.all_passed,
    }))
  );
}
