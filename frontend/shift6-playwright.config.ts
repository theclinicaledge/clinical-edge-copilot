import { defineConfig } from '@playwright/test';
import { readFileSync } from 'node:fs';
const baseURL = process.env.CE_TEST_BASE_URL || 'http://127.0.0.1:5196';
const consent = JSON.parse(readFileSync(new URL('./tests/fixtures/consented-storage.json', import.meta.url), 'utf8'));
consent.origins = consent.origins.map(origin => ({ ...origin, origin: baseURL, localStorage: [
  ...origin.localStorage.map(item => item.name === 'ce_consent' ? { ...item, value: JSON.stringify({ ...JSON.parse(item.value), analytics: false }) } : item),
  { name: 'ce_product_analytics_exclude', value: '1' },
] }));
export default defineConfig({
  testDir: './tests', testMatch: 'shift6.spec.ts', retries: 0, workers: 2, reporter: 'list',
  use: { baseURL, storageState: consent, serviceWorkers: 'block' },
  projects: [
    { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1440, height: 1000 } } },
    { name: 'phone', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
