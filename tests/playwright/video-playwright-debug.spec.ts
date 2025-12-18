import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Video Playback Debug Analysis', () => {
  const OUTPUT_DIR = 'tests/playwright/screenshots/video-debug';

  test.beforeAll(async () => {
    // Ensure output directory exists
    await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });
  });

  test.beforeEach(async ({ page }) => {
    // Set up comprehensive monitoring
    const logs: string[] = [];
    const networkRequests: any[] = [];

    page.on('console', msg => {
      const logEntry = `${msg.type()}: ${msg.text()}`;
      logs.push(logEntry);
      console.log('Browser Console:', logEntry);
    });

    page.on('request', request => {
      if (request.url().includes('youtube') || request.url().includes('googlevideo')) {
        networkRequests.push({
          type: 'request',
          url: request.url(),
          method: request.method(),
          timestamp: Date.now()
        });
      }
    });

    page.on('response', response => {
      if (response.url().includes('youtube') || response.url().includes('googlevideo')) {
        networkRequests.push({
          type: 'response',
          url: response.url(),
          status: response.status(),
          timestamp: Date.now()
        });
      }
    });

    // Store for test analysis
    (page as any).__testLogs = logs;
    (page as any).__networkRequests = networkRequests;
  });

  test('comprehensive YouTube video playback analysis', async ({ page }) => {
    console.log('🎬 Starting comprehensive video playback analysis...');

    // Navigate to the app
    await page.goto('/', { waitUntil: 'networkidle' });

    // Enable video debug mode after page loads
    try {
      await page.evaluate(() => {
        localStorage.setItem('video-debug', 'true');
      });
    } catch (e) {
      console.log('⚠️ Could not set localStorage debug mode, continuing...');
    }

    // Wait for initial app load
    await page.waitForSelector('[data-testid="app-container"]', { timeout: 15000 }).catch(() =>
      page.waitForSelector('main', { timeout: 15000 }).catch(() =>
        page.waitForSelector('body > *', { timeout: 15000 })
      )
    );
    await page.waitForTimeout(3000); // Allow components to fully initialize

    // Take initial screenshot
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '01-initial-load.png'),
      fullPage: true
    });

    // Navigate to Coach -> Library to find YouTube Test exercise
    console.log('📱 Navigating to Coach -> Library...');
    await page.setViewportSize({ width: 390, height: 844 });

    // Wait for mobile nav to be visible, then click second button
    await page.waitForSelector('nav', { state: 'visible', timeout: 5000 });
    await page.click('nav div > button:nth-child(2)');
    await page.waitForTimeout(2000);

    // Look for YouTube Test exercise
    console.log('🔍 Searching for YouTube Test exercise...');
    await page.waitForSelector('text=YouTube Test', { timeout: 15000 });

    // Take screenshot of exercise list
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '02-exercise-list.png'),
      fullPage: true
    });

    // Click YouTube Test exercise
    console.log('🖱️ Clicking YouTube Test exercise...');
    await page.locator('text=YouTube Test').first().click({ force: true });

    // Wait for modal to open
    await page.waitForSelector('h1:text("YouTube Test")', {
      state: 'visible',
      timeout: 10000
    });

    await page.waitForTimeout(2000); // Allow modal animation and iframe to load

    // Take modal screenshot
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '03-modal-opened.png'),
      fullPage: true
    });

    // Get current page content for analysis
    const pageContent = await page.content();
    await fs.promises.writeFile(
      path.join(OUTPUT_DIR, '04-modal-content.html'),
      pageContent,
      'utf8'
    );

    // Analyze iframe state
    console.log('🎥 Analyzing iframe state...');
    const iframe = page.locator('iframe');
    const iframeCount = await iframe.count();

    let iframeAnalysis: any = {
      count: iframeCount,
      src: '',
      width: 0,
      height: 0,
      loaded: false,
      visible: false
    };

    if (iframeCount > 0) {
      const firstIframe = iframe.first();
      iframeAnalysis.src = await firstIframe.getAttribute('src') || '';
      iframeAnalysis.width = await firstIframe.getAttribute('width') || 0;
      iframeAnalysis.height = await firstIframe.getAttribute('height') || 0;

      // Check if iframe is loaded and visible
      try {
        await firstIframe.waitForElementState('visible', { timeout: 5000 });
        iframeAnalysis.loaded = true;
        iframeAnalysis.visible = true;
      } catch (e) {
        iframeAnalysis.loaded = false;
        iframeAnalysis.visible = false;
      }
    }

    console.log('📊 iframe analysis:', iframeAnalysis);
    await fs.promises.writeFile(
      path.join(OUTPUT_DIR, '05-iframe-analysis.json'),
      JSON.stringify(iframeAnalysis, null, 2),
      'utf8'
    );

    // Check debug overlay information
    console.log('🐛 Checking debug overlay...');
    const debugOverlay = page.locator('[data-testid="video-debug"]');
    const debugExists = await debugOverlay.count() > 0;

    let debugInfo = '';
    if (debugExists) {
      debugInfo = await debugOverlay.textContent() || '';
      console.log('Debug overlay info:', debugInfo);
      await fs.promises.writeFile(
        path.join(OUTPUT_DIR, '06-debug-overlay.txt'),
        debugInfo,
        'utf8'
      );
    }

    // Look for play button with multiple selectors
    console.log('▶️ Locating play button...');
    let playButton = page.locator('[data-testid="play-toggle"]');
    let playButtonExists = await playButton.count() > 0;

    if (!playButtonExists) {
      console.log('❌ Primary play button not found! Looking for alternative selectors...');
      // Try alternative selectors
      const altSelectors = [
        'button[aria-label*="play"]',
        'button[aria-label*="Play"]',
        '.play-button',
        '[class*="play"]',
        'button:has-text("Play")',
        '[data-testid*="play"]'
      ];

      for (const selector of altSelectors) {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          console.log(`✅ Found play button with selector: ${selector}`);
          playButton = element;
          playButtonExists = true;
          break;
        }
      }

      // Last resort: look for any button in the video container
      if (!playButtonExists) {
        const videoContainer = page.locator('[data-testid="video-container"]');
        if (await videoContainer.count() > 0) {
          const buttonsInContainer = videoContainer.locator('button');
          if (await buttonsInContainer.count() > 0) {
            console.log('✅ Found button in video container');
            playButton = buttonsInContainer.first();
            playButtonExists = true;
          }
        }
      }
    } else {
      console.log('✅ Primary play button found!');
    }

    if (playButtonExists) {
      // Check play button state
      const playingState = await playButton.getAttribute('data-playing');
      console.log('Play button state:', playingState);

      // Take screenshot before clicking
      await page.locator('[data-testid="video-container"]').screenshot({
        path: path.join(OUTPUT_DIR, '07-before-play-click.png')
      });
    }

    // Click play button or video container
    console.log('🖱️ Attempting to start playback...');
    try {
      if (playButtonExists) {
        await playButton.click({ timeout: 5000 });
        console.log('✅ Clicked play button');
      } else {
        // Click on the video container as fallback
        await page.locator('[data-testid="video-container"]').click();
        console.log('✅ Clicked video container');
      }
    } catch (e) {
      console.log('❌ Failed to click play button:', e);
      // Try clicking anywhere in the modal
      await page.click('h1:text("YouTube Test")');
      console.log('✅ Clicked modal title as fallback');
    }

    // Wait and observe behavior
    console.log('⏳ Observing playback behavior...');

    // Take multiple screenshots to track changes
    for (let i = 0; i < 8; i++) {
      await page.waitForTimeout(1000);
      try {
        await page.locator('[data-testid="video-container"]').screenshot({
          path: path.join(OUTPUT_DIR, `08-playback-${i + 1}s.png`)
        });
      } catch (e) {
        console.log(`⚠️ Could not take screenshot at ${i + 1}s`);
      }
    }

    // Check for fallback UI
    console.log('🔄 Checking for fallback UI...');
    const fallbackUI = page.locator('[data-testid="yt-fallback"]');
    const fallbackExists = await fallbackUI.count() > 0;

    if (fallbackExists) {
      console.log('✅ Fallback UI detected');
      try {
        await fallbackUI.screenshot({
          path: path.join(OUTPUT_DIR, '09-fallback-ui.png')
        });

        // Check for diagnostics
        const diagnostics = page.locator('[data-testid="diagnostics-text"]');
        if (await diagnostics.count() > 0) {
          const diagnosticsText = await diagnostics.inputValue();
          await fs.promises.writeFile(
            path.join(OUTPUT_DIR, '10-diagnostics.txt'),
            diagnosticsText,
            'utf8'
          );
          console.log('🩺 Diagnostics:', diagnosticsText);
        }
      } catch (e) {
        console.log('⚠️ Could not capture fallback UI');
      }
    }

    // Check for any new windows/tabs opened
    const pages = page.context().pages();
    if (pages.length > 1) {
      console.log(`🪟 New tab opened! Total tabs: ${pages.length}`);
      const newTab = pages[pages.length - 1];
      const newTabUrl = newTab.url();
      console.log('New tab URL:', newTabUrl);
      await fs.promises.writeFile(
        path.join(OUTPUT_DIR, '11-new-tab-url.txt'),
        newTabUrl,
        'utf8'
      );
    }

    // Check final play button state
    let finalPlayingState = null;
    if (playButtonExists) {
      finalPlayingState = await playButton.getAttribute('data-playing');
      console.log('Final play button state:', finalPlayingState);
    }

    // Get all console logs and network requests
    const allLogs = (page as any).__testLogs || [];
    const allNetworkRequests = (page as any).__networkRequests || [];

    // Save comprehensive debug report
    const debugReport = {
      timestamp: new Date().toISOString(),
      iframeAnalysis,
      debugOverlay: {
        exists: debugExists,
        info: debugInfo
      },
      playButton: {
        exists: playButtonExists,
        initialState: null,
        finalState: finalPlayingState
      },
      fallbackUI: {
        exists: fallbackExists
      },
      newTabsOpened: pages.length > 1,
      newTabUrl: pages.length > 1 ? pages[pages.length - 1].url() : null,
      consoleLogs: allLogs,
      networkRequests: allNetworkRequests,
      testDuration: Date.now() + 'ms'
    };

    await fs.promises.writeFile(
      path.join(OUTPUT_DIR, '12-comprehensive-debug-report.json'),
      JSON.stringify(debugReport, null, 2),
      'utf8'
    );

    // Save console logs separately for easier reading
    await fs.promises.writeFile(
      path.join(OUTPUT_DIR, '13-console-logs.txt'),
      allLogs.join('\n'),
      'utf8'
    );

    console.log('📋 Comprehensive debug analysis complete!');
    console.log(`📁 Debug files saved to: ${OUTPUT_DIR}`);

    // Take final screenshot
    await page.screenshot({
      path: path.join(OUTPUT_DIR, '14-final-state.png'),
      fullPage: true
    });
  });

  test('run existing video tests for comparison', async ({ page }) => {
    console.log('🔄 Running existing video test patterns for comparison...');

    // Enable debug mode
    await page.goto('/', { waitUntil: 'networkidle' });
    try {
      await page.evaluate(() => {
        localStorage.setItem('video-debug', 'true');
      });
    } catch (e) {
      // Continue without debug mode
    }

    // Test the YouTube Test exercise with the existing pattern
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForSelector('nav', { state: 'visible', timeout: 5000 });
    await page.click('nav div > button:nth-child(2)');
    await page.waitForSelector('text=YouTube Test', { timeout: 15000 });
    await page.locator('text=YouTube Test').first().click({ force: true });

    // Wait for modal and iframe
    await page.waitForSelector('h1:text("YouTube Test")', { state: 'visible', timeout: 10000 });
    await page.waitForTimeout(500);

    const iframe = page.locator('iframe');
    const iframeCount = await iframe.count();

    console.log(`Found ${iframeCount} iframes in modal`);

    if (iframeCount > 0) {
      const iframeSrc = await iframe.first().getAttribute('src');
      console.log('Iframe src:', iframeSrc);

      // Check if it's a YouTube embed
      if (iframeSrc && iframeSrc.includes('youtube.com/embed/')) {
        const videoId = iframeSrc.match(/youtube\.com\/embed\/([^?]+)/)?.[1];
        console.log('Extracted YouTube video ID:', videoId);

        await fs.promises.writeFile(
          path.join(OUTPUT_DIR, '15-youtube-video-analysis.txt'),
          `Video ID: ${videoId}\nFull src: ${iframeSrc}\n`,
          'utf8'
        );
      }
    }

    // Try clicking play button
    const playToggle = page.locator('[data-testid="play-toggle"]');
    if (await playToggle.count() > 0) {
      await playToggle.click();
      await page.waitForTimeout(3000);

      const playingState = await playToggle.getAttribute('data-playing');
      console.log('Playing state after click:', playingState);
    }
  });
});