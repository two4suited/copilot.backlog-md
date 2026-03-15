import { defineConfig, devices } from '@playwright/test';

// Local config: Vite dev server is on 5174 (5173 is taken by Aspire dcpctrl)
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5174',
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      PLAYWRIGHT_BASE_URL: 'http://localhost:5174',
    },
  },
});
