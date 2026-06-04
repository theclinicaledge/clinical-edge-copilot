import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

// ─── Port of frontend buildAFlutter() ────────────────────────────────────────
// Generates the exact same atrial flutter waveform as the Rhythm Lab frontend,
// but scaled to arbitrary (W, H) dimensions.
//
// Original: W=800, H=100, B=65 (baseline y), fw=22 (flutter wave width px)
// Here: x-scale = W/800, y-amplitudes tuned for video scale
//
// Y-amplitude tuning (independent from x-scale):
//   rAmp  = R wave height above baseline = H * 0.285
//   sAmp  = S wave depth below baseline  = H * 0.055
//   fAmp  = Flutter wave above baseline  = H * 0.110
//   cAmp  = Pre-QRS coupling bump        = H * 0.022

function r(n: number): number {
  return Math.round(n * 10) / 10;
}

export function buildFlutterPath(W: number, H: number): string {
  const B     = H * 0.62;        // baseline — 62% from top
  const sx    = W / 800;         // x scale factor
  const fw    = 22 * sx;         // flutter wave width (px)

  // Y amplitudes — tuned for readability at video scale
  const rAmp  = H * 0.285;       // R peak above baseline
  const sAmp  = H * 0.055;       // S dip below baseline
  const cAmp  = H * 0.022;       // Q/coupling dip below baseline
  const fAmp  = H * 0.110;       // flutter wave above baseline

  const parts: string[] = [`M 0,${r(B)}`];
  let x  = 0;
  let fc = 0;

  while (x < W) {
    if (fc % 4 === 0) {
      // ── Narrow QRS on conduction beat ─────────────────────────────────────
      const qEnd = x + 43 * sx;
      if (qEnd > W) break;
      parts.push(
        `L ${r(x + 2*sx)},${r(B + cAmp)}`,           // tiny Q dip
        `L ${r(x + 5*sx)},${r(B - rAmp)}`,            // R peak
        `L ${r(x + 9*sx)},${r(B + sAmp)}`,            // S nadir
        `C ${r(x+12*sx)},${r(B+sAmp)} ${r(x+15*sx)},${r(B)} ${r(x+19*sx)},${r(B)}`,
        `L ${r(qEnd)},${r(B)}`,                        // ST → next flutter
      );
      x = qEnd;
    } else {
      // ── Sawtooth flutter wave — pure linear ramp up → sharp drop ──────────
      const fEnd = x + fw;
      if (fEnd > W) break;
      parts.push(
        `L ${r(x + fw*0.76)},${r(B - fAmp)}`,         // gradual rise to peak
        `L ${r(fEnd)},${r(B)}`,                        // near-vertical drop
      );
      x = fEnd;
    }
    fc++;
  }

  parts.push(`L ${W},${r(B)}`);
  return parts.join(' ');
}

// ─── ECG paper grid ───────────────────────────────────────────────────────────
// Matches Rhythm Lab frontend grid colors exactly.
function EcgGrid({ W, H }: { W: number; H: number }) {
  // Scale grid spacing with x dimension for correct ECG proportions
  const minor = Math.round(W / 54);   // ~20px at W=1080
  const major = minor * 5;            // ~100px large squares

  const vMinor: number[] = [];
  const vMajor: number[] = [];
  const hMinor: number[] = [];
  const hMajor: number[] = [];

  for (let x = 0; x <= W; x += minor) {
    if (x % major === 0) vMajor.push(x); else vMinor.push(x);
  }
  for (let y = 0; y <= H; y += minor) {
    if (y % major === 0) hMajor.push(y); else hMinor.push(y);
  }

  return (
    <g>
      {vMinor.map(x => <line key={`vm${x}`} x1={x} y1={0} x2={x} y2={H} stroke="#1E2D3E" strokeWidth={0.6} />)}
      {hMinor.map(y => <line key={`hm${y}`} x1={0} y1={y} x2={W} y2={y} stroke="#1E2D3E" strokeWidth={0.6} />)}
      {vMajor.map(x => <line key={`vM${x}`} x1={x} y1={0} x2={x} y2={H} stroke="#2D3B4E" strokeWidth={1.0} />)}
      {hMajor.map(y => <line key={`hM${y}`} x1={0} y1={y} x2={W} y2={y} stroke="#2D3B4E" strokeWidth={1.0} />)}
    </g>
  );
}

// ─── AppFlutterStrip ──────────────────────────────────────────────────────────

interface Props {
  width: number;
  height: number;
  // Frames over which the strip reveals left-to-right (sweep animation)
  sweepStartFrame?: number;
  sweepDurationFrames?: number;
  // Static mode: skip sweep, show full strip immediately
  staticStrip?: boolean;
}

export const AppFlutterStrip: React.FC<Props> = ({
  width,
  height,
  sweepStartFrame   = 0,
  sweepDurationFrames = 60,
  staticStrip = false,
}) => {
  const frame = useCurrentFrame();
  const uid   = "afs";

  const d = buildFlutterPath(width, height);

  // Sweep reveal: a clip-rect grows from x=0 to x=width
  const sweepProgress = staticStrip
    ? 1
    : interpolate(frame, [sweepStartFrame, sweepStartFrame + sweepDurationFrames], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
  const clipW = width * sweepProgress;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block", overflow: "hidden" }}
    >
      <defs>
        {/* Glow filter — matches Rhythm Lab frontend */}
        <filter id={`${uid}-glow`} x="-10%" y="-80%" width="120%" height="260%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Edge fade — matches Rhythm Lab frontend */}
        <linearGradient id={`${uid}-fade`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#111827" stopOpacity="0" />
          <stop offset="70%"  stopColor="#111827" stopOpacity="0" />
          <stop offset="100%" stopColor="#111827" stopOpacity="1" />
        </linearGradient>

        {/* Sweep clip — reveals the strip left-to-right */}
        <clipPath id={`${uid}-sweep`}>
          <rect x={0} y={0} width={clipW} height={height} />
        </clipPath>
      </defs>

      {/* ECG grid */}
      <EcgGrid W={width} H={height} />

      {/* Baseline dashed rule — matches real app */}
      <line
        x1={0} y1={height * 0.62}
        x2={width} y2={height * 0.62}
        stroke="#2D3B4E" strokeWidth={0.8} strokeDasharray="5 5"
      />

      {/* Waveform group — clipped to sweep */}
      <g clipPath={`url(#${uid}-sweep)`}>
        {/* Glow layer */}
        <path
          d={d} fill="none"
          stroke="rgba(10,191,188,0.30)"
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Main waveform */}
        <path
          d={d} fill="none"
          stroke="#0ABFBC"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${uid}-glow)`}
        />
        {/* Edge fade overlay */}
        <rect width={width} height={height} fill={`url(#${uid}-fade)`} />
      </g>
    </svg>
  );
};
