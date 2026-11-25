import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end tests against a running dev server with the seed data loaded:
 *   npm run db:local   (separate terminal)
 *   npm run seed
 *   npm run test:e2e
 */
export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 90_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    locale: 'ar-YE',
  },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] }, testMatch: /desktop\..*\.spec\.ts/ },
  ],
  webServer: {
    command: 'npm run dev',
    reuseExistingServer: true,
    url: 'http://localhost:3000/ar',
    timeout: 180_000,
  },
})
