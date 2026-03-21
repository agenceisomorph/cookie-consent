import { defineConfig, devices } from '@playwright/test';

/**
 * Config Playwright — @isomorph/cookie-consent
 * Tests E2E sur l'app fixture locale (tests/e2e/fixture/).
 */
export default defineConfig({
  testDir: '../../tests/e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  use: {
    baseURL: 'http://localhost:3099',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev --prefix tests/e2e/fixture',
    port: 3099,
    reuseExistingServer: !process.env.CI,
  },
});
