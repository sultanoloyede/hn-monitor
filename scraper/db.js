const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function saveRun(articles, results, duration, screenshotUrl) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insert run row, get back the new run_id
    const runRes = await client.query(
      `INSERT INTO runs (duration_ms, article_count, violation_count, passed, screenshot_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [duration, results.totalArticles, results.violations.length, results.valid, screenshotUrl ?? null]
    );
    const runId = runRes.rows[0].id;

    // Build rank → sort_valid lookup from comparisons
    // comparisons: [{ fromRank, toRank, isValid }]
    // toRank is the article whose position is being validated
    const sortValidByRank = {};
    for (const cmp of results.comparisons) {
      sortValidByRank[cmp.toRank] = cmp.isValid;
    }

    // 2. Bulk insert articles
    for (const article of articles) {
      const hnTimestamp = article.timestamp
        ? new Date(article.timestamp.split(' ')[0] + 'Z')
        : null;
      // Rank 1 has no prior article to compare against — always valid
      const sortValid = article.rank === 1 ? true : (sortValidByRank[article.rank] ?? true);

      await client.query(
        `INSERT INTO articles (run_id, rank, hn_id, title, url, hn_timestamp, relative_age, sort_valid)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [runId, article.rank, article.id, article.title, article.url, hnTimestamp, article.relativeAge ?? '', sortValid]
      );
    }

    // 3. Insert violations (only if any exist)
    for (const v of results.violations) {
      await client.query(
        `INSERT INTO violations (run_id, from_rank, to_rank, from_title, to_title, from_ts, to_ts)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [runId, v.fromRank, v.toRank, v.fromTitle, v.toTitle, v.fromTs, v.toTs]
      );
    }

    await client.query('COMMIT');
    return runId;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('saveRun failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { saveRun };
