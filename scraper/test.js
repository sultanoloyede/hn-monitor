require('dotenv').config({ path: '../.env' });
const { chromium } = require('playwright');
const { scrapeHackerNews } = require('./scraper');
const { validateSortOrder } = require('./validator');
const { saveRun } = require('./db');

(async () => {
  const start = Date.now();
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext()).newPage();
  const articles = await scrapeHackerNews(page, 100);
  await browser.close();
  const results = validateSortOrder(articles);
  const duration = Date.now() - start;

  console.log(`Articles: ${articles.length}`);
  console.log(`Passed:   ${results.valid}`);
  console.log(`Violations: ${results.violations.length}`);

  const runId = await saveRun(articles, results, duration, null);
  console.log(`Run ID:   ${runId}`);

  process.exit(results.valid ? 0 : 1);
})();
