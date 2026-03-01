"use client";

import { useRouter } from "next/navigation";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export default function MonthPagination({ year, month }) {
  const router = useRouter();

  const now = new Date();
  const isCurrentMonth =
    year === now.getFullYear() && month === now.getMonth() + 1;

  function go(y, m) {
    router.push(`/days?year=${y}&month=${String(m).padStart(2, "0")}`);
  }

  function prev() {
    if (month === 1) go(year - 1, 12);
    else go(year, month - 1);
  }

  function next() {
    if (month === 12) go(year + 1, 1);
    else go(year, month + 1);
  }

  const btnStyle = (disabled) => ({
    background: disabled ? "#21262d" : "#21262d",
    color: disabled ? "#484f58" : "#f0f6fc",
    border: "1px solid #30363d",
    borderRadius: 6,
    padding: "6px 14px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 14,
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        marginBottom: 28,
      }}
    >
      <button style={btnStyle(false)} onClick={prev}>
        ← Prev
      </button>
      <span style={{ fontWeight: 700, fontSize: 18, minWidth: 160, textAlign: "center" }}>
        {MONTH_NAMES[month - 1]} {year}
      </span>
      <button style={btnStyle(isCurrentMonth)} onClick={next} disabled={isCurrentMonth}>
        Next →
      </button>
    </div>
  );
}
