async function scrapeHackerNews(page, target = 100, onProgress) {
  const articles = [];
  let url = 'https://news.ycombinator.com/newest';

  while (articles.length < target) {
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const articleLocator = page.locator('tr.athing');
    await articleLocator.first().waitFor();

    const pageArticles = await articleLocator.evaluateAll((rows) =>
      rows.map((row) => {
        const rankEl    = row.querySelector('.rank');
        const titleEl   = row.querySelector('.titleline > a');
        const ageEl     = row.nextElementSibling?.querySelector('.age');
        const ageAnchor = row.nextElementSibling?.querySelector('.age a');

        return {
          rank:        rankEl ? parseInt(rankEl.textContent.replace('.', ''), 10) : null,
          id:          row.id || null,
          title:       titleEl ? titleEl.textContent.trim() : null,
          url:         titleEl ? titleEl.href : null,
          timestamp:   ageEl ? ageEl.getAttribute('title') : null,
          relativeAge: ageAnchor ? ageAnchor.textContent.trim() : null,
        };
      })
    );

    articles.push(...pageArticles);

    if (onProgress) {
      onProgress(articles.length, url);
    }

    if (articles.length < target) {
      const moreLink = page.locator('a.morelink');
      if (!await moreLink.count()) break;
      await moreLink.waitFor();
      const href = await moreLink.getAttribute('href') ?? null;
      if (href) {
        url = href.startsWith('http') ? href : `https://news.ycombinator.com/${href}`;
      }
    }
  }

  return articles.slice(0, target);
}

async function takeScreenshot(page) {
  return page.screenshot({ type: 'png' });
}

module.exports = { scrapeHackerNews, takeScreenshot };
