import { defineConfig, devices } from '@playwright/test';

const webPort = process.env.WEB_PORT ?? '3000';
const apiPort = process.env.API_PORT ?? '8000';
const baseURL = process.env.BASE_URL ?? `http://localhost:${webPort}`;

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
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        // Local: system Chrome. CI: Playwright Chromium (after `playwright install`).
        ...(process.env.CI || process.env.PLAYWRIGHT_CHROME_CHANNEL === '0'
          ? {}
          : { channel: 'chrome' as const }),
      },
    },
    {
      name: 'chromium-mobile',
      use: {
        ...devices['Pixel 7'],
        ...(process.env.CI || process.env.PLAYWRIGHT_CHROME_CHANNEL === '0'
          ? {}
          : { channel: 'chrome' as const }),
      },
    },
  ],
  webServer: [
    {
      command: 'pnpm --filter api start:dev',
      url: `http://localhost:${apiPort}/health`,
      reuseExistingServer: !process.env.CI,
      cwd: '../..',
      env: {
        ...process.env,
        PORT: apiPort,
        SESSION_SECRET: process.env.SESSION_SECRET ?? 'e2e-session-secret',
        OAUTH_TEST_MODE: 'true',
        GOOGLE_CALLBACK_URL:
          process.env.GOOGLE_CALLBACK_URL ??
          `http://localhost:${webPort}/api/auth/google/callback`,
        YANDEX_CALLBACK_URL:
          process.env.YANDEX_CALLBACK_URL ??
          `http://localhost:${webPort}/api/auth/yandex/callback`,
        WEB_URL: process.env.WEB_URL ?? `http://localhost:${webPort}`,
        E2E_THROTTLE_BYPASS: 'true',
      },
    },
    {
      command: `pnpm --filter web dev --port ${webPort}`,
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      cwd: '../..',
      env: {
        ...process.env,
        NEXT_PUBLIC_API_URL:
          process.env.NEXT_PUBLIC_API_URL ?? `http://localhost:${apiPort}`,
        E2E_THROTTLE_BYPASS: 'true',
      },
    },
  ],
});
