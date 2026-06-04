import React from "react";
import { useCurrentFrame } from "remotion";

// ─── Atrial flutter path generator ───────────────────────────────────────────
// Generates an SVG path string for an atrial flutter ECG pattern.
// One "cycle" = one ventricular RR interval = 2 flutter waves + 1 QRS complex.
//
// Visual characteristics:
//   • Sawtooth flutter waves: gradual dome up → sharp fall (no isoelectric gap)
//   • QRS spike embedded in every 2nd flutter wave
//   • Narrow QRS (characteristic of AV-nodal conduction)
//   • Small T wave partially buried in next flutter wave

function buildFlutterPath(
  scrollX: number,   // current scroll offset (px, increases over time)
  canvasW: number,   // total path canvas width
  cy: number,        // center Y baseline
  cycleW: number,    // one complete RR interval width (px)
  fAmp: number,      // flutter wave amplitude (px above/below baseline)
  qrsH: number,      // QRS spike height above baseline
): string {
  const hw = cycleW / 2; // one flutter wave = half cycle

  // Cover the canvas with extra cycles on each side so scroll never shows a gap
  const startCycle = Math.floor(-scrollX / cycleW) - 1;
  const endCycle   = Math.ceil((-scrollX + canvasW) / cycleW) + 1;

  const segs: string[] = [];

  for (let c = startCycle; c <= endCycle; c++) {
    const ox = c * cycleW + scrollX; // x-origin of this cycle in canvas coords

    // ── Flutter wave 1 — pure sawtooth, no QRS ──
    // Dome ascent (gradual)
    if (c === startCycle) {
      segs.push(`M ${ox},${cy}`);
    }
    segs.push(`C ${ox + hw*0.18},${cy} ${ox + hw*0.62},${cy - fAmp} ${ox + hw*0.72},${cy - fAmp}`);
    // Sharp fall (the defining sawtooth characteristic)
    segs.push(`L ${ox + hw*0.88},${cy + fAmp * 0.32}`);
    segs.push(`L ${ox + hw},${cy}`);

    // ── Flutter wave 2 — QRS embedded at ascending peak ──
    const f2x = ox + hw;
    // Flutter ascent toward QRS
    segs.push(`C ${f2x + hw*0.16},${cy} ${f2x + hw*0.50},${cy - fAmp*0.70} ${f2x + hw*0.58},${cy - fAmp*0.58}`);
    // QRS spike
    segs.push(`L ${f2x + hw*0.61},${cy - qrsH}`);           // R peak
    segs.push(`L ${f2x + hw*0.66},${cy + qrsH * 0.45}`);    // S wave
    segs.push(`L ${f2x + hw*0.70},${cy}`);                   // return
    // T wave (small, partially merged into next flutter)
    segs.push(`C ${f2x + hw*0.74},${cy} ${f2x + hw*0.84},${cy - fAmp*0.38} ${f2x + hw*0.89},${cy - fAmp*0.38}`);
    segs.push(`C ${f2x + hw*0.94},${cy - fAmp*0.38} ${f2x + hw*0.98},${cy} ${ox + cycleW},${cy}`);
  }

  return segs.join(" ");
}

// ─── ECG paper grid ───────────────────────────────────────────────────────────
// Large squares at gridLg intervals, small squares at gridSm.
function EcgGrid({
  w, h, gridLg = 100, gridSm = 20,
  color = "rgba(10,191,188,0.08)",
  colorSm = "rgba(10,191,188,0.04)",
}: {
  w: number; h: number;
  gridLg?: number; gridSm?: number;
  color?: string; colorSm?: string;
}) {
  const linesLgV: number[] = [];
  const linesLgH: number[] = [];
  for (let x = 0; x <= w; x += gridLg) linesLgV.push(x);
  for (let y = 0; y <= h; y += gridLg) linesLgH.push(y);

  const linesSmV: number[] = [];
  const linesSmH: number[] = [];
  for (let x = 0; x <= w; x += gridSm) {
    if (x % gridLg !== 0) linesSmV.push(x);
  }
  for (let y = 0; y <= h; y += gridSm) {
    if (y % gridLg !== 0) linesSmH.push(y);
  }

  return (
    <g>
      {linesSmV.map(x => <line key={`sv${x}`} x1={x} y1={0} x2={x} y2={h} stroke={colorSm} strokeWidth={0.5} />)}
      {linesSmH.map(y => <line key={`sh${y}`} x1={0} y1={y} x2={w} y2={y} stroke={colorSm} strokeWidth={0.5} />)}
      {linesLgV.map(x => <line key={`lv${x}`} x1={x} y1={0} x2={x} y2={h} stroke={color} strokeWidth={1} />)}
      {linesLgH.map(y => <line key={`lh${y}`} x1={0} y1={y} x2={w} y2={y} stroke={color} strokeWidth={1} />)}
    </g>
  );
}

// ─── RhythmStrip component ────────────────────────────────────────────────────

interface RhythmStripProps {
  width?: number;
  height?: number;
  scrollSpeed?: number;   // px per frame
  cycleW?: number;        // px per RR interval
  fAmp?: number;          // flutter amplitude
  qrsH?: number;          // QRS height
  strokeColor?: string;
  strokeWidth?: number;
  glowColor?: string;
  showGrid?: boolean;
  opacity?: number;
  frameOffset?: number;   // add to frame for phase offset
}

export const RhythmStrip: React.FC<RhythmStripProps> = ({
  width = 1080,
  height = 320,
  scrollSpeed = 4.5,
  cycleW = 280,
  fAmp = 52,
  qrsH = 118,
  strokeColor = "#0ABFBC",
  strokeWidth = 2.8,
  glowColor = "rgba(10,191,188,0.30)",
  showGrid = true,
  opacity = 1,
  frameOffset = 0,
}) => {
  const frame = useCurrentFrame();
  const cy = height / 2;

  // Scroll continuously — total x offset increases with frames
  const totalScroll = ((frame + frameOffset) * scrollSpeed) % cycleW;
  // Negate because strip moves left
  const scrollX = -totalScroll;

  const d = buildFlutterPath(scrollX, width, cy, cycleW, fAmp, qrsH);

  return (
    <svg
      width={width}
      height={height}
      style={{ overflow: "hidden", opacity, display: "block" }}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        {/* Glow filter for the waveform */}
        <filter id="rl-glow" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Fade-in / fade-out on left and right edges */}
        <linearGradient id="rl-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="black" stopOpacity="1" />
          <stop offset="5%"   stopColor="black" stopOpacity="0" />
          <stop offset="95%"  stopColor="black" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="1" />
        </linearGradient>
        <mask id="rl-edge-fade">
          <rect x="0" y="0" width={width} height={height} fill="url(#rl-fade)" />
        </mask>
      </defs>

      {/* ECG paper grid */}
      {showGrid && <EcgGrid w={width} h={height} />}

      {/* Waveform glow layer (blurred duplicate, low opacity) */}
      <path
        d={d}
        fill="none"
        stroke={glowColor}
        strokeWidth={strokeWidth * 3}
        strokeLinecap="round"
        strokeLinejoin="round"
        mask="url(#rl-edge-fade)"
      />

      {/* Main waveform */}
      <path
        d={d}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#rl-glow)"
        mask="url(#rl-edge-fade)"
      />
    </svg>
  );
};
