import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/playwright',
  timeout: 60_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  reporter: [['list']],
  use: {
    headless: true,
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
    baseURL: 'http://localhost:3001'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ]
  ,
  webServer: {
    command: 'npm run dev',
    port: 3001,
    timeout: 120_000,
    reuseExistingServer: true,
    env: {
      PORT: '3001'
    }
  }
});
