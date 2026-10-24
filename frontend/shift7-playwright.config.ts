import { defineConfig, devices } from '@playwright/test';
process.env.VITE_SHIFT_006_PREVIEW='true';
export default defineConfig({
 testDir:'./tests', testMatch:'shift7.spec.ts', fullyParallel:true, workers:2, retries:0, reporter:'list',
 use:{baseURL:'http://127.0.0.1:5187',trace:'retain-on-failure'},
 webServer:{command:'VITE_SHIFT_ENABLED=true VITE_SHIFT_006_PREVIEW=true npm run dev -- --configLoader runner --host 127.0.0.1 --port 5187',url:'http://127.0.0.1:5187',reuseExistingServer:false,timeout:15000},
 projects:[{name:'desktop',use:{...devices['Desktop Chrome']}},{name:'phone',use:{...devices['iPhone 13'],defaultBrowserType:'chromium'}}],
});
