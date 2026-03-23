#!/usr/bin/env node
/**
 * generate-icons-from-svg.js
 * Generates PNG icons from the inline CELogo SVG paths (Landing.jsx / App.jsx / logo.svg).
 * Zero external dependencies — Node.js built-ins only.
 *
 * Usage: node generate-icons-from-svg.js
 */
'use strict';
const zlib = require('zlib');
const fs   = require('fs');
const path = require('path');

// ── SVG Arc → Polyline (W3C spec arc-to-center transform) ─────────────────────
function arcToPoints(x1, y1, rx, ry, xDeg, largeArc, sweep, x2, y2, segs) {
  segs = segs || 500;
  if (x1 === x2 && y1 === y2) return [[x1, y1]];
  const phi = xDeg * Math.PI / 180;
  const cp = Math.cos(phi), sp = Math.sin(phi);
  const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2;
  const x1p =  cp * dx + sp * dy;
  const y1p = -sp * dx + cp * dy;
  const x1pSq = x1p * x1p, y1pSq = y1p * y1p;
  let rxSq = rx * rx, rySq = ry * ry;
  const lam = x1pSq / rxSq + y1pSq / rySq;
  if (lam > 1) { const s = Math.sqrt(lam); rx *= s; ry *= s; rxSq = rx*rx; rySq = ry*ry; }
  const num = Math.max(0, rxSq*rySq - rxSq*y1pSq - rySq*x1pSq);
  const den = rxSq*y1pSq + rySq*x1pSq;
  const sq  = den > 0 ? Math.sqrt(num / den) : 0;
  const k   = (largeArc !== sweep ? 1 : -1) * sq;
  const cxp = k *  rx * y1p / ry;
  const cyp = k * -ry * x1p / rx;
  const cx  = cp*cxp - sp*cyp + (x1+x2)/2;
  const cy  = sp*cxp + cp*cyp + (y1+y2)/2;
  function va(ux, uy, vx, vy) {
    const mag = Math.sqrt((ux*ux+uy*uy)*(vx*vx+vy*vy));
    if (!mag) return 0;
    let a = Math.acos(Math.max(-1, Math.min(1, (ux*vx+uy*vy)/mag)));
    if (ux*vy - uy*vx < 0) a = -a;
    return a;
  }
  const sa = va(1, 0, (x1p-cxp)/rx, (y1p-cyp)/ry);
  let   da = va((x1p-cxp)/rx, (y1p-cyp)/ry, (-x1p-cxp)/rx, (-y1p-cyp)/ry);
  if (!sweep && da > 0) da -= 2*Math.PI;
  if ( sweep && da < 0) da += 2*Math.PI;
  const pts = [];
  for (let i = 0; i <= segs; i++) {
    const a = sa + (i/segs)*da;
    pts.push([
      cp*rx*Math.cos(a) - sp*ry*Math.sin(a) + cx,
      sp*rx*Math.cos(a) + cp*ry*Math.sin(a) + cy
    ]);
  }
  return pts;
}

// ── Scanline polygon fill (even-odd rule) ─────────────────────────────────────
function fillPolygon(buf, W, H, pts, r, g, b) {
  let minY = Infinity, maxY = -Infinity;
  for (const [, py] of pts) { if (py < minY) minY = py; if (py > maxY) maxY = py; }
  const n = pts.length;
  for (let y = Math.max(0, Math.floor(minY)); y <= Math.min(H-1, Math.ceil(maxY)); y++) {
    const xs = [];
    for (let i = 0; i < n; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[(i+1)%n];
      if ((ay <= y && by > y) || (by <= y && ay > y))
        xs.push(ax + (y - ay) / (by - ay) * (bx - ax));
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i+1 < xs.length; i += 2) {
      const xa = Math.max(0, Math.ceil(xs[i]));
      const xb = Math.min(W-1, Math.floor(xs[i+1]));
      for (let x = xa; x <= xb; x++) {
        const idx = (y*W+x)*4;
        buf[idx]=r; buf[idx+1]=g; buf[idx+2]=b; buf[idx+3]=255;
      }
    }
  }
}

// ── Render CE logo on a square canvas ────────────────────────────────────────
// Source: CELogo in Landing.jsx / inline SVG in App.jsx / frontend/public/logo.svg
// ViewBox: 0 0 225 200   Fill: #00C2D1   Background: #0B1F2A
function renderLogo(size) {
  const PAD = 0.10, VW = 225, VH = 200;
  const area  = size * (1 - 2*PAD);
  const scale = Math.min(area/VW, area/VH);
  const offX  = (size - VW*scale) / 2;
  const offY  = (size - VH*scale) / 2;
  const T = ([x, y]) => [x*scale+offX, y*scale+offY];

  const BG = [11, 31, 42];    // #0B1F2A
  const FG = [0, 194, 209];   // #00C2D1

  const buf = new Uint8Array(size*size*4);
  for (let i = 0; i < size*size; i++) {
    buf[i*4]=BG[0]; buf[i*4+1]=BG[1]; buf[i*4+2]=BG[2]; buf[i*4+3]=255;
  }

  // Path 1 — C-shape:
  // M 159.1,24.3 A 96,96 0 1,0 159.1,175.7 L 135.7,145.7 A 58,58 0 1,1 135.7,54.3 Z
  const outerArc = arcToPoints(159.1,24.3, 96,96, 0, 1,0, 159.1,175.7);
  const innerArc = arcToPoints(135.7,145.7, 58,58, 0, 1,1, 135.7,54.3);
  fillPolygon(buf, size, size, [...outerArc, ...innerArc].map(T), ...FG);

  // Paths 2–4 — Arrows:
  [
    [[144.0,57],[208,45],[218,58],[208,70],[150.0,71]],
    [[158.0,92],[215,82],[225,95],[215,107],[158.0,108]],
    [[150.0,129],[208,130],[218,142],[208,155],[144.0,143]],
  ].forEach(pts => fillPolygon(buf, size, size, pts.map(T), ...FG));

  return buf;
}

// ── Box-filter downsample ─────────────────────────────────────────────────────
function downsample(src, sW, sH, dW, dH) {
  const dst = new Uint8Array(dW*dH*4);
  const sx = sW/dW, sy = sH/dH;
  for (let dy = 0; dy < dH; dy++) {
    for (let dx = 0; dx < dW; dx++) {
      let r=0,g=0,b=0,a=0,n=0;
      const x0=Math.round(dx*sx), x1=Math.round((dx+1)*sx);
      const y0=Math.round(dy*sy), y1=Math.round((dy+1)*sy);
      for (let iy=y0; iy<y1; iy++) for (let ix=x0; ix<x1; ix++) {
        const i=(iy*sW+ix)*4;
        r+=src[i]; g+=src[i+1]; b+=src[i+2]; a+=src[i+3]; n++;
      }
      const o=(dy*dW+dx)*4;
      dst[o]=Math.round(r/n); dst[o+1]=Math.round(g/n);
      dst[o+2]=Math.round(b/n); dst[o+3]=Math.round(a/n);
    }
  }
  return dst;
}

// ── PNG encoder ───────────────────────────────────────────────────────────────
function crc32(buf) {
  let c=0xFFFFFFFF;
  for (let i=0;i<buf.length;i++){c^=buf[i];for(let j=0;j<8;j++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);}
  return (c^0xFFFFFFFF)>>>0;
}
function chunk(type, data) {
  const t=Buffer.from(type,'ascii'), l=Buffer.alloc(4), c=Buffer.alloc(4);
  l.writeUInt32BE(data.length); c.writeUInt32BE(crc32(Buffer.concat([t,data])));
  return Buffer.concat([l,t,data,c]);
}
function encodePNG(w, h, pixels) {
  const rl=1+w*4, raw=Buffer.alloc(h*rl,0);
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){
    const s=(y*w+x)*4, d=y*rl+1+x*4;
    raw[d]=pixels[s];raw[d+1]=pixels[s+1];raw[d+2]=pixels[s+2];raw[d+3]=pixels[s+3];
  }
  const ihdr=Buffer.alloc(13);
  ihdr.writeUInt32BE(w,0);ihdr.writeUInt32BE(h,4);ihdr[8]=8;ihdr[9]=6;
  return Buffer.concat([
    Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]),
    chunk('IHDR',ihdr),
    chunk('IDAT',zlib.deflateSync(raw,{level:9})),
    chunk('IEND',Buffer.alloc(0)),
  ]);
}

// ── Main ──────────────────────────────────────────────────────────────────────
const PUBLIC = path.join(__dirname, 'frontend', 'public');
const SUPER  = 4; // supersampling factor

const ICONS = [
  { file: 'favicon.png',             size: 32  },
  { file: 'icon-192.png',            size: 192 },
  { file: 'icon-512.png',            size: 512 },
  { file: 'apple-touch-icon-v2.png', size: 180 },
];

console.log('Source: CELogo SVG paths (Landing.jsx / App.jsx / logo.svg)\n');

for (const { file, size } of ICONS) {
  process.stdout.write(`Generating  ${file}  (${size}×${size})… `);
  const hi  = SUPER * size;
  const raw = renderLogo(hi);
  const px  = downsample(raw, hi, hi, size, size);
  const buf = encodePNG(size, size, px);
  fs.writeFileSync(path.join(PUBLIC, file), buf);
  console.log(`done  ${(buf.length/1024).toFixed(1)} KB`);
}

console.log('\nAll icons written to frontend/public/');
