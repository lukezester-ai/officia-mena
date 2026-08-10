import { defineConfig, devices } from '@playwright/test';
import fs from 'node:fs';

const authState = process.env.PLAYWRIGHT_AUTH_STATE;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'public-chromium', use: { ...devices['Desktop Chrome'] }, testIgnore: /authenticated/ },
    {
      name: 'authenticated-chromium',
      use: { ...devices['Desktop Chrome'], storageState: authState && fs.existsSync(authState) ? authState : undefined },
      testMatch: /authenticated/,
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
