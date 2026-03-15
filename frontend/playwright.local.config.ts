import { defineConfig, devices } from '@playwright/test';

// When running under Aspire, the Vite dev server port is assigned dynamically
// and injected as the PORT env var by AddViteApp. Pass it via APP_URL:
//   APP_URL=http://localhost:<port> npx playwright test --config playwright.local.config.ts
//
// To find the current port: lsof -i TCP -P -n | grep LISTEN | grep node
// Or check the Aspire dashboard resource endpoints.
const baseURL = process.env.APP_URL ?? 'http://localhost:51127';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'echo "Aspire manages the dev server"',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
