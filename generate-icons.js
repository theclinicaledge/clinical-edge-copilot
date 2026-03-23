#!/usr/bin/env node
/**
 * generate-icons.js
 * Generates PNG app icons for Clinical Edge Copilot PWA.
 * Zero external dependencies — uses only built-in Node.js (zlib, fs, path).
 * Run from the repo root: node generate-icons.js
 */

const zlib = require('zlib');
const fs   = require('fs');
const path = require('path');

// ── PNG encoder ──────────────────────────────────────────────────────────────

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) crc = (crc & 1) ? (0xEDB88320 ^ (crc >>> 1)) : (crc >>> 1);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function pngChunk(type, data) {
  const t   = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

function encodePNG(size, getPixel) {
  const rowBytes = 1 + size * 4;
  const raw = Buffer.alloc(size * rowBytes, 0);
  for (let y = 0; y < size; y++) {
    raw[y * rowBytes] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = getPixel(x, y);
      const o = y * rowBytes + 1 + x * 4;
      raw[o] = r; raw[o+1] = g; raw[o+2] = b; raw[o+3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  return Buffer.concat([
    Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── Drawing helpers ──────────────────────────────────────────────────────────

// Signed distance from point to nearest point on a line segment
function distToSeg(px, py, x1, y1, x2, y2) {
  const dx = x2-x1, dy = y2-y1, len2 = dx*dx+dy*dy;
  const t  = len2 ? Math.max(0, Math.min(1, ((px-x1)*dx+(py-y1)*dy)/len2)) : 0;
  return Math.hypot(px-(x1+t*dx), py-(y1+t*dy));
}

// Is pixel (x,y) inside a size×size rounded rect with corner radius r?
function inRRect(x, y, size, r) {
  const ex = x < r ? r-x : (x > size-r ? x-(size-r) : 0);
  const ey = y < r ? r-y : (y > size-r ? y-(size-r) : 0);
  return ex*ex + ey*ey <= r*r;
}

// Anti-aliased alpha for a stroke at distance `dist` with half-width `hw`
function strokeAlpha(dist, hw) {
  if (dist <= hw - 0.5) return 255;
  if (dist >= hw + 0.5) return 0;
  return Math.round((hw + 0.5 - dist) * 255);
}

// Porter-Duff "src over dst" composite; fg has separate alpha
function over(fg, fgA, bg) {
  const a = fgA / 255;
  return [
    Math.round(fg[0]*a + bg[0]*(1-a)),
    Math.round(fg[1]*a + bg[1]*(1-a)),
    Math.round(fg[2]*a + bg[2]*(1-a)),
  ];
}

// ── Icon design ──────────────────────────────────────────────────────────────

const BG   = [11,  25,  41 ]; // #0b1929 — dark navy
const TEAL = [0,  194, 209 ]; // #00C2D1 — teal ECG line
const BLUE = [77, 163, 255 ]; // #4da3ff — QRS peak dot

// ECG polyline in base 192×192 coordinate space
const BASE_PTS = [
  [18,96],[62,96],[74,110],[86,44],[94,118],[102,96],[118,72],[138,96],[174,96]
];
const QRS_PEAK_IDX = 3; // index of the highest spike point

function renderIcon(size) {
  const s  = size / 192;                   // uniform scale from 192 base
  const cr = Math.round(40 * s);           // corner radius
  const hw = 4.25 * s;                     // ECG stroke half-width (stroke-width 8.5 / 2)
  const dr = 5.5  * s;                     // QRS dot radius

  const pts  = BASE_PTS.map(([x,y]) => [x*s, y*s]);
  const dotX = pts[QRS_PEAK_IDX][0];
  const dotY = pts[QRS_PEAK_IDX][1];

  return function getPixel(px, py) {
    // Outside rounded rect → fully transparent
    if (!inRRect(px, py, size, cr)) return [0, 0, 0, 0];

    let rgb = [...BG];

    // Render ECG segments (teal line)
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1,y1] = pts[i], [x2,y2] = pts[i+1];
      const alpha = strokeAlpha(distToSeg(px, py, x1, y1, x2, y2), hw);
      if (alpha > 0) rgb = over(TEAL, alpha, rgb);
    }

    // Render QRS peak dot (blue, 90% opacity)
    const dotAlpha = strokeAlpha(Math.hypot(px-dotX, py-dotY), dr);
    if (dotAlpha > 0) rgb = over(BLUE, Math.round(dotAlpha * 0.9), rgb);

    return [...rgb, 255];
  };
}

// ── Main: generate all three icons ──────────────────────────────────────────

const OUT = path.join(__dirname, 'frontend', 'public');

const ICONS = [
  { file: 'icon-192.png',          size: 192 },
  { file: 'icon-512.png',          size: 512 },
  { file: 'apple-touch-icon.png',  size: 180 },
];

for (const { file, size } of ICONS) {
  process.stdout.write(`Generating ${file} (${size}×${size})... `);
  const buf = encodePNG(size, renderIcon(size));
  fs.writeFileSync(path.join(OUT, file), buf);
  console.log(`done  ${(buf.length / 1024).toFixed(1)} KB`);
}

console.log('\nAll icons written to frontend/public/');
