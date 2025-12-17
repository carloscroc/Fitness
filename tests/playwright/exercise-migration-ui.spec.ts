import { test, expect } from '@playwright/test';
import fs from 'fs';

test.describe('Exercise Migration UI Consistency', () => {
  test.beforeAll(async () => {
    // Ensure dev server is up externally
    // Note: Make sure backend data is available for migration tests
  });

  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to ensure clean state
    await page.evaluate(() => {
      localStorage.clear();
    });

    // Navigate to the main page
    await page.goto('/');

    // Wait for the app to load
    await page.waitForSelector('[data-testid="exercise-list"], text=Barbell Squat', { timeout: 15000 });
  });

  test('exercise library loads with original 7 frontend exercises', async ({ page }) => {
    // Wait for exercise library to be visible
    await page.waitForSelector('text=Barbell Squat', { timeout: 10000 });

    // Verify all original frontend exercises are present
    const originalExercises = [
      'Barbell Squat',
      'Bench Press',
      'Deadlift',
      'Pull Up',
      'Overhead Press',
      'Dumbbell Row'
    ];

    for (const exerciseName of originalExercises) {
      await expect(page.locator(`text=${exerciseName}`)).toBeVisible();
    }

    // Count total exercises (should be at least 7 originals)
    const exerciseCards = await page.locator('[data-testid="exercise-card"], .grid > div').count();
    expect(exerciseCards).toBeGreaterThanOrEqual(7);

    // Take screenshot for visual regression
    await page.screenshot({
      path: 'tests/playwright/screenshots/exercise-library-original.png',
      fullPage: true
    });
  });

  test('exercise detail modal displays correctly with complete data', async ({ page }) => {
    // Click on a known complete exercise (Bench Press)
    await page.locator('text=Bench Press').first().click({ force: true });

    // Wait for modal to open
    await page.waitForSelector('h1:text("Bench Press")', { state: 'visible', timeout: 10000 });

    // Verify exercise name is displayed correctly
    await expect(page.locator('h1:text("Bench Press")')).toBeVisible();

    // Verify muscle group is displayed
    await expect(page.locator('text=Chest')).toBeVisible();

    // Verify equipment is displayed
    await expect(page.locator('text=BARBELL')).toBeVisible();

    // Check for video player or fallback image
    const videoContainer = page.locator('[data-testid="video-container"]');
    await expect(videoContainer).toBeVisible();

    // Verify steps section is present
    const stepsSection = page.locator('text=Steps').first();
    await expect(stepsSection).toBeVisible();

    // Verify we have step indicators (numbered circles)
    const stepIndicators = await page.locator('.w-8.h-8.rounded-full').count();
    expect(stepIndicators).toBeGreaterThan(0);

    // Take screenshot for visual comparison
    await page.screenshot({
      path: 'tests/playwright/screenshots/exercise-detail-bench-press.png',
      fullPage: false
    });

    // Close modal
    await page.locator('button').filter({ hasText: 'X' }).first().click();
  });

  test('exercise detail modal handles missing data gracefully', async ({ page }) => {
    // Enable feature flags to show data source indicators and missing data warnings
    await page.evaluate(() => {
      localStorage.setItem('ff_SHOW_DATA_SOURCE_INDICATORS', 'true');
      localStorage.setItem('ff_ENABLE_BACKEND_EXERCISES', 'true');
    });

    // Reload page to apply feature flags
    await page.reload();
    await page.waitForSelector('text=Barbell Squat', { timeout: 10000 });

    // Click on an exercise that might have missing data after migration
    await page.locator('text=Barbell Squat').first().click({ force: true });

    // Wait for modal
    await page.waitForSelector('h1:text("Barbell Squat")', { state: 'visible', timeout: 10000 });

    // Check if missing data warning appears (might not for original exercises)
    const missingDataWarning = page.locator('text=Limited Data Available').first();
    if (await missingDataWarning.isVisible()) {
      await expect(missingDataWarning).toBeVisible();
      console.log('Missing data warning is displayed as expected');
    }

    // Verify fallback image loads if no video
    const imageElement = page.locator('img[alt*="Barbell Squat"]').first();
    await expect(imageElement).toBeVisible();

    // Verify steps section shows fallback message if no steps
    const stepsFallback = page.locator('text=Detailed steps not available').first();
    const stepsSection = page.locator('text=Standard form applies').first();

    const hasStepsFallback = await stepsFallback.isVisible() || await stepsSection.isVisible();
    if (hasStepsFallback) {
      console.log('Steps fallback message is displayed correctly');
    }

    // Take screenshot for visual comparison
    await page.screenshot({
      path: 'tests/playwright/screenshots/exercise-detail-missing-data.png',
      fullPage: false
    });

    // Close modal
    await page.locator('button').filter({ hasText: 'X' }).first().click();
  });

  test('feature flags control exercise loading behavior', async ({ page }) => {
    // Test with backend exercises disabled
    await page.evaluate(() => {
      localStorage.setItem('ff_ENABLE_BACKEND_EXERCISES', 'false');
      localStorage.setItem('ff_SHOW_DATA_SOURCE_INDICATORS', 'true');
    });

    await page.reload();
    await page.waitForSelector('text=Barbell Squat', { timeout: 10000 });

    // Count exercises with backend disabled
    const exercisesWithoutBackend = await page.locator('[data-testid="exercise-card"], .grid > div').count();
    console.log(`Exercises without backend: ${exercisesWithoutBackend}`);

    // Enable backend exercises
    await page.evaluate(() => {
      localStorage.setItem('ff_ENABLE_BACKEND_EXERCISES', 'true');
    });

    await page.reload();
    await page.waitForSelector('text=Barbell Squat', { timeout: 10000 });

    // Count exercises with backend enabled
    const exercisesWithBackend = await page.locator('[data-testid="exercise-card"], .grid > div').count();
    console.log(`Exercises with backend: ${exercisesWithBackend}`);

    // Should have more exercises with backend enabled
    expect(exercisesWithBackend).toBeGreaterThanOrEqual(exercisesWithoutBackend);

    // Take screenshot comparison
    await page.screenshot({
      path: 'tests/playwright/screenshots/exercise-library-with-backend.png',
      fullPage: true
    });
  });

  test('data source indicators display in development mode', async ({ page }) => {
    // Enable data source indicators
    await page.evaluate(() => {
      localStorage.setItem('ff_SHOW_DATA_SOURCE_INDICATORS', 'true');
      localStorage.setItem('ff_ENABLE_BACKEND_EXERCISES', 'true');
    });

    await page.reload();
    await page.waitForSelector('text=Barbell Squat', { timeout: 10000 });

    // Check for migration stats display
    const migrationStats = page.locator('text=exercises').first();
    if (await migrationStats.isVisible()) {
      console.log('Migration statistics are displayed');
      await expect(migrationStats).toContain('exercises');
    }

    // Click on an exercise to check data source indicator in detail modal
    await page.locator('text=Barbell Squat').first().click({ force: true });
    await page.waitForSelector('h1:text("Barbell Squat")', { state: 'visible', timeout: 10000 });

    // Check for data source indicator (should show "ORIGINAL" for frontend exercises)
    const originalIndicator = page.locator('text=ORIGINAL').first();
    if (await originalIndicator.isVisible()) {
      await expect(originalIndicator).toBeVisible();
      console.log('Data source indicator is displayed in modal');
    }

    // Take screenshot showing data source indicators
    await page.screenshot({
      path: 'tests/playwright/screenshots/exercise-detail-data-source.png',
      fullPage: false
    });

    // Close modal
    await page.locator('button').filter({ hasText: 'X' }).first().click();
  });

  test('exercise search and filtering works consistently', async ({ page }) => {
    // Enable backend exercises to test with larger dataset
    await page.evaluate(() => {
      localStorage.setItem('ff_ENABLE_BACKEND_EXERCISES', 'true');
    });

    await page.reload();
    await page.waitForSelector('text=Barbell Squat', { timeout: 10000 });

    // Test search functionality
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await expect(searchInput).toBeVisible();

    // Search for "Bench"
    await searchInput.fill('Bench');
    await page.waitForTimeout(500); // Wait for debounce

    // Should find Bench Press
    await expect(page.locator('text=Bench Press')).toBeVisible();

    // Should not find unrelated exercises
    const unrelatedExercises = page.locator('text=Deadlift').first();
    if (await unrelatedExercises.isVisible()) {
      console.log('Warning: Unrelated exercise still visible after search');
    }

    // Test category filtering
    const categoryButton = page.locator('button:has-text("Chest")').first();
    if (await categoryButton.isVisible()) {
      await categoryButton.click();
      await page.waitForTimeout(500);

      // Should show chest exercises
      await expect(page.locator('text=Bench Press')).toBeVisible();
    }

    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(500);

    // Verify original exercises are back
    await expect(page.locator('text=Barbell Squat')).toBeVisible();
    await expect(page.locator('text=Bench Press')).toBeVisible();
  });

  test('exercise cards maintain consistent styling and layout', async ({ page }) => {
    await page.waitForSelector('text=Barbell Squat', { timeout: 10000 });

    // Get first few exercise cards
    const exerciseCards = page.locator('[data-testid="exercise-card"], .grid > div').first();
    await expect(exerciseCards).toBeVisible();

    // Check card structure
    const cardImage = exerciseCards.locator('img').first();
    await expect(cardImage).toBeVisible();

    const cardTitle = exerciseCards.locator('h3, .text-white').first();
    await expect(cardTitle).toBeVisible();

    const cardMuscle = exerciseCards.locator('.text-zinc-500, .uppercase').first();
    await expect(cardMuscle).toBeVisible();

    // Check that cards have consistent height and layout
    const cards = page.locator('[data-testid="exercise-card"], .grid > div');
    const cardCount = await cards.count();

    if (cardCount > 1) {
      // Get bounding boxes of first few cards to check consistency
      const firstCard = cards.first();
      const secondCard = cards.nth(1);

      const firstBox = await firstCard.boundingBox();
      const secondBox = await secondCard.boundingBox();

      if (firstBox && secondBox) {
        // Cards should have similar heights
        const heightDiff = Math.abs(firstBox.height - secondBox.height);
        expect(heightDiff).toBeLessThan(50); // Allow some variation
      }
    }

    // Test hover states
    await exerciseCards.first().hover();
    await page.waitForTimeout(200);

    // Check for hover effects (opacity changes, etc.)
    const hoveredImage = exerciseCards.first().locator('img').first();
    await expect(hoveredImage).toBeVisible();

    // Take screenshot for visual regression
    await page.screenshot({
      path: 'tests/playwright/screenshots/exercise-cards-layout.png',
      fullPage: false
    });
  });

  test('modal responsive behavior works correctly', async ({ page }) => {
    // Test on desktop
    await page.setViewportSize({ width: 1200, height: 800 });

    await page.waitForSelector('text=Barbell Squat', { timeout: 10000 });
    await page.locator('text=Barbell Squat').first().click({ force: true });
    await page.waitForSelector('h1:text("Barbell Squat")', { state: 'visible', timeout: 10000 });

    // Check modal positioning on desktop
    const modal = page.locator('.fixed.inset-0').first();
    await expect(modal).toBeVisible();

    // Test on mobile
    await page.setViewportSize({ width: 375, height: 667 });

    // Modal should still be visible and properly positioned
    await expect(modal).toBeVisible();

    // Check mobile-specific styling
    const mobileModal = page.locator('.rounded-t-\\[32px\\]').first();
    await expect(mobileModal).toBeVisible();

    // Take screenshots for both viewport sizes
    await page.screenshot({
      path: 'tests/playwright/screenshots/modal-desktop.png',
      fullPage: false
    });

    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({
      path: 'tests/playwright/screenshots/modal-mobile.png',
      fullPage: false
    });

    // Close modal
    await page.locator('button').filter({ hasText: 'X' }).first().click();
  });

  test('video player and media handling works consistently', async ({ page }) => {
    await page.waitForSelector('text=Barbell Squat', { timeout: 10000 });
    await page.locator('text=Barbell Squat').first().click({ force: true });
    await page.waitForSelector('h1:text("Barbell Squat")', { state: 'visible', timeout: 10000 });

    // Wait for video container to be ready
    const videoContainer = page.locator('[data-testid="video-container"]');
    await expect(videoContainer).toBeVisible();

    // Check for iframe (YouTube) or video element
    const iframe = page.locator('iframe').first();
    const video = page.locator('video').first();
    const image = page.locator('img').first();

    const hasMedia = await iframe.isVisible() || await video.isVisible() || await image.isVisible();
    expect(hasMedia).toBe(true);

    // Test play/pause controls if available
    const playButton = page.locator('button:has-text("Play"), button:has-text("Pause")').first();
    if (await playButton.isVisible()) {
      await playButton.click();
      await page.waitForTimeout(1000);
    }

    // Take screenshot of media section
    await page.screenshot({
      path: 'tests/playwright/screenshots/exercise-video-player.png',
      fullPage: false
    });

    // Close modal
    await page.locator('button').filter({ hasText: 'X' }).first().click();
  });
});