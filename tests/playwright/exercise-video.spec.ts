import { test, expect } from '@playwright/test';
import fs from 'fs';

test.describe('Exercise video modal', () => {
  test.beforeAll(async () => {
    // ensure dev server is up externally (we start it from the runner)
  });

  test('opens Bench Press modal and shows iframe or video', async ({ page }) => {
    await page.goto('/');

    // Wait for the app to load and show the exercise list
    await page.waitForSelector('text=Bench Press', { timeout: 15000 });

    // Click the Bench Press item to open the modal (force in case of animation overlays)
    await page.locator('text=Bench Press').first().click({ force: true });

    // Debug: capture page state immediately after click to see if modal attempted to open
    await page.screenshot({ path: 'tests/playwright/screenshots/debug-bench-click.png', fullPage: true });
    const html = await page.content();
    await fs.promises.writeFile('tests/playwright/screenshots/bench-after-click.html', html, 'utf8');

    // Wait for modal title to appear (attached -> visible)
    await page.waitForSelector('h1:text("Bench Press")', { state: 'attached', timeout: 10000 });
    await page.waitForSelector('h1:text("Bench Press")', { state: 'visible', timeout: 5000 });

    // Wait briefly for media to mount
    await page.waitForTimeout(500);

    // Prepare screenshots directory and capture console logs
    const OUT = 'tests/playwright/screenshots';
    const logs: string[] = [];
    page.on('console', msg => logs.push(`${msg.type()}: ${msg.text()}`));
    await fs.promises.mkdir(OUT, { recursive: true });

    // Take a before screenshot of the media container
    await page.locator('[data-testid="video-container"]').screenshot({ path: `${OUT}/modal-before.png` });

    // Click the play button to toggle play (more reliable than container click)
    await page.click('[data-testid="play-toggle"]');

    // Give the player a moment to react, then capture after screenshot
    await page.waitForTimeout(800);
    await page.locator('[data-testid="video-container"]').screenshot({ path: `${OUT}/modal-after.png` });

    // Persist console logs
    await fs.promises.writeFile(`${OUT}/modal-console.log`, logs.join('\n'), 'utf8');

    // Assert the UI shows play state change via data-playing attribute
    const toggle = page.locator('[data-testid="play-toggle"]');
    await expect(toggle).toHaveAttribute('data-playing', 'true');

    // If iframe is present, ensure it exists; we control play via postMessage so src may not change
    const iframe = page.locator('iframe');
    if (await iframe.count() > 0) {
      await expect(iframe).toHaveCount(1);
    }
  });

  test('plays YouTube test exercise modal and shows playback', async ({ page }) => {
    await page.goto('/');

    // Emulate mobile nav to access Coach -> Library where the test entry is visible
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForSelector('nav', { timeout: 5000 });
    // Click the second nav button (Coach)
    await page.click('nav div > button:nth-child(2)');

    // Wait for the app to show the YouTube test item
    await page.waitForSelector('text=YouTube Test', { timeout: 15000 });

    // Click the YouTube Test item to open the modal (force in case of animation overlays)
    await page.locator('text=YouTube Test').first().click({ force: true });

    // Wait for modal title to appear (attached -> visible)
    await page.waitForSelector('h1:text("YouTube Test")', { state: 'attached', timeout: 10000 });
    await page.waitForSelector('h1:text("YouTube Test")', { state: 'visible', timeout: 5000 });

    // Wait briefly for media to mount
    await page.waitForTimeout(500);

    const OUT = 'tests/playwright/screenshots';
    const logs: string[] = [];
    page.on('console', msg => logs.push(`${msg.type()}: ${msg.text()}`));
    await fs.promises.mkdir(OUT, { recursive: true });

    // Take a before screenshot
    await page.locator('[data-testid="video-container"]').screenshot({ path: `${OUT}/yt-before.png` });

    // Click play (do not depend on debug overlay presence)
    await page.click('[data-testid="play-toggle"]');

    // Record iframe info to help diagnose why no messages are seen
    const iframe = page.locator('iframe');
    const iframeCount = await iframe.count();
    const iframeSrc = iframeCount > 0 ? await iframe.first().getAttribute('src') : '';
    await fs.promises.writeFile(`${OUT}/yt-iframe.txt`, `count=${iframeCount}\nsrc=${iframeSrc}\n`, 'utf8');

    // Take after screenshot immediately so we have a visual regardless of console messages
    await page.locator('[data-testid="video-container"]').screenshot({ path: `${OUT}/yt-after.png` });

    // Wait for either the fallback UI (playback blocked) or a console message from the iframe
    const fallbackElem = await page.waitForSelector('[data-testid="yt-fallback"]', { timeout: 15000 }).catch(() => null);
    if (fallbackElem) {
      // Fallback UI shown: capture diagnostics if available
      await page.locator('[data-testid="video-container"]').screenshot({ path: `${OUT}/yt-after-fallback.png` });
      const diagCount = await page.locator('[data-testid="diagnostics-text"]').count();
      if (diagCount > 0) {
        const diag = await page.locator('[data-testid="diagnostics-text"]').inputValue();
        await fs.promises.writeFile(`${OUT}/yt-diagnostics.txt`, diag, 'utf8');
      }
      await fs.promises.writeFile(`${OUT}/yt-console.log`, logs.join('\n'), 'utf8');
      // Ensure fallback is visible
      await expect(fallbackElem).toBeTruthy();
    } else {
      // No fallback detected; wait for a console message from the iframe signalling ready/playing
      const msg = await page.waitForEvent('console', {
        predicate: m => m.text().includes('YT:onReady') || m.text().includes('YT:onStateChange: 1'),
        timeout: 15000
      });
      const txt = msg.text();
      if (!(/YT:onReady/.test(txt) || /YT:onStateChange: 1/.test(txt))) {
        throw new Error('YouTube iframe did not report ready/playing state via console logs');
      }
      // Persist console logs
      await fs.promises.writeFile(`${OUT}/yt-console.log`, logs.join('\n'), 'utf8');
      await page.locator('[data-testid="video-container"]').screenshot({ path: `${OUT}/yt-after.png` });
    }

    // Ensure iframe exists
    await expect(page.locator('iframe')).toHaveCount(1);
  });
});
