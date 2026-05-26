#!/usr/bin/env node
// ─── Clinical Edge — App Store Screenshot Capture ─────────────────────────────
//
// Captures 6 HTML templates as 1290×2796 PNG (iPhone 15 Pro Max App Store spec).
// Each template sets window.ready = true when its content is fully rendered.
//
// Usage:
//   cd content/app-store-screenshots
//   npm install
//   node capture.js
//
// Output:
//   out/01-home-platform.png
//   out/02-copilot.png
//   out/03-rhythm-lab-library.png
//   out/04-compare-rhythms.png
//   out/05-practice-mode.png
//   out/06-safety-trust.png

const puppeteer = require('puppeteer');
const path      = require('path');
const fs        = require('fs');

// ── Config ────────────────────────────────────────────────────────────────────

// 430×932 logical px × deviceScaleFactor 3 = 1290×2796 physical px
const VIEWPORT = { width: 430, height: 932, deviceScaleFactor: 3 };

const TEMPLATES = [
  { file: '01-home-platform.html',    out: '01-home-platform.png'    },
  { file: '02-copilot.html',          out: '02-copilot.png'          },
  { file: '03-rhythm-lab-library.html', out: '03-rhythm-lab-library.png' },
  { file: '04-compare-rhythms.html',  out: '04-compare-rhythms.png'  },
  { file: '05-practice-mode.html',    out: '05-practice-mode.png'    },
  { file: '06-safety-trust.html',     out: '06-safety-trust.png'     },
];

const TEMPLATES_DIR = path.join(__dirname, 'templates');
const OUT_DIR       = path.join(__dirname, 'out');

// ── Main ──────────────────────────────────────────────────────────────────────

(async () => {
  // Ensure output directory exists
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log('\n  Clinical Edge — App Store Screenshot Capture');
  console.log('  ─────────────────────────────────────────────\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  let successCount = 0;
  let failCount    = 0;

  for (const { file, out } of TEMPLATES) {
    const templatePath = path.join(TEMPLATES_DIR, file);
    const outputPath   = path.join(OUT_DIR, out);

    if (!fs.existsSync(templatePath)) {
      console.error(`  ✗  MISSING template: templates/${file}`);
      failCount++;
      continue;
    }

    process.stdout.write(`  Capturing ${file}...`);

    try {
      const page = await browser.newPage();

      // Set viewport to logical phone dimensions
      await page.setViewport(VIEWPORT);

      // Load template as file:// URL
      await page.goto(`file://${templatePath}`, { waitUntil: 'domcontentloaded' });

      // Wait for template to signal it is fully rendered
      await page.waitForFunction('window.ready === true', { timeout: 10_000 });

      // Capture at exact viewport size (no full-page scroll — clips to viewport)
      await page.screenshot({
        path:     outputPath,
        type:     'png',
        clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height },
      });

      await page.close();

      const stat = fs.statSync(outputPath);
      const kb   = Math.round(stat.size / 1024);
      console.log(` ✓  → out/${out}  (${kb} KB)`);
      successCount++;

    } catch (err) {
      console.log(' ✗  FAILED');
      console.error(`     ${err.message}`);
      failCount++;
    }
  }

  await browser.close();

  console.log('');
  console.log(`  Done — ${successCount} captured, ${failCount} failed.`);
  console.log(`  Files in: content/app-store-screenshots/out/\n`);

  if (failCount > 0) process.exit(1);
})();
