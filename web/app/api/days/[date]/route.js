import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { date } = await params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "date must be YYYY-MM-DD" },
      { status: 400 }
    );
  }

  // Fetch all runs for the given date
  const { rows: runs } = await pool.query(
    `
    SELECT id, created_at, passed, violation_count, duration_ms, screenshot_url
    FROM runs
    WHERE DATE(created_at AT TIME ZONE 'UTC') = $1
    ORDER BY created_at
    `,
    [date]
  );

  if (runs.length === 0) {
    return NextResponse.json({ date, runs: [] });
  }

  const runIds = runs.map((r) => r.id);

  // Fetch articles for all runs in one query
  const { rows: articles } = await pool.query(
    `
    SELECT run_id, rank, hn_id, title, url, hn_timestamp, relative_age, sort_valid
    FROM articles
    WHERE run_id = ANY($1)
    ORDER BY run_id, rank
    `,
    [runIds]
  );

  // Fetch violations for all runs in one query
  const { rows: violations } = await pool.query(
    `
    SELECT run_id, from_rank, to_rank, from_title, to_title, from_ts, to_ts
    FROM violations
    WHERE run_id = ANY($1)
    ORDER BY run_id, from_rank
    `,
    [runIds]
  );

  // Group articles and violations by run_id
  const articlesByRun = {};
  const violationsByRun = {};
  for (const a of articles) {
    (articlesByRun[a.run_id] ??= []).push(a);
  }
  for (const v of violations) {
    (violationsByRun[v.run_id] ??= []).push(v);
  }

  return NextResponse.json({
    date,
    runs: runs.map((r) => ({
      id: r.id,
      created_at: r.created_at,
      passed: r.passed,
      violation_count: r.violation_count,
      duration_ms: r.duration_ms,
      screenshot_url: r.screenshot_url,
      articles: articlesByRun[r.id] ?? [],
      violations: violationsByRun[r.id] ?? [],
    })),
  });
}
