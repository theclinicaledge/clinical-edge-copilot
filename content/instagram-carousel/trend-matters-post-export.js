/**
 * Standalone Puppeteer exporter for trend-matters-post.html
 * Does not touch the existing carousel export.js / package.json.
 *
 * Usage:
 *   node trend-matters-post-export.js
 *
 * Output:
 *   trend-matters-post.png  (2160 x 2700 — 1080 x 1350 rendered at 2x)
 */

const puppeteer = require('puppeteer');
const path      = require('path');

const WIDTH           = 1080;
const HEIGHT          = 1350;
const DEVICE_SCALE    = 2;
const FONT_LOAD_DELAY = 2000;

const htmlFile = path.resolve(__dirname, 'trend-matters-post.html');
const outFile  = path.resolve(__dirname, 'trend-matters-post.png');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      `--window-size=${WIDTH},${HEIGHT}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: DEVICE_SCALE });

  await page.goto(`file://${htmlFile}`, { waitUntil: 'networkidle0' });
  await new Promise(resolve => setTimeout(resolve, FONT_LOAD_DELAY));

  const slide = await page.$('#slide-1');
  if (!slide) {
    console.error('\n✗ #slide-1 not found in trend-matters-post.html\n');
    await browser.close();
    process.exit(1);
  }

  await slide.screenshot({ path: outFile });
  await browser.close();

  console.log(`\n✓ Exported ${path.basename(outFile)} (2160x2700)\n`);
})();
