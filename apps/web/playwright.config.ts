import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Local: system Chrome. CI: Playwright Chromium (after `playwright install`).
        ...(process.env.CI || process.env.PLAYWRIGHT_CHROME_CHANNEL === '0'
          ? {}
          : { channel: 'chrome' as const }),
      },
    },
  ],
  webServer: [
    {
      command: 'pnpm --filter api start:dev',
      url: 'http://localhost:8000/health',
      reuseExistingServer: !process.env.CI,
      cwd: '../..',
      env: {
        ...process.env,
        SESSION_SECRET: process.env.SESSION_SECRET ?? 'e2e-session-secret',
      },
    },
    {
      command: 'pnpm --filter web dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      cwd: '../..',
    },
  ],
});
