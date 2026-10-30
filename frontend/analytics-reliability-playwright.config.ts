import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', testMatch: 'analytics-reliability.spec.ts', workers: 1, retries: 0, reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:5214', serviceWorkers: 'block', viewport: { width: 390, height: 844 } },
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 5214 --strictPort', url: 'http://127.0.0.1:5214', reuseExistingServer: false },
});
