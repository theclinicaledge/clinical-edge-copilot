/**
 * Clinical Edge — Instagram Carousel PNG Exporter
 * ─────────────────────────────────────────────────
 * Dynamically detects every slide in index.html and exports
 * each one as a crisp 1080×1350 PNG (rendered at 2×).
 *
 * Works for any number of slides — 5, 6, 7, 8, or more.
 * No manual edits needed between carousel posts.
 *
 * Requirements:
 *   npm install          (installs puppeteer from package.json)
 *
 * Usage:
 *   npm run export       (recommended)
 *   node export.js       (also fine)
 *
 * Output: exports/slide-01.png, slide-02.png, … slide-N.png
 */

const puppeteer = require('puppeteer');
const path      = require('path');
const fs        = require('fs');

/* ── Settings ───────────────────────────────────────────── */
const WIDTH             = 1080;
const HEIGHT            = 1350;
const DEVICE_SCALE      = 2;        // renders at 2160×2700 → crisp on Instagram
const FONT_LOAD_DELAY   = 2000;     // ms to wait for Google Fonts after page load

/* ── Paths ──────────────────────────────────────────────── */
const htmlFile = path.resolve(__dirname, 'index.html');
const outDir   = path.resolve(__dirname, 'exports');

/* ── Auto-create exports folder if it doesn't exist ─────── */
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

/* ── Main ───────────────────────────────────────────────── */
(async () => {

  /* 1. Launch browser */
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

  /* 2. Load the carousel HTML file */
  await page.goto(`file://${htmlFile}`, { waitUntil: 'networkidle0' });

  /* 3. Wait for fonts to finish rendering */
  await new Promise(resolve => setTimeout(resolve, FONT_LOAD_DELAY));

  /* 4. Dynamically discover all slides by class="slide" */
  const allHandles = await page.$$('.slide');

  if (allHandles.length === 0) {
    console.error('\n✗ No slides found.');
    console.error('  Make sure every slide has class="slide" and an id like slide-1, slide-2, etc.\n');
    await browser.close();
    process.exit(1);
  }

  /* 5. Read each element's id and extract the slide number */
  const slides = [];

  for (const handle of allHandles) {
    const id    = await handle.evaluate(el => el.id);
    const match = id.match(/slide-(\d+)/);

    if (match) {
      slides.push({
        handle,
        id,
        num: parseInt(match[1], 10),
      });
    } else {
      console.warn(`  ⚠ Skipping element — id "${id}" doesn't match slide-N pattern`);
    }
  }

  /* 6. Sort numerically so slide-1 always comes before slide-10 */
  slides.sort((a, b) => a.num - b.num);

  console.log(`\n📸 Found ${slides.length} slide${slides.length !== 1 ? 's' : ''}. Exporting...\n`);

  /* 7. Screenshot each slide */
  for (const { handle, id, num } of slides) {
    const filename = `slide-${String(num).padStart(2, '0')}.png`;
    const outPath  = path.join(outDir, filename);

    await handle.screenshot({ path: outPath });
    console.log(`  ✓  exports/${filename}   (#${id})`);
  }

  /* 8. Done */
  await browser.close();
  console.log(`\n✓ Done — ${slides.length} slides saved to exports/\n`);

})();
