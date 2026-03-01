"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const CELL = 11;   // cell size px
const GAP  = 2;    // gap px
const STEP = CELL + GAP;

const DOW_LABELS    = ["Mon", "", "Wed", "", "Fri", "", "Sun"];
const MONTH_LABELS  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function ContributionGrid({ year, data }) {
  const router  = useRouter();
  const [tip, setTip] = useState(null);

  // date → entry lookup
  const dataMap = Object.fromEntries(data.map((d) => [d.day, d]));

  // Build week grid
  const jan1     = new Date(Date.UTC(year, 0, 1));
  const startDow = (jan1.getUTCDay() + 6) % 7;               // Mon=0 … Sun=6
  const isLeap   = new Date(year, 1, 29).getDate() === 29;
  const totalDays = isLeap ? 366 : 365;
  const numWeeks  = Math.ceil((startDow + totalDays) / 7);

  const weeks = Array.from({ length: numWeeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const i = w * 7 + d - startDow;
      if (i < 0 || i >= totalDays) return null;
      const date = new Date(Date.UTC(year, 0, 1 + i)).toISOString().slice(0, 10);
      return { date, entry: dataMap[date] ?? null };
    })
  );

  // Month label positions (left px = weekIndex * STEP)
  const monthPositions = MONTH_LABELS.map((name, m) => {
    const dayIndex = Math.round(
      (new Date(Date.UTC(year, m, 1)) - jan1) / 86400000
    );
    const weekIdx = Math.floor((dayIndex + startDow) / 7);
    return { name, left: weekIdx * STEP };
  });

  const cellColor = (cell) => {
    if (!cell)        return "transparent";
    if (!cell.entry)  return "#21262d";
    return cell.entry.passed ? "#26a641" : "#da3633";
  };

  return (
    <div style={{ position: "relative", fontFamily: "monospace", overflowX: "auto" }}>
      {/* Floating tooltip */}
      {tip && (
        <div
          style={{
            position: "fixed",
            left: tip.x + 14,
            top:  tip.y - 38,
            background: "#1f2937",
            color: "#f9fafb",
            padding: "4px 10px",
            borderRadius: 4,
            fontSize: 12,
            pointerEvents: "none",
            zIndex: 100,
            whiteSpace: "nowrap",
            border: "1px solid #374151",
          }}
        >
          {tip.text}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        {/* Day-of-week labels */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: GAP,
            paddingTop: 22,
            width: 28,
            flexShrink: 0,
          }}
        >
          {DOW_LABELS.map((label, i) => (
            <div
              key={i}
              style={{
                height: CELL,
                fontSize: 10,
                color: "#8b949e",
                lineHeight: `${CELL}px`,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        <div>
          {/* Month labels */}
          <div style={{ position: "relative", height: 20, marginBottom: 2 }}>
            {monthPositions.map(({ name, left }) => (
              <span
                key={name}
                style={{
                  position: "absolute",
                  left,
                  fontSize: 11,
                  color: "#8b949e",
                }}
              >
                {name}
              </span>
            ))}
          </div>

          {/* Week columns */}
          <div style={{ display: "flex", gap: GAP }}>
            {weeks.map((week, wi) => (
              <div key={wi} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
                {week.map((cell, di) => (
                  <div
                    key={di}
                    style={{
                      width: CELL,
                      height: CELL,
                      borderRadius: 2,
                      background: cellColor(cell),
                      cursor: cell ? "pointer" : "default",
                    }}
                    onMouseEnter={(e) => {
                      if (!cell) return;
                      const label = cell.entry
                        ? `${cell.date} — ${cell.entry.passed ? "✓ Pass" : "✗ Fail"}`
                        : `${cell.date} — No runs`;
                      setTip({ text: label, x: e.clientX, y: e.clientY });
                    }}
                    onMouseLeave={() => setTip(null)}
                    onClick={() => {
                      if (!cell) return;
                      const [y, m] = cell.date.split("-");
                      router.push(`/days?year=${y}&month=${m}`);
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
