require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const { chromium } = require('playwright');
const { scrapeHackerNews, takeScreenshot } = require('./scraper');
const { validateSortOrder } = require('./validator');
const { uploadScreenshot } = require('./storage');
const { saveRun } = require('./db');

async function validateHackerNews() {
  const start = Date.now();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Scraping HN/newest...');
  const articles = await scrapeHackerNews(page, 100, (count, url) => {
    console.log(`  ${count} articles collected (page: ${url})`);
  });
  console.log(`✓ ${articles.length} articles collected`);

  const results = validateSortOrder(articles);
  const duration = Date.now() - start;

  console.log(`\nResult: ${results.valid ? 'PASS' : 'FAIL'}`);
  console.log(`Violations: ${results.violations.length}`);

  let screenshotUrl = null;

  if (!results.valid) {
    const buffer = await takeScreenshot(page);
    screenshotUrl = await uploadScreenshot(buffer, new Date());
    console.log(`Screenshot: ${screenshotUrl}`);

    const violationRows = results.violations
      .map(v => `| #${v.fromRank} "${v.fromTitle}" | #${v.toRank} "${v.toTitle}" | ${v.fromTs.toISOString()} | ${v.toTs.toISOString()} |`)
      .join('\n');

    const report = `## HN Sort Violation Detected

**Time:** ${new Date().toUTCString()}
**Articles checked:** ${results.totalArticles}
**Violations found:** ${results.violations.length}
**Screenshot:** ${screenshotUrl}

### Violations

| From | To | From Timestamp | To Timestamp |
|------|----|----------------|--------------|
${violationRows}
`;
    fs.writeFileSync('violation-report.md', report);
    console.log('violation-report.md written');
  }

  await browser.close();

  const runId = await saveRun(articles, results, duration, screenshotUrl);
  console.log(`\nRun ID: ${runId}`);

  // TEMP: force violation for checkpoint 8 testing — revert after
  if (!screenshotUrl) {
    const report = `## HN Sort Violation Detected\n\n**Time:** ${new Date().toUTCString()}\n**Articles checked:** ${results.totalArticles}\n**Violations found:** 0 (forced for CI test)\n**Screenshot:** none\n`;
    fs.writeFileSync('violation-report.md', report);
  }
  process.exit(1); // TEMP: force failure
}

(async () => {
  await validateHackerNews();
})();
