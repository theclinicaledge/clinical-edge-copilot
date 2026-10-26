import { defineConfig } from '@playwright/test';
import base from './shift8-playwright.config';
export default defineConfig({
  ...base, testMatch: 'shift8-release.spec.ts',
  use: { ...base.use, baseURL: 'http://127.0.0.1:5209' },
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 5209 --strictPort', url: 'http://127.0.0.1:5209', reuseExistingServer: false },
});
