import { defineConfig, devices } from '@playwright/test';
process.env.SHIFT10_RELEASE_URL='http://127.0.0.1:5210/learn/shifts/transfer-not-ready';
export default defineConfig({
  testDir:'./tests',testMatch:['shift10-private.spec.ts','shift10-release.spec.ts'],workers:1,retries:0,timeout:30000,
  reporter:'list',outputDir:'../verification/shift10-release-browser',
  use:{...devices['Desktop Chrome'],baseURL:'http://127.0.0.1:5210',headless:true,trace:'retain-on-failure'},
  webServer:{command:'npm run preview -- --host 127.0.0.1 --port 5210 --strictPort',url:'http://127.0.0.1:5210',reuseExistingServer:false,timeout:15000},
});
