import { test, expect } from '@playwright/test';

// This test assumes the dev server is running at http://localhost:3000
// It opens the library, clicks the YouTube test exercise, clicks play and
// asserts that either the embedded player reports ready or a new YouTube window opens as a fallback.

test('embedded youtube plays or opens fallback', async ({ page, context }) => {
  await page.goto('http://localhost:3000/');

  // Wait for the coach/library grid and the test exercise to appear
  await page.getByText('YouTube Test').waitFor({ state: 'visible', timeout: 5000 });

  // Click the exercise card
  await page.getByText('YouTube Test').click();

  // Wait for modal's play button
  const play = page.getByTestId('play-toggle');
  await play.waitFor({ state: 'visible', timeout: 5000 });

  // Click play and ensure no popup opens automatically; then check for iframe readiness or our blocked-fallback UI
  await play.click();

  // The previous behavior opened a new tab automatically; ensure that does NOT happen
  const popup = await context.waitForEvent('page', { timeout: 2500 }).catch(() => null);
  // No automatic popup should be opened
  await expect(popup).toBeNull();

  // Either the iframe reports ready or the blocked fallback UI is shown
  const debug = page.locator('text=iframeReady: true').first();
  const fallback = page.locator('[data-testid="yt-fallback"]').first();
  const debugFound = await debug.waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false);
  const fallbackFound = await fallback.waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false);
  if (!debugFound && !fallbackFound) {
    throw new Error('Neither iframeReady nor fallback UI appeared after play click');
  }
});