import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', testMatch: ['shift8.spec.ts', 'shift8-release.spec.ts'], retries: 0, workers: 2, reporter: 'list', timeout: 60000,
  use: { baseURL: 'http://127.0.0.1:5208', serviceWorkers: 'block' },
  projects: [
    { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1440, height: 1000 } } },
    { name: 'phone', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: { command: 'VITE_SHIFT_ENABLED=true npm run dev -- --host 127.0.0.1 --port 5208 --strictPort', url: 'http://127.0.0.1:5208', reuseExistingServer: false },
});
