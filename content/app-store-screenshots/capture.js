#!/usr/bin/env node
// ─── Clinical Edge — App Store Screenshot Capture (premium composition) ───────
//
// Two-stage pipeline per screenshot:
//   Stage 1 — Capture the real app at 428×718 (app zone only)
//   Stage 2 — Compose into 428×926 marketing frame: cream header + floating card
//
// Output: 1284×2778 @ 3× DPR — Apple iPhone 6.5" App Store exact spec
//
// Run:
//   cd frontend && npm run build    ← required first
//   cd content/app-store-screenshots
//   node capture.js

const puppeteer = require('puppeteer');
const http      = require('http');
const fs        = require('fs');
const path      = require('path');

// ── Canvas dimensions (logical CSS px) ───────────────────────────────────────
// Target physical: 1284×2778 (Apple iPhone 6.5" App Store exact requirement)
//   W = 1284/3 = 428   H = 2778/3 = 926   DPR = 3
const W       = 428;           // logical width  → 1284 physical
const H       = 926;           // logical height → 2778 physical
const DPR     = 3;             // device scale → 1284×2778 physical
const HDR_H   = 208;           // marketing header height
const APP_H   = H - HDR_H;    // 718 — real app screenshot height

// ── Floating card geometry (shots with floatingCard: true) ───────────────────
// Creates visible gutters so the app reads as a floating card over the header.
//   card width  = W - 2×CARD_X = 402 px
//   card height = H - HDR_H - CARD_TOP - CARD_BOTTOM = 696 px
const CARD_X      = 14;   // side gutter each side (px)
const CARD_TOP    = 12;   // gap between header bottom and card top
const CARD_BOTTOM = 16;   // gap between card bottom and frame bottom

// ── Infrastructure ────────────────────────────────────────────────────────────
const PORT     = 54321;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const DIST_DIR = path.join(__dirname, '../../frontend/dist');
const OUT_DIR  = path.join(__dirname, 'out-final');

// ── Shot definitions ──────────────────────────────────────────────────────────
// headline:    text with \n for intentional line breaks (converted to <br>)
// subheadline: single line
// scrollTo:    CSS selector to scroll into view before capture (optional)
// waitFn:      function string evaluated in page context to gate readiness

const SHOTS = [
  {
    url:         '/',
    out:         '01.png',
    label:       'Home Hub',
    waitFn:      () => !!document.querySelector('h1'),
    headline:    'Clinical tools for\nreal-world nursing.',
    subheadline: 'Clinical reasoning, ECG recognition, and bedside support — in one place.',
  },
  {
    url:         '/copilot?screenshot=response',
    out:         '02.png',
    label:       'Copilot — response',
    waitFn:      () => !!document.querySelector('.fade-up'),
    scrollTo:    '.fade-up',
    headline:    'Think through complex\nsituations clearly.',
    subheadline: 'Structured clinical reasoning support built around how nurses actually work.',
  },
  {
    url:         '/rhythm-lab',
    out:         '03.png',
    label:       'Rhythm Lab — library',
    waitFn:      () => !!document.querySelector('.rhythm-lab-root'),
    scrollTo:    '.rhythm-list',
    headline:    'Recognize rhythms\nfaster.',
    subheadline: '30+ cardiac rhythms with real waveform patterns and bedside clinical context.',
  },
  {
    url:         '/rhythm-lab?screenshot=compare',
    out:         '04.png',
    label:       'Rhythm Lab — Compare',
    waitFn:      () => !!document.querySelector('[class*="compare"]'),
    headline:    'Compare look-alike\nrhythms side by side.',
    subheadline: 'See the clinical distinctions that matter for patient management.',
    // No prepFn — capture the real app exactly as it renders on a mobile viewport.
  },
  {
    url:         '/rhythm-lab?screenshot=practice',
    out:         '05.png',
    label:       'Rhythm Lab — Practice',
    waitFn:      () => !!document.querySelector('[class*="practice"]'),
    headline:    'Practice rhythm\nrecognition actively.',
    subheadline: 'Work through strips systematically before revealing the identity.',
    // No prepFn — capture the real app exactly as it renders on a mobile viewport.
  },
  {
    url:         '/copilot',
    out:         '06.png',
    label:       'Platform overview',
    waitFn:      () => !!document.querySelector('h1'),
    headline:    'Built for the realities\nof bedside care.',
    subheadline: 'Clinical Edge helps nurses think clearly, recognize patterns, and respond with confidence.',
  },
];

// ── CE logo SVG (inline, 18×16, teal) ────────────────────────────────────────
const CE_LOGO_SVG = `
<svg width="18" height="16" viewBox="0 0 225 200" fill="#0ABFBC" xmlns="http://www.w3.org/2000/svg">
  <path d="M 159.1,24.3 A 96,96 0 1,0 159.1,175.7 L 135.7,145.7 A 58,58 0 1,1 135.7,54.3 Z"/>
  <path d="M 144.0,57 L 208,45 L 218,58 L 208,70 L 150.0,71 Z"/>
  <path d="M 158.0,92 L 215,82 L 225,95 L 215,107 L 158.0,108 Z"/>
  <path d="M 150.0,129 L 208,130 L 218,142 L 208,155 L 144.0,143 Z"/>
</svg>`.trim();

// ── HTML composition template ─────────────────────────────────────────────────
// Design system (all 6 shots):
//   • Warm cream background (#E8E3D8) — matches the Clinical Edge app's own surface
//   • Dark navy text (#0B1F2A) — crisp, on-brand
//   • Teal CE wordmark (#0ABFBC)
//   • App screenshot floats on the cream mat: gutters + all-corner radius + soft shadow
//
function buildCompositionHtml(appB64, shot) {
  const headlineHtml = shot.headline.replace(/\n/g, '<br>');
  const cardY        = HDR_H + CARD_TOP;  // absolute top of floating card = 220 px

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body {
    width: ${W}px;
    height: ${H}px;
    overflow: hidden;
    /* System sans-serif — SF Pro on macOS headless */
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    /* Warm cream canvas — same family as the app's own surface (#E7E1D6) */
    background: #E8E3D8;
  }

  .wrapper {
    width: ${W}px;
    height: ${H}px;
    background: #E8E3D8;
    position: relative;
    overflow: hidden;
  }

  /* ── Marketing header — floats above the app card ──────────────────────── */
  .header {
    height: ${HDR_H}px;
    position: relative;
    z-index: 1;
    padding: 30px 28px 24px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .wordmark {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .wordmark-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #0ABFBC;
    font-family: 'Courier New', 'Menlo', monospace;
    line-height: 1;
  }

  .headline-wrap { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; }

  .headline {
    font-size: 30px;
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -0.04em;
    /* Dark navy — readable on warm cream */
    color: #0B1F2A;
    margin-bottom: 10px;
  }

  .subheadline {
    font-size: 14px;
    font-weight: 400;
    line-height: 1.55;
    letter-spacing: -0.01em;
    /* Muted steel-blue — complements navy on cream */
    color: #4A6978;
    max-width: 374px;
  }

  /* ── App card — floating on the cream mat ──────────────────────────────── */
  .app-area {
    position: absolute;
    top:    ${cardY}px;
    left:   ${CARD_X}px;
    right:  ${CARD_X}px;
    bottom: ${CARD_BOTTOM}px;
    overflow: hidden;
    border-radius: 14px;
    /*
      Soft navy shadow on light background:
        ring  — 1px border for edge definition
        near  — crisp close shadow
        mid   — ambient elevation lift
    */
    box-shadow:
      0 0 0 1px rgba(11, 31, 42, 0.10),
      0 4px 16px  rgba(11, 31, 42, 0.14),
      0 20px 52px rgba(11, 31, 42, 0.18);
  }

  .app-area img {
    width:  100%;
    height: 100%;
    display: block;
    object-fit: cover;
    object-position: top center;
  }
</style>
</head>
<body>
<div class="wrapper">

  <div class="header">
    <!-- CE wordmark -->
    <div class="wordmark">
      ${CE_LOGO_SVG}
      <span class="wordmark-label">Clinical Edge</span>
    </div>
    <!-- Headline + sub -->
    <div class="headline-wrap">
      <div class="headline">${headlineHtml}</div>
      <div class="subheadline">${shot.subheadline}</div>
    </div>
  </div>

  <!-- Real app screenshot -->
  <div class="app-area">
    <img src="data:image/png;base64,${appB64}" alt="" draggable="false">
  </div>

</div>
</body>
</html>`;
}

// ── SPA-capable static file server ───────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.json': 'application/json',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
};

function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const urlPath  = req.url.split('?')[0].split('#')[0];
      const filePath = path.join(DIST_DIR, urlPath);

      function serve(fp) {
        const ext  = path.extname(fp).toLowerCase();
        const mime = MIME[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-cache' });
        fs.createReadStream(fp).pipe(res);
      }

      try {
        const st = fs.statSync(filePath);
        if (st.isFile()) { serve(filePath); return; }
        if (st.isDirectory()) {
          const idx = path.join(filePath, 'index.html');
          if (fs.existsSync(idx)) { serve(idx); return; }
        }
      } catch {}

      // SPA fallback
      const idx = path.join(DIST_DIR, 'index.html');
      if (fs.existsSync(idx)) serve(idx);
      else { res.writeHead(404); res.end('Not found'); }
    });

    server.listen(PORT, '127.0.0.1', () => resolve(server));
    server.on('error', reject);
  });
}

// ── Stage 1: capture the real app ─────────────────────────────────────────────
async function captureApp(browser, shot) {
  const page = await browser.newPage();

  // Tell Chrome to report prefers-reduced-motion: reduce.
  // This disables the strip-canvas sweep animation (clip-path reveal) so the
  // waveform is fully drawn at capture time — no mid-animation partial strip.
  // This is a browser-level media feature emulation, not a CSS injection.
  await page.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: 'reduce' },
  ]);

  // App viewport: full width, APP_H tall — no marketing frame
  await page.setViewport({ width: W, height: APP_H, deviceScaleFactor: DPR });

  await page.goto(`${BASE_URL}${shot.url}`, {
    waitUntil: 'domcontentloaded',
    timeout:   20_000,
  });

  // Wait for the primary content selector
  try {
    await page.waitForFunction(shot.waitFn, { timeout: 8_000 });
  } catch {
    await page.waitForFunction(() => document.readyState === 'complete', { timeout: 5_000 });
  }

  // Scroll to a specific element if required
  if (shot.scrollTo) {
    try {
      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
      }, shot.scrollTo);
      await page.evaluate(() => new Promise(r => setTimeout(r, 200)));
    } catch {}
  }

  // Execute screenshot-specific DOM prep (hide elements, adjust SVG viewBoxes, etc.)
  if (shot.prepFn) {
    await page.evaluate(shot.prepFn);
    await page.evaluate(() => new Promise(r => setTimeout(r, 200)));
  }

  // Let fonts & transitions settle
  try { await page.evaluate(() => document.fonts.ready); } catch {}
  await page.evaluate(() => new Promise(r => setTimeout(r, 380)));

  // Capture the viewport (no full-page, no clip — just what's visible)
  const b64 = await page.screenshot({ type: 'png', encoding: 'base64' });
  await page.close();
  return b64;
}

// ── Stage 2: compose marketing frame ─────────────────────────────────────────
async function composeFrame(browser, appB64, shot) {
  const page = await browser.newPage();

  // Composition viewport: full canvas size
  await page.setViewport({ width: W, height: H, deviceScaleFactor: DPR });

  const html = buildCompositionHtml(appB64, shot);
  await page.setContent(html, { waitUntil: 'domcontentloaded' });

  // Wait for the embedded image to decode
  await page.waitForFunction(
    () => {
      const img = document.querySelector('img');
      return img ? img.complete && img.naturalWidth > 0 : false;
    },
    { timeout: 8_000 }
  );

  // One extra tick for layout to settle
  await page.evaluate(() => new Promise(r => setTimeout(r, 200)));

  const buf = await page.screenshot({ type: 'png' });
  await page.close();
  return buf;
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  if (!fs.existsSync(DIST_DIR) || !fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
    console.error('\n  ✗  frontend/dist not found.');
    console.error('     Run:  cd frontend && npm run build\n');
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log('\n  Clinical Edge — App Store Screenshot Capture');
  console.log('  ─────────────────────────────────────────────');
  console.log(`  Canvas: ${W * DPR}×${H * DPR} px  (${W}×${H} @ ${DPR}×)\n`);
  console.log(`  Serving frontend/dist on http://127.0.0.1:${PORT}`);

  const server = await startServer();
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--font-render-hinting=none',
    ],
  });

  let ok = 0, fail = 0;

  const SHOTS_TO_RUN = SHOTS; // all 6

  for (const shot of SHOTS_TO_RUN) {
    process.stdout.write(`\n  [${SHOTS_TO_RUN.indexOf(shot) + 1}/${SHOTS_TO_RUN.length}]  ${shot.label}`);

    try {
      // Stage 1
      process.stdout.write('  →  capturing app...');
      const appB64 = await captureApp(browser, shot);

      // Stage 2
      process.stdout.write('  composing...');
      const finalBuf = await composeFrame(browser, appB64, shot);

      const outPath = path.join(OUT_DIR, shot.out);
      fs.writeFileSync(outPath, finalBuf);

      const kb = Math.round(fs.statSync(outPath).size / 1024);
      console.log(`  ✓  out-final/${shot.out}  (${kb} KB)`);
      ok++;

    } catch (err) {
      console.log(`  ✗  FAILED: ${err.message}`);
      fail++;
    }
  }

  await browser.close();
  server.close();

  console.log(`\n  Done — ${ok} captured, ${fail} failed.`);

  // ── Programmatic dimension verification ────────────────────────────────────
  // Read width/height directly from each PNG's IHDR chunk (bytes 16–23).
  // No extra dependencies needed — the PNG spec guarantees this layout.
  console.log('\n  ── Dimension verification (' + (W * DPR) + '×' + (H * DPR) + ' required) ──');
  let allPass = true;
  for (const shot of SHOTS) {
    const fp = path.join(OUT_DIR, shot.out);
    if (!fs.existsSync(fp)) {
      console.log(`  ✗  ${shot.out}  — FILE MISSING`);
      allPass = false;
      continue;
    }
    const buf = fs.readFileSync(fp);
    // PNG IHDR: signature(8) + length(4) + "IHDR"(4) + width(4) + height(4)
    const w = buf.readUInt32BE(16);
    const h = buf.readUInt32BE(20);
    const ok = w === W * DPR && h === H * DPR;
    console.log(`  ${ok ? '✓' : '✗'}  ${shot.out.padEnd(8)}  ${w}×${h}${ok ? '' : '  ← WRONG'}`);
    if (!ok) allPass = false;
  }

  const finalPath = path.resolve(OUT_DIR);
  console.log(`\n  ${allPass ? '✓ All screenshots are exactly ' + (W*DPR) + '×' + (H*DPR) : '✗ Dimension mismatch — check output above'}`);
  console.log(`\n  Upload-ready folder:\n  ${finalPath}\n`);

  if (fail > 0 || !allPass) process.exit(1);
})();
