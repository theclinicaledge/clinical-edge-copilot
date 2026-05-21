/**
 * Clinical Edge — TikTok Safe-Zone PNG Exporter
 * ───────────────────────────────────────────────
 * Exports 1080×1920 (9:16) slides respecting TikTok's UI safe zones:
 *   Top    180 px  (status bar + @handle overlay)
 *   Bottom 420 px  (caption + action buttons)
 *   Sides   90 px  (sidebar icons)
 *
 * Source: post-58-tiktok-safe.html
 * Output: exports/tiktok-ad-carousel/tiktok-slide-01.png … tiktok-slide-07.png
 *
 * Usage:
 *   node export-tiktok-safe.js
 */

const puppeteer = require('puppeteer');
const path      = require('path');
const fs        = require('fs');

/* ── Settings ───────────────────────────────────────────── */
const WIDTH           = 1080;
const HEIGHT          = 1920;   // TikTok 9:16
const DEVICE_SCALE    = 2;      // → 2160×3840 retina output
const FONT_LOAD_DELAY = 2200;

/* ── Paths ──────────────────────────────────────────────── */
const htmlFile = path.resolve(__dirname, 'post-58-tiktok-safe.html');
const outDir   = path.resolve(__dirname, 'exports', 'tiktok-ad-carousel');

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
  console.log(`\n📱 TikTok safe-zone export — ${slides.length} slides at ${WIDTH}×${HEIGHT} (${DEVICE_SCALE}×)\n`);
  console.log('   Safe zones: top 180px · bottom 420px · sides 90px\n');

  for (const { handle, id, num } of slides) {
    const filename = `tiktok-slide-${String(num).padStart(2, '0')}.png`;
    const outPath  = path.join(outDir, filename);
    await handle.screenshot({ path: outPath });
    console.log(`  ✓  exports/tiktok-ad-carousel/${filename}   (#${id})`);
  }

  await browser.close();
  console.log(`\n✓ Done — ${slides.length} slides saved to exports/tiktok-ad-carousel/\n`);

})();
