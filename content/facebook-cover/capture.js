#!/usr/bin/env node
// ─── Clinical Edge — Facebook Page Cover Capture ───────────────────────────
// Renders cover.html and exports an exact 1640×624 PNG (Facebook cover spec).
//
// Run:
//   node content/facebook-cover/capture.js

const puppeteer = require('../app-store-screenshots/node_modules/puppeteer');
const path = require('path');
const fs = require('fs');

const W = 1640;
const H = 624;

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });

  const htmlPath = path.join(__dirname, 'cover.html');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 20000 });

  try { await page.evaluate(() => document.fonts.ready); } catch {}
  await page.evaluate(() => new Promise((r) => setTimeout(r, 300)));

  const outPath = path.join(__dirname, 'clinical-edge-facebook-cover.png');
  await page.screenshot({ path: outPath, type: 'png' });

  await browser.close();

  const buf = fs.readFileSync(outPath);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  console.log(`Saved ${outPath}`);
  console.log(`Dimensions: ${w}×${h}  (expected ${W}×${H})  ${w === W && h === H ? '✓' : '✗ MISMATCH'}`);
})();
