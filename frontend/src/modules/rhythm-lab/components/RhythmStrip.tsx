import { WAVEFORMS } from '../utils/waveforms';

interface RhythmStripProps {
  rhythmId: string;
  preview?: boolean;
}

export function RhythmStrip({ rhythmId, preview = false }: RhythmStripProps) {
  const path = WAVEFORMS[rhythmId] ?? WAVEFORMS['nsr'];
  const uid = `rs-${rhythmId}-${preview ? 'p' : 'd'}`;

  const viewBox = preview ? '0 0 500 100' : '0 0 800 100';
  const height = preview ? 64 : 120;

  const svg = (
    <svg
      viewBox={viewBox}
      width="100%"
      height={height}
      preserveAspectRatio="xMinYMid meet"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <defs>
        <pattern id={`${uid}-minor`} width="20" height="10" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 10" fill="none" stroke="#243040" strokeWidth="0.4" />
        </pattern>
        <pattern id={`${uid}-major`} width="100" height="50" patternUnits="userSpaceOnUse">
          <rect width="100" height="50" fill={`url(#${uid}-minor)`} />
          <path d="M 100 0 L 0 0 0 50" fill="none" stroke="#2D3B4E" strokeWidth="0.8" />
        </pattern>
        <linearGradient id={`${uid}-fade`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="70%" stopColor="#111827" stopOpacity="0" />
          <stop offset="100%" stopColor="#111827" stopOpacity="1" />
        </linearGradient>
        {/* Phosphor glow: blurred copy merged under the sharp stroke */}
        <filter id={`${uid}-glow`} x="-10%" y="-80%" width="120%" height="260%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={preview ? '1' : '1.8'} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="800" height="100" fill={`url(#${uid}-major)`} />

      <line x1="0" y1="65" x2="800" y2="65" stroke="#2D3B4E" strokeWidth="0.6" strokeDasharray="4 4" />

      <path
        d={path}
        fill="none"
        stroke="#0ABFBC"
        strokeWidth={preview ? 1.6 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${uid}-glow)`}
      />

      {/* Fade only on detail strips — preview strips end cleanly on baseline */}
      {!preview && <rect width="800" height="100" fill={`url(#${uid}-fade)`} />}
    </svg>
  );

  // Detail strips get a canvas wrapper that drives the sweep-reveal animation.
  // Preview strips render bare (used inside card thumbnails — no entrance needed).
  if (!preview) {
    return <div className="strip-canvas">{svg}</div>;
  }
  return svg;
}
