import { useState, useRef, useEffect } from 'react';

// ─── Calibration ─────────────────────────────────────────────────────────────
// Source of truth: RhythmStrip.tsx grid pattern
//   <pattern id="…-minor" width="20" height="10" patternUnits="userSpaceOnUse">
//
// Therefore: SMALL_BOX_UNITS = 20 SVG user units per small box.
//
// At 25 mm/s: 1 small box = 0.04 s (ECG paper standard)
//
// Formula: seconds = (delta / SMALL_BOX_UNITS) × 0.04
//
// Verification:
//   1 small box  = 20 SVGu  → (20/20)×0.04 = 0.04 s  ✓
//   1 large box  = 100 SVGu → (100/20)×0.04 = 0.20 s  ✓
//   3 small boxes = 60 SVGu → (60/20)×0.04 = 0.12 s  ✓
//   5 small boxes = 100 SVGu → (100/20)×0.04 = 0.20 s  ✓
const SMALL_BOX_UNITS = 20; // SVG user units per 1 mm ECG small box

function calcSecs(delta: number): number {
  return (delta / SMALL_BOX_UNITS) * 0.04;
}

// drag target: 0 = line A, 1 = line B, 2 = middle handle (slide both)
type DragTarget = 0 | 1 | 2;

export function CaliperOverlay() {
  const [pos, setPos]   = useState([160, 520]);
  const [drag, setDrag] = useState<DragTarget | null>(null);
  const svgRef          = useRef<SVGSVGElement>(null);
  const anchorRef       = useRef<{ svgX: number; p0: number; p1: number } | null>(null);

  // Dev-only calibration log — fires whenever caliper position changes
  useEffect(() => {
    const [a, b] = pos;
    const delta      = Math.abs(b - a);
    const smallBoxes = delta / SMALL_BOX_UNITS;
    const seconds    = calcSecs(delta);
    console.debug('[Caliper]', {
      x1:          a.toFixed(1),
      x2:          b.toFixed(1),
      delta:       delta.toFixed(1),
      SMALL_BOX_UNITS,
      smallBoxes:  smallBoxes.toFixed(2),
      seconds:     seconds.toFixed(3),
    });
  }, [pos]);

  // Accurate pixel→SVG mapping via getScreenCTM — works at any viewport width
  function toSvgX(clientX: number): number {
    if (!svgRef.current) return 0;
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return 0;
    const pt = svgRef.current.createSVGPoint();
    pt.x = clientX;
    pt.y = 0;
    return Math.max(0, Math.min(800, pt.matrixTransform(ctm.inverse()).x));
  }

  // Slide both lines, preserving span, clamped to strip bounds [0, 800]
  function slidePos(anchorSvgX: number, p0: number, p1: number, currentSvgX: number) {
    const dx      = currentSvgX - anchorSvgX;
    const left    = Math.min(p0, p1);
    const span    = Math.abs(p1 - p0);
    const newLeft = Math.max(0, Math.min(800 - span, left + dx));
    return p0 <= p1 ? [newLeft, newLeft + span] : [newLeft + span, newLeft];
  }

  useEffect(() => {
    if (drag === null) return;
    const target = drag; // narrowed local — avoids stale-closure TS error
    function onMove(e: MouseEvent) {
      const x = toSvgX(e.clientX);
      if (target === 2) {
        if (!anchorRef.current) return;
        const { svgX, p0, p1 } = anchorRef.current;
        setPos(slidePos(svgX, p0, p1, x));
      } else {
        setPos(p => { const n = [...p]; n[target] = x; return n; });
      }
    }
    function onUp() { setDrag(null); }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
    };
  }, [drag]);

  function startLineDrag(i: 0 | 1, e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDrag(i);
  }

  function startMiddleDrag(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    anchorRef.current = { svgX: toSvgX(clientX), p0: pos[0], p1: pos[1] };
    setDrag(2);
  }

  function onTouchMove(e: React.TouchEvent) {
    if (drag === null) return;
    e.preventDefault();
    const x = toSvgX(e.touches[0].clientX);
    if (drag === 2) {
      if (!anchorRef.current) return;
      const { svgX, p0, p1 } = anchorRef.current;
      setPos(slidePos(svgX, p0, p1, x));
    } else {
      setPos(p => { const n = [...p]; n[drag] = x; return n; });
    }
  }

  const [x1, x2] = [...pos].sort((a, b) => a - b) as [number, number];
  const delta     = x2 - x1;
  const secs      = calcSecs(delta).toFixed(2);
  const midX      = (x1 + x2) / 2;

  // Middle handle: pill on the baseline connector; hidden when span is tiny
  const handleW    = Math.min(delta - 6, 36);
  const showHandle = handleW > 12;
  const midCursor  = drag === 2 ? 'grabbing' : 'grab';

  // Label: always above the strip, centered on the span
  const labelPct = `${(midX / 800) * 100}%`;

  return (
    <div
      className="caliper-overlay"
      onTouchMove={onTouchMove}
      onTouchEnd={() => setDrag(null)}
    >
      <svg
        ref={svgRef}
        width="100%" height="100%"
        viewBox="0 0 800 100"
        preserveAspectRatio="xMinYMid meet"
        style={{ display: 'block', userSelect: 'none' }}
      >
        {/* Shaded span */}
        <rect x={x1} y="0" width={delta} height="100" fill="rgba(10,191,188,0.06)" />

        {/* Baseline connector */}
        <line x1={x1} y1="65" x2={x2} y2="65"
          stroke="rgba(10,191,188,0.3)" strokeWidth="0.5" />

        {/* Middle handle */}
        {showHandle && (
          <>
            <rect
              x={midX - handleW / 2} y="61.5"
              width={handleW} height="7" rx="2"
              fill="rgba(10,191,188,0.14)"
              stroke="rgba(10,191,188,0.38)" strokeWidth="0.5"
              style={{ cursor: midCursor, pointerEvents: 'none' }}
            />
            <rect
              x={midX - handleW / 2 - 4} y="56"
              width={handleW + 8} height="18"
              fill="transparent"
              style={{ cursor: midCursor }}
              onMouseDown={startMiddleDrag}
              onTouchStart={startMiddleDrag}
            />
          </>
        )}

        {/* Caliper line A */}
        <line x1={pos[0]} y1="0" x2={pos[0]} y2="100"
          stroke="rgba(10,191,188,0.65)" strokeWidth="0.8" />
        <rect
          x={pos[0] - 12} y="0" width="24" height="100"
          fill="transparent" style={{ cursor: 'ew-resize' }}
          onMouseDown={e => startLineDrag(0, e)}
          onTouchStart={e => startLineDrag(0, e)}
        />

        {/* Caliper line B */}
        <line x1={pos[1]} y1="0" x2={pos[1]} y2="100"
          stroke="rgba(10,191,188,0.65)" strokeWidth="0.8" />
        <rect
          x={pos[1] - 12} y="0" width="24" height="100"
          fill="transparent" style={{ cursor: 'ew-resize' }}
          onMouseDown={e => startLineDrag(1, e)}
          onTouchStart={e => startLineDrag(1, e)}
        />
      </svg>

      {/* Measurement label — always above the strip, never between the lines */}
      {delta > 4 && (
        <div className="caliper-chip" style={{ left: labelPct }}>
          {secs}s
        </div>
      )}
    </div>
  );
}
