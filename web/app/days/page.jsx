"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import MonthPagination from "@/components/MonthPagination";
import DayCard from "@/components/DayCard";

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function allDaysForMonth(year, month, dayMap) {
  const count = daysInMonth(year, month);
  return Array.from({ length: count }, (_, i) => {
    const d = String(i + 1).padStart(2, "0");
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${d}`;
    return dayMap[dateStr] ?? { day: dateStr, runCount: 0, allPassed: null, totalViolations: 0 };
  });
}

function DaysContent() {
  const params = useSearchParams();
  const now = new Date();

  const year  = parseInt(params.get("year")  ?? now.getFullYear(),   10);
  const month = parseInt(params.get("month") ?? now.getMonth() + 1, 10);

  const [days, setDays]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const m = String(month).padStart(2, "0");
    fetch(`/api/days?year=${year}&month=${m}`)
      .then((r) => r.json())
      .then((data) => {
        const dayMap = Object.fromEntries(data.map((d) => [d.day, d]));
        setDays(allDaysForMonth(year, month, dayMap));
        setLoading(false);
      });
  }, [year, month]);

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
          marginBottom: 36,
          borderBottom: "1px solid #21262d",
          paddingBottom: 20,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
            Day Details
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#8b949e" }}>
            Per-day run history with article-level sort validation
          </p>
        </div>
        <Link
          href="/"
          style={{
            color: "#58a6ff",
            textDecoration: "none",
            fontSize: 14,
            border: "1px solid #30363d",
            padding: "6px 14px",
            borderRadius: 6,
          }}
        >
          ← Dashboard
        </Link>
      </header>

      <MonthPagination year={year} month={month} />

      {loading ? (
        <div style={{ color: "#8b949e", fontSize: 14 }}>Loading…</div>
      ) : (
        <div>
          {days.map((day) =>
            day.runCount === 0 ? (
              <div
                key={day.day}
                style={{
                  background: "#161b22",
                  border: "1px solid #30363d",
                  borderRadius: 8,
                  padding: "14px 18px",
                  marginBottom: 12,
                  fontSize: 14,
                  color: "#484f58",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <span style={{ minWidth: 110 }}>{day.day}</span>
                <span>No runs</span>
              </div>
            ) : (
              <DayCard key={day.day} day={day} />
            )
          )}
        </div>
      )}
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <main style={{ background: "#0d1117", minHeight: "100vh", padding: 40, color: "#8b949e" }}>
        Loading…
      </main>
    }>
      <DaysContent />
    </Suspense>
  );
}
