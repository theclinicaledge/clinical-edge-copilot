/**
 * App Store Screenshot Exporter — Clinical Edge
 * Exports app-store-screenshots.html → exports/app-screen-01…06.png
 * Each slide is 660×1344 CSS → 1320×2688 PNG at 2× scale
 */

const puppeteer = require('puppeteer');
const path      = require('path');
const fs        = require('fs');

const WIDTH           = 1080;
const HEIGHT          = 1344;
const DEVICE_SCALE    = 2;
const FONT_LOAD_DELAY = 2500;

const htmlFile = path.resolve(__dirname, 'app-store-screenshots.html');
const outDir   = path.resolve(__dirname, 'exports');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [`--window-size=${WIDTH},${HEIGHT}`, '--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: DEVICE_SCALE });
  await page.goto(`file://${htmlFile}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, FONT_LOAD_DELAY));

  const allHandles = await page.$$('.slide');
  console.log(`\n📱 Found ${allHandles.length} slides. Exporting...\n`);

  const slides = [];
  for (const handle of allHandles) {
    const id    = await handle.evaluate(el => el.id);
    const match = id.match(/slide-(\d+)/);
    if (match) slides.push({ handle, id, num: parseInt(match[1], 10) });
    else console.warn(`  ⚠ Skipping: ${id}`);
  }
  slides.sort((a, b) => a.num - b.num);

  for (const { handle, id, num } of slides) {
    const filename = `app-screen-${String(num).padStart(2, '0')}.png`;
    const outPath  = path.join(outDir, filename);
    await handle.screenshot({ path: outPath });
    console.log(`  ✓  exports/${filename}   (#${id})`);
  }

  await browser.close();
  console.log(`\n✓ Done — ${slides.length} screenshots saved to exports/\n`);
})();
