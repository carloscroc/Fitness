import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/playwright',
  timeout: 60_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'tests/playwright/report' }]
  ],
  use: {
    headless: false, // Run with head: false for video debugging
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
    baseURL: 'http://localhost:3000',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    launchOptions: {
      args: [
        '--disable-web-security', // Help with CORS issues during testing
        '--disable-features=TranslateUI', // Reduce console noise
        '--disable-ipc-flooding-protection' // Allow more console messages
      ]
    }
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Enhanced viewport for better video testing
        viewport: { width: 1920, height: 1080 }
      }
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['iPhone 13'],
        viewport: { width: 390, height: 844 }
      }
    }
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    timeout: 120_000,
    reuseExistingServer: true,
    env: {
      PORT: '3000'
    }
  }
});
