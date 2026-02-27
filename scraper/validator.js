function parseTimestamp(raw) {
  // format: "2026-02-23T21:22:19 1771881739"
  // take the ISO part before the space and append Z for UTC
  const iso = raw.split(' ')[0] + 'Z';
  return new Date(iso);
}

function validateSortOrder(articles) {
  const violations = [];
  const comparisons = [];

  for (let i = 0; i < articles.length - 1; i++) {
    const a = articles[i];
    const b = articles[i + 1];

    if (!a.timestamp || !b.timestamp) continue;

    const tsA = parseTimestamp(a.timestamp);
    const tsB = parseTimestamp(b.timestamp);
    const isValid = tsA >= tsB;

    comparisons.push({ fromRank: a.rank, toRank: b.rank, isValid });

    if (!isValid) {
      violations.push({
        fromRank: a.rank,
        toRank: b.rank,
        fromTitle: a.title,
        toTitle: b.title,
        fromTs: tsA,
        toTs: tsB,
      });
    }
  }

  return {
    valid: violations.length === 0,
    totalArticles: articles.length,
    totalComparisons: comparisons.length,
    violations,
    comparisons,
  };
}

module.exports = { validateSortOrder };
