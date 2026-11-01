import { defineConfig } from '@playwright/test';

process.env.CE_PUBLIC_BETA_UI_TEST = 'true';
export default defineConfig({
  testDir: './tests',
  testMatch: ['ask-reading.spec.ts', 'ask-answer-navigation.spec.ts'],
  workers: 1, retries: 0, reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5216',
    serviceWorkers: 'block',
    storageState: { cookies: [], origins: [{ origin: 'http://127.0.0.1:5216', localStorage: [
      { name: 'ce_consent', value: JSON.stringify({ version: 4, ai: true, analytics: false, decidedAt: '2026-10-31T00:00:00.000Z' }) },
    ] }] },
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5216 --strictPort',
    env: { VITE_ASK_PUBLIC_BETA_ENABLED: 'true' },
    url: 'http://127.0.0.1:5216', reuseExistingServer: !process.env.CI,
  },
});
