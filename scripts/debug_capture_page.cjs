const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'tests/playwright/screenshots/page-initial.png', fullPage: true });
  const html = await page.content();
  await fs.promises.writeFile('tests/playwright/screenshots/page-initial.html', html, 'utf8');
  console.log('Captured screenshot and html');
  await browser.close();
})();