import { useId, type ReactNode } from 'react';
import { WAVEFORMS } from '../utils/waveforms';
import { SMALL_BOX_UNITS, LARGE_BOX_UNITS, STRIP_WIDTH, STRIP_HEIGHT } from '../utils/calibration';

interface RhythmStripProps {
  rhythmId: string;
  preview?: boolean;
  examplePath?: string;
  overlay?: ReactNode;
  accessibleLabel?: string;
}

export function RhythmStrip({ rhythmId, preview = false, examplePath, overlay, accessibleLabel }: RhythmStripProps) {
  const path = examplePath ?? WAVEFORMS[rhythmId] ?? WAVEFORMS['nsr'];
  const uid = `rs-${useId().replace(/:/g, '')}`;

  const viewBox = preview ? '0 0 500 100' : '0 0 800 100';
  const height = preview ? 64 : 120;

  const svg = (
    <svg
      viewBox={viewBox}
      width="100%"
      height={height}
      className={preview ? 'rhythm-strip-svg rhythm-strip-svg--preview' : 'rhythm-strip-svg'}
      data-rhythm-id={rhythmId}
      data-duration-seconds={preview ? 3.75 : 6}
      preserveAspectRatio="xMinYMid meet"
      aria-hidden={accessibleLabel ? undefined : true}
      role={accessibleLabel ? 'img' : undefined}
      aria-label={accessibleLabel}
      style={{ display: 'block' }}
    >
      <defs>
        <pattern id={`${uid}-minor`} width={SMALL_BOX_UNITS} height={SMALL_BOX_UNITS} patternUnits="userSpaceOnUse">
          <path d={`M ${SMALL_BOX_UNITS} 0 L 0 0 0 ${SMALL_BOX_UNITS}`} fill="none" stroke="var(--ce-navy-600)" strokeWidth="0.4" />
        </pattern>
        <pattern id={`${uid}-major`} width={LARGE_BOX_UNITS} height={LARGE_BOX_UNITS} patternUnits="userSpaceOnUse">
          <rect width={LARGE_BOX_UNITS} height={LARGE_BOX_UNITS} fill={`url(#${uid}-minor)`} />
          <path d={`M ${LARGE_BOX_UNITS} 0 L 0 0 0 ${LARGE_BOX_UNITS}`} fill="none" stroke="var(--ce-line-navy)" strokeWidth="0.8" />
        </pattern>
        {/* Phosphor glow: blurred copy merged under the sharp stroke */}
        <filter id={`${uid}-glow`} x="-10%" y="-80%" width="120%" height="260%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={preview ? '0.4' : '0.6'} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width={STRIP_WIDTH} height={STRIP_HEIGHT} fill={`url(#${uid}-major)`} />

      <path
        d={path}
        fill="none"
        stroke="var(--ce-teal)"
        strokeWidth={preview ? 1 : 1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${uid}-glow)`}
      />

      {overlay}
    </svg>
  );

  // Detail strips get a canvas wrapper that drives the sweep-reveal animation.
  // Preview strips render bare (used inside card thumbnails — no entrance needed).
  if (!preview && examplePath === undefined) {
    return <div className="strip-canvas">{svg}</div>;
  }
  return svg;
}
