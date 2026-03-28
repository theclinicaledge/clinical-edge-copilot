#!/usr/bin/env node
/**
 * generate-icons.js
 * Generates PWA PNG icons for Clinical Edge Copilot from the real brand logo.
 * No external dependencies — uses only Node.js built-ins (zlib, fs, path).
 *
 * Usage (from repo root):  node generate-icons.js
 *
 * Output:
 *   frontend/public/icon-192.png            (192×192)
 *   frontend/public/icon-512.png            (512×512)
 *   frontend/public/apple-touch-icon-v2.png (180×180)
 */

'use strict';
const zlib = require('zlib');
const fs   = require('fs');
const path = require('path');

// ── PNG Decoder ───────────────────────────────────────────────────────────────
// Reads an RGBA PNG file and returns { width, height, bpp, pixels: Uint8Array }.
// Handles all five PNG row filter types (None, Sub, Up, Average, Paeth).

function decodePNG(filePath) {
  const buf    = fs.readFileSync(filePath);
  const width  = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const bpp    = 4; // source is always RGBA

  // Collect IDAT chunks
  const idatBufs = [];
  let i = 8;
  while (i < buf.length) {
    const len  = buf.readUInt32BE(i);
    const type = buf.slice(i + 4, i + 8).toString('ascii');
    if (type === 'IDAT') idatBufs.push(buf.slice(i + 8, i + 8 + len));
    if (type === 'IEND') break;
    i += 12 + len;
  }

  const raw    = zlib.inflateSync(Buffer.concat(idatBufs));
  const rowLen = 1 + width * bpp;
  const pixels = new Uint8Array(height * width * bpp);

  for (let y = 0; y < height; y++) {
    const filter = raw[y * rowLen];
    for (let x = 0; x < width; x++) {
      for (let c = 0; c < bpp; c++) {
        const rawByte = raw[y * rowLen + 1 + x * bpp + c];
        const a = x > 0             ? pixels[(y * width + x - 1) * bpp + c]       : 0;
        const b = y > 0             ? pixels[((y - 1) * width + x) * bpp + c]     : 0;
        const d = (y > 0 && x > 0) ? pixels[((y - 1) * width + x - 1) * bpp + c] : 0;
        let val;
        switch (filter) {
          case 0: val = rawByte;                                break; // None
          case 1: val = rawByte + a;                           break; // Sub
          case 2: val = rawByte + b;                           break; // Up
          case 3: val = rawByte + Math.floor((a + b) / 2);    break; // Average
          default: {                                                   // Paeth
            const p  = a + b - d;
            const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - d);
            val = rawByte + (pa <= pb && pa <= pc ? a : pb <= pc ? b : d);
          }
        }
        pixels[(y * width + x) * bpp + c] = val & 0xFF;
      }
    }
  }

  return { width, height, bpp, pixels };
}

// ── PNG Encoder ───────────────────────────────────────────────────────────────

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

function encodePNG(width, height, pixels) {
  const rowLen = 1 + width * 4;
  const raw    = Buffer.alloc(height * rowLen, 0);
  for (let y = 0; y < height; y++) {
    raw[y * rowLen] = 0; // filter: None
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = y * rowLen + 1 + x * 4;
      raw[dst]     = pixels[src];
      raw[dst + 1] = pixels[src + 1];
      raw[dst + 2] = pixels[src + 2];
      raw[dst + 3] = pixels[src + 3];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── Bilinear Resize + Pad ─────────────────────────────────────────────────────
// Centres the source image on a solid background canvas with equal padding.
// Uses bilinear interpolation for clean downsampling.

function renderIcon(src, canvasSize, padFraction, bg) {
  const logoArea = canvasSize * (1 - 2 * padFraction);
  const scale    = Math.min(logoArea / src.width, logoArea / src.height);
  const logoW    = src.width  * scale;
  const logoH    = src.height * scale;
  const offX     = (canvasSize - logoW) / 2;
  const offY     = (canvasSize - logoH) / 2;

  const out = new Uint8Array(canvasSize * canvasSize * 4);

  for (let py = 0; py < canvasSize; py++) {
    for (let px = 0; px < canvasSize; px++) {
      const idx = (py * canvasSize + px) * 4;

      // Map canvas pixel back to source coords
      const sx = (px - offX) / scale;
      const sy = (py - offY) / scale;

      // Outside the logo area → solid background
      if (sx < 0 || sy < 0 || sx >= src.width || sy >= src.height) {
        out[idx]     = bg[0];
        out[idx + 1] = bg[1];
        out[idx + 2] = bg[2];
        out[idx + 3] = 255;
        continue;
      }

      // Bilinear interpolation from source pixels
      const x0 = Math.floor(sx), y0 = Math.floor(sy);
      const x1 = Math.min(x0 + 1, src.width  - 1);
      const y1 = Math.min(y0 + 1, src.height - 1);
      const fx = sx - x0, fy = sy - y0;

      const p00 = (y0 * src.width + x0) * src.bpp;
      const p01 = (y0 * src.width + x1) * src.bpp;
      const p10 = (y1 * src.width + x0) * src.bpp;
      const p11 = (y1 * src.width + x1) * src.bpp;

      for (let c = 0; c < 3; c++) {
        const top    = src.pixels[p00 + c] * (1 - fx) + src.pixels[p01 + c] * fx;
        const bottom = src.pixels[p10 + c] * (1 - fx) + src.pixels[p11 + c] * fx;
        out[idx + c] = Math.round(top * (1 - fy) + bottom * fy);
      }
      out[idx + 3] = 255;
    }
  }

  return out;
}

// ── Main ──────────────────────────────────────────────────────────────────────

const SOURCE = path.join(
  '/Users/mohamed/Desktop/The Clinical Edge/Copilot/Logo',
  'clinical-edge-symbol800.png'
);
const PUBLIC = path.join(__dirname, 'frontend', 'public');

const BG  = [11, 25, 41]; // #0b1929 — app dark navy
const PAD = 0.15;          // 15% padding each side → logo fills 70% of canvas

const ICONS = [
  { file: 'icon-192.png',            size: 192 },
  { file: 'icon-512.png',            size: 512 },
  { file: 'apple-touch-icon-v2.png', size: 180 },
];

console.log('Reading source logo…');
const src = decodePNG(SOURCE);
console.log(`  ${src.width}×${src.height} RGBA  ✓\n`);

for (const { file, size } of ICONS) {
  process.stdout.write(`Generating  ${file}  (${size}×${size})… `);
  const pixels = renderIcon(src, size, PAD, BG);
  const buf    = encodePNG(size, size, pixels);
  fs.writeFileSync(path.join(PUBLIC, file), buf);
  console.log(`done  ${(buf.length / 1024).toFixed(1)} KB`);
}

console.log('\nAll icons written to frontend/public/');
