/**
 * Clinical Edge Copilot — Carousel PNG Exporter
 * ─────────────────────────────────────────────
 * Uses Puppeteer to screenshot each slide at exactly 1080×1350.
 *
 * Requirements:
 *   npm install puppeteer
 *
 * Usage:
 *   node export.js
 *
 * Output: carousel/exports/slide-01.png … slide-05.png
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const SLIDE_IDS = ['slide-1', 'slide-2', 'slide-3', 'slide-4', 'slide-5'];
const SLIDE_NAMES = ['slide-01-cover', 'slide-02-problem', 'slide-03-education', 'slide-04-scenario', 'slide-05-cta'];
const WIDTH  = 1080;
const HEIGHT = 1350;

const htmlFile = path.resolve(__dirname, 'index.html');
const outDir   = path.resolve(__dirname, 'exports');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [`--window-size=${WIDTH},${HEIGHT}`, '--no-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 2 }); // 2× = 2160×2700 for crisp output

  await page.goto(`file://${htmlFile}`, { waitUntil: 'networkidle0' });

  // Wait for Google Fonts to load
  await page.waitForTimeout(1500);

  for (let i = 0; i < SLIDE_IDS.length; i++) {
    const id   = SLIDE_IDS[i];
    const name = SLIDE_NAMES[i];

    const element = await page.$(`#${id}`);
    if (!element) {
      console.error(`  ✗ Could not find #${id}`);
      continue;
    }

    const outPath = path.join(outDir, `${name}.png`);
    await element.screenshot({ path: outPath });
    console.log(`  ✓ Exported: exports/${name}.png`);
  }

  await browser.close();
  console.log('\nAll slides exported to carousel/exports/');
})();
