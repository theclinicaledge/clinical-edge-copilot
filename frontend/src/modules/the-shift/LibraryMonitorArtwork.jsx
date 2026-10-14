import { useId } from 'react';
import { pathFor } from './monitor/ecg/waveforms.js';

// Unchanged first three seconds of documented strip B. Both axes scale together;
// no artifact, later rhythm, diagnosis or gameplay annotations appear here.
const waveform = pathFor('B', 0, 3);

export default function LibraryMonitorArtwork() {
  const id = useId();
  return <svg className="shift-library-monitor" viewBox="0 0 360 180" aria-hidden="true" focusable="false">
    <defs>
      <pattern id={`${id}-small`} width="4" height="4" patternUnits="userSpaceOnUse">
        <path d="M4 0H0V4" fill="none" stroke="var(--ce-text-light-body)" strokeOpacity=".12" strokeWidth=".35" />
      </pattern>
      <pattern id={`${id}-grid`} width="20" height="20" patternUnits="userSpaceOnUse">
        <rect width="20" height="20" fill={`url(#${id}-small)`} />
        <path d="M20 0H0V20" fill="none" stroke="var(--ce-text-light-body)" strokeOpacity=".2" strokeWidth=".6" />
      </pattern>
    </defs>
    <text x="340" y="30" textAnchor="end">ECG / II-STYLE</text>
    <svg x="10" y="44" width="340" height="112" viewBox="30 50 320 106" preserveAspectRatio="xMidYMid meet">
      <rect x="30" y="50" width="320" height="106" fill={`url(#${id}-grid)`} />
      <path data-library-waveform="B" d={waveform} fill="none" stroke="var(--ce-teal)" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <text x="20" y="168">EDUCATIONAL ILLUSTRATION</text>
    <text x="340" y="168" textAnchor="end">0-3 s</text>
  </svg>;
}
