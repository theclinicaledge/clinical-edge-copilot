import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', testMatch: 'home-hydration.spec.ts', workers: 2, retries: 0,
  reporter: 'list', use: { baseURL: 'http://127.0.0.1:5212', serviceWorkers: 'block' },
  projects: [
    { name: 'phone', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
  ],
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 5212 --strictPort', url: 'http://127.0.0.1:5212', reuseExistingServer: false },
});
