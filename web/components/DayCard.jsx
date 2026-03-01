"use client";

import { useState } from "react";
import ArticlesTable from "./ArticlesTable";

function RunSection({ run }) {
  const [open, setOpen] = useState(false);
  const label = new Date(run.created_at).toUTCString();

  return (
    <div style={{ marginTop: 12 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          textAlign: "left",
          background: "#21262d",
          border: "1px solid #30363d",
          borderRadius: 6,
          padding: "8px 14px",
          color: "#f0f6fc",
          fontSize: 13,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>{label}</span>
        <span style={{ color: "#8b949e" }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div
          style={{
            border: "1px solid #30363d",
            borderTop: "none",
            borderBottomLeftRadius: 6,
            borderBottomRightRadius: 6,
            overflow: "hidden",
          }}
        >
          <ArticlesTable run={run} />
        </div>
      )}
    </div>
  );
}

export default function DayCard({ day }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [runs, setRuns] = useState(null);

  async function toggle() {
    if (expanded) {
      setExpanded(false);
      return;
    }
    if (runs) {
      setExpanded(true);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/days/${day.day}`);
    const data = await res.json();
    setRuns(data.runs);
    setLoading(false);
    setExpanded(true);
  }

  const passed = day.allPassed;
  const badgeStyle = {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
    background: passed ? "#166534" : "#7f1d1d",
    color: passed ? "#bbf7d0" : "#fecaca",
  };

  return (
    <div
      style={{
        background: "#161b22",
        border: "1px solid #30363d",
        borderRadius: 8,
        marginBottom: 12,
        overflow: "hidden",
      }}
    >
      {/* Card header — always visible, click to expand */}
      <div
        onClick={toggle}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 18px",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 14, minWidth: 110 }}>
          {day.day}
        </span>
        <span style={badgeStyle}>{passed ? "PASS" : "FAIL"}</span>
        <span style={{ fontSize: 13, color: "#8b949e" }}>
          {day.runCount} run{day.runCount !== 1 ? "s" : ""}
        </span>
        {day.totalViolations > 0 && (
          <span style={{ fontSize: 13, color: "#f85149" }}>
            {day.totalViolations} violation{day.totalViolations !== 1 ? "s" : ""}
          </span>
        )}
        <span style={{ marginLeft: "auto", color: "#8b949e", fontSize: 13 }}>
          {expanded ? "▲" : "▼"}
        </span>
      </div>

      {/* Expanded content */}
      {loading && (
        <div
          style={{
            padding: "20px 18px",
            color: "#8b949e",
            fontSize: 13,
            borderTop: "1px solid #21262d",
          }}
        >
          Loading…
        </div>
      )}

      {expanded && runs && (
        <div
          style={{
            padding: "0 18px 18px",
            borderTop: "1px solid #21262d",
          }}
        >
          {runs.map((run) => (
            <RunSection key={run.id} run={run} />
          ))}
        </div>
      )}
    </div>
  );
}
