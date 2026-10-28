import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests', testMatch: ['home-continue.spec.ts', 'shift-library-visuals.spec.ts'], workers: 1, retries: 0,
  reporter: 'list', outputDir: '../verification/home-continue-browser',
  use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:5211', trace: 'retain-on-failure' },
  webServer: { command: 'VITE_SHIFT_ENABLED=true npm run dev -- --host 127.0.0.1 --port 5211 --strictPort', url: 'http://127.0.0.1:5211', reuseExistingServer: false },
});
