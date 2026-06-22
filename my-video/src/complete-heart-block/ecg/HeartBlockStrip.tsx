import React from "react";
import { useCurrentFrame } from "remotion";

// ─── Complete Heart Block ECG path generators ─────────────────────────────────
//
// Two independent rhythms rendered as separate SVG layers:
//   1. Atrial  — P waves at ~75 bpm  (pCycleW  ≈ 108 px at 4.5 px/frame)
//   2. Ventricular — wide QRS+T at ~35 bpm (qrsCycleW ≈ 231 px)
//
// The cycle widths share no harmonic, so the P waves naturally march through
// QRS complexes without repeating for thousands of pixels — exactly the
// defining visual feature of complete (3rd-degree) AV block.

// ─── P-wave path (atrial) ─────────────────────────────────────────────────────
function buildPWavePath(
  scrollX: number,
  canvasW: number,
  cy: number,
  cycleW: number,
  amp: number,      // height above baseline (px)
  pWidth: number,   // total width of one P bump (px)
): string {
  const startCycle = Math.floor(-scrollX / cycleW) - 1;
  const endCycle   = Math.ceil((-scrollX + canvasW) / cycleW) + 1;

  const segs: string[] = [];

  for (let c = startCycle; c <= endCycle; c++) {
    const ox = c * cycleW + scrollX;
    const pw = pWidth;
    const px = ox + (cycleW - pw) / 2; // center the bump in the cycle

    if (c === startCycle) {
      segs.push(`M ${ox},${cy}`);
    } else {
      segs.push(`L ${ox},${cy}`);
    }

    // Flat before P
    segs.push(`L ${px},${cy}`);
    // Smooth bell curve: gradual rise, peak, gradual fall
    segs.push(`C ${px + pw * 0.18},${cy} ${px + pw * 0.38},${cy - amp} ${px + pw * 0.50},${cy - amp}`);
    segs.push(`C ${px + pw * 0.62},${cy - amp} ${px + pw * 0.82},${cy} ${px + pw},${cy}`);
    // Flat after P to end of cycle
    segs.push(`L ${ox + cycleW},${cy}`);
  }

  return segs.join(" ");
}

// ─── QRS + T-wave path (ventricular escape) ───────────────────────────────────
function buildQRSTPath(
  scrollX: number,
  canvasW: number,
  cy: number,
  cycleW: number,
  qrsH: number,     // R-peak height above baseline
  qrsW: number,     // total width of QRS complex
  tAmp: number,     // T-wave height
  tWidth: number,   // T-wave width
): string {
  const startCycle = Math.floor(-scrollX / cycleW) - 1;
  const endCycle   = Math.ceil((-scrollX + canvasW) / cycleW) + 1;

  const segs: string[] = [];

  for (let c = startCycle; c <= endCycle; c++) {
    const ox = c * cycleW + scrollX;

    if (c === startCycle) {
      segs.push(`M ${ox},${cy}`);
    } else {
      segs.push(`L ${ox},${cy}`);
    }

    // Position QRS in the first third of the cycle
    const qx = ox + cycleW * 0.18;

    // Flat PR segment
    segs.push(`L ${qx},${cy}`);

    // Q wave — small dip
    segs.push(`L ${qx + qrsW * 0.12},${cy + qrsH * 0.08}`);

    // R peak — tall sharp spike (wide complex — more gradual than normal)
    segs.push(`L ${qx + qrsW * 0.28},${cy - qrsH}`);

    // S wave — dip below baseline
    segs.push(`L ${qx + qrsW * 0.60},${cy + qrsH * 0.22}`);

    // Return to baseline (wide complex — slow return)
    segs.push(`C ${qx + qrsW * 0.78},${cy + qrsH * 0.22} ${qx + qrsW * 0.92},${cy} ${qx + qrsW},${cy}`);

    // ST segment
    const stEnd = qx + qrsW + cycleW * 0.08;
    segs.push(`L ${stEnd},${cy}`);

    // T wave — broad, slightly elevated (concordant in escape rhythm)
    const tx = stEnd;
    segs.push(`C ${tx + tWidth * 0.12},${cy} ${tx + tWidth * 0.35},${cy - tAmp} ${tx + tWidth * 0.50},${cy - tAmp}`);
    segs.push(`C ${tx + tWidth * 0.65},${cy - tAmp} ${tx + tWidth * 0.88},${cy} ${tx + tWidth},${cy}`);

    // Flat to end of cycle
    segs.push(`L ${ox + cycleW},${cy}`);
  }

  return segs.join(" ");
}

// ─── ECG paper grid ───────────────────────────────────────────────────────────
function EcgGrid({
  w, h, gridLg = 100, gridSm = 20,
}: { w: number; h: number; gridLg?: number; gridSm?: number }) {
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

  const color   = "rgba(10,191,188,0.09)";
  const colorSm = "rgba(10,191,188,0.04)";

  return (
    <g>
      {linesSmV.map(x => <line key={`sv${x}`} x1={x} y1={0} x2={x} y2={h} stroke={colorSm} strokeWidth={0.5} />)}
      {linesSmH.map(y => <line key={`sh${y}`} x1={0} y1={y} x2={w} y2={y} stroke={colorSm} strokeWidth={0.5} />)}
      {linesLgV.map(x => <line key={`lv${x}`} x1={x} y1={0} x2={x} y2={h} stroke={color}   strokeWidth={1} />)}
      {linesLgH.map(y => <line key={`lh${y}`} x1={0} y1={y} x2={w} y2={y} stroke={color}   strokeWidth={1} />)}
    </g>
  );
}

// ─── HeartBlockStrip component ────────────────────────────────────────────────

interface HeartBlockStripProps {
  width?:        number;
  height?:       number;
  scrollSpeed?:  number;
  // Atrial rhythm (P waves)
  pCycleW?:      number;   // px per P-P interval — default 108 ≈ 75 bpm
  pAmp?:         number;   // P wave height
  pWidth?:       number;   // P wave bump width
  // Ventricular escape rhythm (QRS)
  qrsCycleW?:   number;   // px per RR interval  — default 231 ≈ 35 bpm
  qrsH?:         number;   // R-peak height
  qrsW?:         number;   // QRS complex width (wide = ventricular origin)
  tAmp?:         number;
  tWidth?:       number;
  // Visual
  pColor?:       string;
  qrsColor?:     string;
  showGrid?:     boolean;
  opacity?:      number;
  frameOffset?:  number;
}

export const HeartBlockStrip: React.FC<HeartBlockStripProps> = ({
  width       = 1080,
  height      = 340,
  scrollSpeed = 4.5,
  pCycleW     = 108,
  pAmp        = 14,
  pWidth      = 14,
  qrsCycleW   = 231,
  qrsH        = 96,
  qrsW        = 36,
  tAmp        = 22,
  tWidth      = 38,
  pColor      = "#0ABFBC",
  qrsColor    = "#F2B94B",
  showGrid    = true,
  opacity     = 1,
  frameOffset = 0,
}) => {
  const frame = useCurrentFrame();
  const cy    = height / 2 + 10; // slight offset — more room above for R peak

  const scrollOffset = ((frame + frameOffset) * scrollSpeed);

  // Both rhythms share the same scroll speed but different cycle widths,
  // producing natural dissociation — P waves march through QRS complexes.
  const scrollXP   = -(scrollOffset % pCycleW);
  const scrollXQRS = -(scrollOffset % qrsCycleW);

  const pPath   = buildPWavePath(scrollXP,   width, cy, pCycleW,  pAmp,  pWidth);
  const qrsPath = buildQRSTPath( scrollXQRS, width, cy, qrsCycleW, qrsH, qrsW, tAmp, tWidth);

  const glowP   = pColor.replace(")", ", 0.30)").replace("rgb(", "rgba(");
  const glowQRS = "#F2B94B44";

  return (
    <svg
      width={width}
      height={height}
      style={{ overflow: "hidden", opacity, display: "block" }}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <filter id="chb-glow-p" x="-20%" y="-80%" width="140%" height="260%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="chb-glow-qrs" x="-20%" y="-80%" width="140%" height="260%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="chb-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="black" stopOpacity="1" />
          <stop offset="6%"   stopColor="black" stopOpacity="0" />
          <stop offset="94%"  stopColor="black" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="1" />
        </linearGradient>
        <mask id="chb-edge-fade">
          <rect x="0" y="0" width={width} height={height} fill="url(#chb-fade)" />
        </mask>
      </defs>

      {showGrid && <EcgGrid w={width} h={height} />}

      {/* Baseline */}
      <line
        x1={0} y1={cy} x2={width} y2={cy}
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={1}
      />

      {/* ── P wave glow layer ── */}
      <path
        d={pPath}
        fill="none"
        stroke={`rgba(10,191,188,0.18)`}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        mask="url(#chb-edge-fade)"
      />

      {/* ── P wave main layer ── */}
      <path
        d={pPath}
        fill="none"
        stroke={pColor}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#chb-glow-p)"
        mask="url(#chb-edge-fade)"
      />

      {/* ── QRS glow layer ── */}
      <path
        d={qrsPath}
        fill="none"
        stroke={glowQRS}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
        mask="url(#chb-edge-fade)"
      />

      {/* ── QRS main layer ── */}
      <path
        d={qrsPath}
        fill="none"
        stroke={qrsColor}
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#chb-glow-qrs)"
        mask="url(#chb-edge-fade)"
      />
    </svg>
  );
};
