import { test, expect } from '@playwright/test';

test.describe('Exercise video modal', () => {
  test.beforeAll(async () => {
    // ensure dev server is up externally (we start it from the runner)
  });

  test('opens Bench Press modal and shows iframe or video', async ({ page }) => {
    await page.goto('/');

    // Wait for the app to load and show the exercise list
    await page.waitForSelector('text=Bench Press', { timeout: 15000 });

    // Click the Bench Press item to open the modal
    await page.click('text=Bench Press');

    // Wait for modal title to appear
    await page.waitForSelector('h1:text("Bench Press")', { timeout: 10000 });

    // Wait briefly for media to mount
    await page.waitForTimeout(500);

    // Click the play button to toggle play (more reliable than container click)
    await page.click('[data-testid="play-toggle"]');

    // Assert the UI shows play state change via data-playing attribute
    const toggle = page.locator('[data-testid="play-toggle"]');
    await expect(toggle).toHaveAttribute('data-playing', 'true');

    // Additionally, if an iframe is present, ensure autoplay=1 is set
    const iframe = page.locator('iframe');
    if (await iframe.count() > 0) {
      const src = await iframe.getAttribute('src');
      expect(src).toContain('autoplay=1');
    }
  });
});
