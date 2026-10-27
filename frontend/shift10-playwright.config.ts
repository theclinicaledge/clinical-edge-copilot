import { defineConfig, devices } from '@playwright/test';
export default defineConfig({ testDir: './tests', testMatch: 'shift10-private.spec.ts', timeout: 30000, fullyParallel: false, workers: 1, reporter: 'list', outputDir: '../verification/playwright', use: { ...devices['Desktop Chrome'], headless: true, trace: 'retain-on-failure' } });
