async function scrapeHackerNews(page, target = 100, onProgress) {
  const articles = [];
  let url = 'https://news.ycombinator.com/newest';

  while (articles.length < target) {
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const pageArticles = await page.$$eval('.athing', (rows) =>
      rows.map((row) => {
        const rankEl = row.querySelector('.rank');
        const titleEl = row.querySelector('.titleline > a');
        const ageEl = row.querySelector('.age');
        const ageAnchor = row.querySelector('.age a');

        return {
          rank: rankEl ? parseInt(rankEl.textContent.replace('.', ''), 10) : null,
          id: row.id || null,
          title: titleEl ? titleEl.textContent.trim() : null,
          url: titleEl ? titleEl.href : null,
          timestamp: ageEl ? ageEl.getAttribute('title') : null,
          relativeAge: ageAnchor ? ageAnchor.textContent.trim() : null,
        };
      })
    );

    articles.push(...pageArticles);

    if (onProgress) {
      onProgress(articles.length, url);
    }

    if (articles.length < target) {
      const moreHref = await page.$eval('a.morelink', (el) => el.href).catch(() => null);
      if (!moreHref) break;
      url = moreHref;
    }
  }

  return articles.slice(0, target);
}

async function takeScreenshot(page) {
  return page.screenshot({ type: 'png' });
}

module.exports = { scrapeHackerNews, takeScreenshot };
