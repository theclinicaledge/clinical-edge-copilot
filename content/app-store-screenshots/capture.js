#!/usr/bin/env node
// ─── Clinical Edge — Real App Store Screenshot Capture ────────────────────────
//
// Captures 6 screenshots (1290×2796 / iPhone 15 Pro Max) directly from the
// BUILT Clinical Edge frontend. Every pixel comes from the real app.
//
// Pre-requisites:
//   cd frontend && npm run build   ← must be done first
//   cd content/app-store-screenshots
//   npm install
//   node capture.js
//
// What is captured (real app routes):
//   01  /                              — Home Hub (cream surface + module rows)
//   02  /copilot?screenshot=response   — Copilot + pre-baked clinical response
//   03  /rhythm-lab                    — Rhythm Lab library list
//   04  /rhythm-lab?screenshot=compare — Compare Mode (SVT vs SinTach etc.)
//   05  /rhythm-lab?screenshot=practice— Practice Mode (identify-the-rhythm)
//   06  /privacy                       — Privacy / safety disclaimer page

const puppeteer = require('puppeteer');
const http      = require('http');
const https     = require('https');
const fs        = require('fs');
const path      = require('path');

// ── Config ────────────────────────────────────────────────────────────────────

// 430×932 logical px × 3 deviceScaleFactor = 1290×2796 physical px
const VP = { width: 430, height: 932, deviceScaleFactor: 3 };

const PORT     = 54321;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const DIST_DIR = path.join(__dirname, '../../frontend/dist');
const OUT_DIR  = path.join(__dirname, 'out');

const SHOTS = [
  {
    url:      '/',
    out:      '01-home-platform.png',
    label:    'Home Hub',
    waitFn:   () => !!document.querySelector('h1'),
  },
  {
    url:      '/copilot?screenshot=response',
    out:      '02-copilot.png',
    label:    'Copilot — response view',
    waitFn:   () => !!document.querySelector('.fade-up'),
    // Scroll to the response section — it renders below the input UI
    scrollTo: '.fade-up',
  },
  {
    url:      '/rhythm-lab',
    out:      '03-rhythm-lab-library.png',
    label:    'Rhythm Lab — library',
    waitFn:   () => !!document.querySelector('.rhythm-lab-root'),
  },
  {
    url:      '/rhythm-lab?screenshot=compare',
    out:      '04-compare-rhythms.png',
    label:    'Rhythm Lab — Compare Mode',
    waitFn:   () => !!document.querySelector('.compare-page, .compare-nav, .compare-header, [class*="compare"]'),
  },
  {
    url:      '/rhythm-lab?screenshot=practice',
    out:      '05-practice-mode.png',
    label:    'Rhythm Lab — Practice Mode',
    waitFn:   () => !!document.querySelector('.practice-page, .practice-nav, [class*="practice"]'),
  },
  {
    url:      '/privacy',
    out:      '06-safety-trust.png',
    label:    'Privacy & Safety',
    waitFn:   () => !!document.querySelector('h1'),
  },
];

// ── MIME types ────────────────────────────────────────────────────────────────

const MIME = {
  '.html':  'text/html; charset=utf-8',
  '.js':    'application/javascript; charset=utf-8',
  '.mjs':   'application/javascript; charset=utf-8',
  '.css':   'text/css; charset=utf-8',
  '.png':   'image/png',
  '.jpg':   'image/jpeg',
  '.jpeg':  'image/jpeg',
  '.svg':   'image/svg+xml',
  '.ico':   'image/x-icon',
  '.json':  'application/json',
  '.webp':  'image/webp',
  '.woff':  'font/woff',
  '.woff2': 'font/woff2',
  '.ttf':   'font/ttf',
  '.txt':   'text/plain',
};

// ── SPA-capable static file server ───────────────────────────────────────────

function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      // Strip query string and anchor for file lookup
      const urlPath  = req.url.split('?')[0].split('#')[0];
      const filePath = path.join(DIST_DIR, urlPath);

      function serveFile(fp) {
        const ext  = path.extname(fp).toLowerCase();
        const mime = MIME[ext] || 'application/octet-stream';
        res.writeHead(200, {
          'Content-Type': mime,
          'Cache-Control': 'no-cache',
        });
        fs.createReadStream(fp).pipe(res);
      }

      // Check if the resolved path is an existing file
      try {
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
          serveFile(filePath);
          return;
        }
        if (stat.isDirectory()) {
          const indexPath = path.join(filePath, 'index.html');
          if (fs.existsSync(indexPath)) {
            serveFile(indexPath);
            return;
          }
        }
      } catch {}

      // SPA fallback — serve index.html for any unknown path
      const indexPath = path.join(DIST_DIR, 'index.html');
      if (fs.existsSync(indexPath)) {
        serveFile(indexPath);
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });

    server.listen(PORT, '127.0.0.1', () => resolve(server));
    server.on('error', reject);
  });
}

// ── Screenshot capture ────────────────────────────────────────────────────────

async function capture(page, shot) {
  const fullUrl = `${BASE_URL}${shot.url}`;

  await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 20_000 });

  // Wait for React to render the target state
  try {
    await page.waitForFunction(shot.waitFn, { timeout: 8_000 });
  } catch {
    // If specific selector isn't found, at least wait for network idle
    await page.waitForFunction(
      () => document.readyState === 'complete',
      { timeout: 5_000 }
    );
  }

  // If a scrollTo selector is specified, scroll that element into view first
  if (shot.scrollTo) {
    try {
      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
      }, shot.scrollTo);
    } catch {}
    // Let scroll position settle
    await page.evaluate(() => new Promise(r => setTimeout(r, 200)));
  }

  // Let fonts load and any CSS transitions settle
  try {
    await page.evaluate(() => document.fonts.ready);
  } catch {}
  await page.evaluate(() => new Promise(r => setTimeout(r, 350)));

  // Capture the visible viewport at its current scroll position.
  // Without `clip`, Puppeteer captures exactly the viewport area (430×932 CSS px
  // = 1290×2796 physical px at deviceScaleFactor:3).
  const screenshot = await page.screenshot({
    type: 'png',
  });

  return screenshot;
}

// ── Main ──────────────────────────────────────────────────────────────────────

(async () => {
  // Pre-flight: verify dist exists
  if (!fs.existsSync(DIST_DIR) || !fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
    console.error('\n  ✗  frontend/dist not found.');
    console.error('     Run:  cd frontend && npm run build\n');
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log('\n  Clinical Edge — App Store Screenshot Capture (real app)');
  console.log('  ─────────────────────────────────────────────────────────\n');
  console.log(`  Serving frontend/dist on http://127.0.0.1:${PORT}`);

  const server = await startServer();

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--font-render-hinting=none',
      '--disable-web-security',   // allow local font loading
    ],
  });

  let ok = 0, fail = 0;

  for (const shot of SHOTS) {
    process.stdout.write(`  Capturing ${shot.label}...`);

    const page = await browser.newPage();
    await page.setViewport(VP);

    try {
      const buf     = await capture(page, shot);
      const outPath = path.join(OUT_DIR, shot.out);
      fs.writeFileSync(outPath, buf);

      const kb = Math.round(fs.statSync(outPath).size / 1024);
      console.log(` ✓  → out/${shot.out}  (${kb} KB)`);
      ok++;
    } catch (err) {
      console.log(' ✗  FAILED');
      console.error(`     ${err.message}`);
      fail++;
    } finally {
      await page.close();
    }
  }

  await browser.close();
  server.close();

  console.log('');
  console.log(`  Done — ${ok} captured, ${fail} failed.`);
  console.log(`  Files: content/app-store-screenshots/out/\n`);

  if (fail > 0) process.exit(1);
})();
