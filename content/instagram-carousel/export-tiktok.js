/**
 * Clinical Edge — TikTok Photo Carousel PNG Exporter
 * ─────────────────────────────────────────────────
 * Exports 1080×1920 (9:16) slides for TikTok photo carousel ads.
 * Renders at 2× device scale → 2160×3840 crisp output.
 *
 * Usage:
 *   node export-tiktok.js
 *   (or add "export-tiktok": "node export-tiktok.js" to package.json scripts)
 *
 * Output: exports/tiktok/slide-01.png … slide-N.png
 */

const puppeteer = require('puppeteer');
const path      = require('path');
const fs        = require('fs');

/* ── Settings ───────────────────────────────────────────── */
const WIDTH           = 1080;
const HEIGHT          = 1920;   // TikTok 9:16
const DEVICE_SCALE    = 2;      // 2160×3840 → retina-sharp
const FONT_LOAD_DELAY = 2200;   // extra ms for larger page

/* ── Paths ──────────────────────────────────────────────── */
const htmlFile = path.resolve(__dirname, 'index.html');
const outDir   = path.resolve(__dirname, 'exports', 'tiktok');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

/* ── Main ───────────────────────────────────────────────── */
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

  const allHandles = await page.$$('.slide');

  if (allHandles.length === 0) {
    console.error('\n✗ No slides found with class="slide"\n');
    await browser.close();
    process.exit(1);
  }

  const slides = [];
  for (const handle of allHandles) {
    const id    = await handle.evaluate(el => el.id);
    const match = id.match(/slide-(\d+)/);
    if (match) slides.push({ handle, id, num: parseInt(match[1], 10) });
  }

  slides.sort((a, b) => a.num - b.num);
  console.log(`\n📱 TikTok export — ${slides.length} slides at ${WIDTH}×${HEIGHT} (${DEVICE_SCALE}×)\n`);

  for (const { handle, id, num } of slides) {
    const filename = `slide-${String(num).padStart(2, '0')}.png`;
    const outPath  = path.join(outDir, filename);
    await handle.screenshot({ path: outPath });
    console.log(`  ✓  exports/tiktok/${filename}   (#${id})`);
  }

  await browser.close();
  console.log(`\n✓ Done — ${slides.length} TikTok slides saved to exports/tiktok/\n`);

})();
