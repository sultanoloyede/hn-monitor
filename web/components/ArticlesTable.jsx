export default function ArticlesTable({ run }) {
  const thStyle = {
    padding: "8px 12px",
    textAlign: "left",
    fontSize: 12,
    color: "#8b949e",
    fontWeight: 600,
    borderBottom: "1px solid #30363d",
    whiteSpace: "nowrap",
  };

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 13,
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>#</th>
              <th style={thStyle}>Sort</th>
              <th style={{ ...thStyle, width: "50%" }}>Title</th>
              <th style={thStyle}>Timestamp (UTC)</th>
              <th style={thStyle}>Age</th>
            </tr>
          </thead>
          <tbody>
            {run.articles.map((a) => {
              const isFirst = a.rank === 1;
              const rowBg = !a.sort_valid && !isFirst ? "#2d0d0d" : "transparent";
              const sortCell = isFirst ? "—" : a.sort_valid ? (
                <span style={{ color: "#3fb950" }}>✓</span>
              ) : (
                <span style={{ color: "#f85149" }}>✗</span>
              );

              return (
                <tr key={a.rank} style={{ background: rowBg }}>
                  <td
                    style={{
                      padding: "6px 12px",
                      color: "#8b949e",
                      borderBottom: "1px solid #21262d",
                    }}
                  >
                    {a.rank}
                  </td>
                  <td
                    style={{
                      padding: "6px 12px",
                      textAlign: "center",
                      borderBottom: "1px solid #21262d",
                    }}
                  >
                    {sortCell}
                  </td>
                  <td
                    style={{
                      padding: "6px 12px",
                      borderBottom: "1px solid #21262d",
                      maxWidth: 480,
                    }}
                  >
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#f0f6fc", textDecoration: "none" }}
                    >
                      {a.title}
                    </a>
                  </td>
                  <td
                    style={{
                      padding: "6px 12px",
                      color: "#8b949e",
                      borderBottom: "1px solid #21262d",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {a.hn_timestamp
                      ? new Date(a.hn_timestamp).toUTCString()
                      : "—"}
                  </td>
                  <td
                    style={{
                      padding: "6px 12px",
                      color: "#8b949e",
                      borderBottom: "1px solid #21262d",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {a.relative_age}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {run.screenshot_url && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 12, color: "#8b949e", marginBottom: 8 }}>
            Screenshot at time of violation:
          </p>
          <img
            src={run.screenshot_url}
            alt="Screenshot at time of violation"
            style={{ maxWidth: "100%", borderRadius: 6, border: "1px solid #30363d" }}
          />
        </div>
      )}
    </div>
  );
}
