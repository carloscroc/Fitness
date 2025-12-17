const { chromium } = require('playwright');

async function run() {
  const url = process.argv[2] || 'http://localhost:3002';
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    console.log('Navigating to', url);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for exercise cards to render
    await page.waitForSelector('[data-testid="exercise-card"]', { timeout: 15000 });
    const cards = await page.$$('[data-testid="exercise-card"]');
    if (!cards || cards.length === 0) {
      console.log('No exercise cards found');
      await browser.close();
      process.exit(2);
    }

    // Click the first card
    console.log('Clicking first exercise card');
    await cards[0].click();

    // Wait for the modal video container
    await page.waitForSelector('[data-testid="video-container"]', { timeout: 10000 });

    // Inspect inside the video container
    const info = await page.$eval('[data-testid="video-container"]', (el) => {
      const iframe = el.querySelector('iframe');
      const video = el.querySelector('video');
      return {
        hasIframe: !!iframe,
        iframeSrc: iframe ? iframe.src : null,
        hasVideo: !!video,
        videoSrc: video ? video.currentSrc || video.src : null,
        videoPoster: video ? video.getAttribute('poster') : null
      };
    });

    console.log('Video container info:', JSON.stringify(info, null, 2));
    await browser.close();
    process.exit(0);
  } catch (e) {
    console.error('Error during check:', e);
    try { await browser.close(); } catch {}
    process.exit(3);
  }
}

run();
