import { useState, useRef, useEffect } from 'react';

import { BASELINE, STRIP_WIDTH, SMALL_BOX_UNITS, unitsToSeconds } from '../utils/calibration';

// drag target: 0 = line A, 1 = line B, 2 = middle handle (slide both)
type DragTarget = 0 | 1 | 2;

export function CaliperOverlay() {
  const [pos, setPos]   = useState([160, 520]);
  const [drag, setDrag] = useState<DragTarget | null>(null);
  const dragRef = useRef<DragTarget | null>(null);
  const svgRef          = useRef<SVGSVGElement>(null);
  const labelRef        = useRef<HTMLDivElement>(null);
  const [labelBounds, setLabelBounds] = useState<{ min: number; max: number } | null>(null);
  const anchorRef       = useRef<{ svgX: number; p0: number; p1: number } | null>(null);

  // Accurate pixel→SVG mapping via getScreenCTM — works at any viewport width
  function toSvgX(clientX: number): number {
    if (!svgRef.current) return 0;
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return 0;
    const pt = svgRef.current.createSVGPoint();
    pt.x = clientX;
    pt.y = 0;
    return Math.max(0, Math.min(STRIP_WIDTH, pt.matrixTransform(ctm.inverse()).x));
  }

  // Slide both lines, preserving span, clamped to strip bounds [0, 800]
  function slidePos(anchorSvgX: number, p0: number, p1: number, currentSvgX: number) {
    const dx      = currentSvgX - anchorSvgX;
    const left    = Math.min(p0, p1);
    const span    = Math.abs(p1 - p0);
    const newLeft = Math.max(0, Math.min(STRIP_WIDTH - span, left + dx));
    return p0 <= p1 ? [newLeft, newLeft + span] : [newLeft + span, newLeft];
  }

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const target = dragRef.current;
      if (target === null) return;
      const x = toSvgX(e.clientX);
      if (target === 2) {
        if (!anchorRef.current) return;
        const { svgX, p0, p1 } = anchorRef.current;
        setPos(slidePos(svgX, p0, p1, x));
      } else {
        setPos(p => { const n = [...p]; n[target] = x; return n; });
      }
    }
    function onUp() { dragRef.current = null; setDrag(null); }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
    };
  }, []);

  function startLineDrag(i: 0 | 1, e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = i;
    setDrag(i);
  }

  function startMiddleDrag(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    anchorRef.current = { svgX: toSvgX(clientX), p0: pos[0], p1: pos[1] };
    dragRef.current = 2;
    setDrag(2);
  }

  function onTouchMove(e: React.TouchEvent) {
    const target = dragRef.current;
    if (target === null) return;
    e.preventDefault();
    const x = toSvgX(e.touches[0].clientX);
    if (target === 2) {
      if (!anchorRef.current) return;
      const { svgX, p0, p1 } = anchorRef.current;
      setPos(slidePos(svgX, p0, p1, x));
    } else {
      setPos(p => { const n = [...p]; n[target] = x; return n; });
    }
  }

  const [x1, x2] = [...pos].sort((a, b) => a - b) as [number, number];
  const delta     = x2 - x1;
  const seconds   = unitsToSeconds(delta);
  const secs      = seconds.toFixed(2);
  const smallBoxes = (delta / SMALL_BOX_UNITS).toFixed(1);
  const midX      = (x1 + x2) / 2;

  // Middle handle: pill on the baseline connector; hidden when span is tiny
  const handleW    = Math.min(delta - 6, 36);
  const showHandle = handleW > 12;
  const midCursor  = drag === 2 ? 'grabbing' : 'grab';

  // Label: always above the strip, centered on the span
  const labelPct = `${(midX / STRIP_WIDTH) * 100}%`;
  const showMeasurement = delta > 4;

  // The measurement lives on the same scrolling plane as the trace, but its
  // text must remain readable near either edge of the visible viewport.
  useEffect(() => {
    const viewport = svgRef.current?.closest('.detail-strip-wrap') as HTMLElement | null;
    const label = labelRef.current;
    if (!viewport || !label) return;
    function updateBounds() {
      if (!viewport || !label) return;
      const half = label.offsetWidth / 2 + 4;
      const min = viewport.scrollLeft + half;
      setLabelBounds({ min, max: Math.max(min, viewport.scrollLeft + viewport.clientWidth - half) });
    }
    updateBounds();
    const observer = new ResizeObserver(updateBounds);
    observer.observe(viewport);
    observer.observe(label);
    viewport.addEventListener('scroll', updateBounds, { passive: true });
    return () => {
      observer.disconnect();
      viewport.removeEventListener('scroll', updateBounds);
    };
  }, [showMeasurement]);

  return (
    <div
      className="caliper-overlay"
      onTouchMove={onTouchMove}
      onTouchEnd={() => { dragRef.current = null; setDrag(null); }}
      onTouchCancel={() => { dragRef.current = null; setDrag(null); }}
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
        <line x1={x1} y1={BASELINE} x2={x2} y2={BASELINE}
          stroke="rgba(10,191,188,0.3)" strokeWidth="0.5" />

        {/* Middle handle */}
        {showHandle && (
          <>
            <rect
              x={midX - handleW / 2} y={BASELINE - 3.5}
              width={handleW} height="7" rx="2"
              fill="rgba(10,191,188,0.14)"
              stroke="rgba(10,191,188,0.38)" strokeWidth="0.5"
              style={{ cursor: midCursor, pointerEvents: 'none' }}
            />
            <rect
              x={midX - handleW / 2 - 4} y={BASELINE - 9}
              width={handleW + 8} height="18"
              fill="transparent"
              style={{ cursor: midCursor, touchAction: 'none' }}
              onMouseDown={startMiddleDrag}
              onTouchStart={startMiddleDrag}
            />
          </>
        )}

        {/* Caliper line A */}
        <line x1={pos[0]} y1="0" x2={pos[0]} y2="100"
          stroke="rgba(10,191,188,0.65)" strokeWidth="0.8" />
        <rect
          data-caliper-handle="a"
          x={pos[0] - 12} y="0" width="24" height={delta < 24 ? 50 : 100}
          fill="transparent" style={{ cursor: 'ew-resize', touchAction: 'none' }}
          onMouseDown={e => startLineDrag(0, e)}
          onTouchStart={e => startLineDrag(0, e)}
        />

        {/* Caliper line B */}
        <line x1={pos[1]} y1="0" x2={pos[1]} y2="100"
          stroke="rgba(10,191,188,0.65)" strokeWidth="0.8" />
        <rect
          data-caliper-handle="b"
          x={pos[1] - 12} y={delta < 24 ? 50 : 0} width="24" height={delta < 24 ? 50 : 100}
          fill="transparent" style={{ cursor: 'ew-resize', touchAction: 'none' }}
          onMouseDown={e => startLineDrag(1, e)}
          onTouchStart={e => startLineDrag(1, e)}
        />
      </svg>

      {/* Measurement label — always above the strip, never between the lines */}
      {showMeasurement && (
        <div ref={labelRef} className="caliper-chip" style={{ left: labelBounds ? `clamp(${labelBounds.min}px, ${labelPct}, ${labelBounds.max}px)` : labelPct }}>
          {secs}s · {smallBoxes} small boxes
        </div>
      )}
    </div>
  );
}
