import { defineConfig, devices } from '@playwright/test';
import { readFileSync } from 'node:fs';
const baseURL = process.env.CE_TEST_BASE_URL || 'http://127.0.0.1:5190';
const consent = JSON.parse(readFileSync(new URL('./tests/fixtures/consented-storage.json', import.meta.url), 'utf8'));
consent.origins = consent.origins.map(origin => ({ ...origin, origin: baseURL }));
export default defineConfig({ testDir: './tests', fullyParallel: true, retries: 0, workers: 3, reporter: 'list',
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  use: { baseURL, storageState: consent, serviceWorkers: 'block' },
});
