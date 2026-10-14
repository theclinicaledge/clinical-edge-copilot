import { useId, useRef } from 'react';
import { CALIBRATION, PLOT, STRIPS, pathFor, signalAt, xAt, yAt } from './ecg/waveforms.js';
import './ecg.css';

function Signal({ strip, start = 0, end = 6, highlight = false }) {
  const id = useId();
  const width = (end - start) * PLOT.unitsPerSecond + 60;
  const beats = STRIPS[strip].beats.filter(b => b.r >= start && b.r < end);
  return <svg className="ecg-signal" viewBox={`0 0 ${width} ${PLOT.height}`} role="img" aria-labelledby={`${id}-title ${id}-desc`} data-strip={strip} data-start={start}>
    <title id={`${id}-title`}>Strip {strip}, {start} to {end} seconds</title><desc id={`${id}-desc`}>{STRIPS[strip].alt}{highlight ? ' Gold rings identify eight regularly spaced native QRS peaks across the complete six seconds. The underlying path is unchanged.' : ''}</desc>
    <defs><pattern id={`${id}-small`} width="4" height="4" patternUnits="userSpaceOnUse"><path d="M4 0H0V4" fill="none" stroke="var(--ecg-grid-minor)" strokeWidth=".35" /></pattern><pattern id={`${id}-grid`} width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill={`url(#${id}-small)`} /><path d="M20 0H0V20" fill="none" stroke="var(--ecg-grid-major)" strokeWidth=".6" /></pattern></defs>
    <rect x="0" y="28" width={width} height="160" fill={`url(#${id}-grid)`} />
    <text x="10" y="18" className="ecg-svg-label">II-style</text><text x={width - 10} y="18" textAnchor="end" className="ecg-svg-label">{start.toFixed(0)}&#8211;{end.toFixed(0)} s</text>
    <path d={`M8 ${PLOT.baseline}h4v-40h20v40h4`} fill="none" className="ecg-calibration" />
    <text x="9" y="129" className="ecg-svg-cal-label">1 mV</text>
    <path className="ecg-wave" data-signal-path="true" d={pathFor(strip, start, end)} fill="none" />
    {highlight && <g className="ecg-qrs-markers" aria-hidden="true">{beats.map((beat, i) => <g key={beat.r} data-native-qrs={beat.r}><rect x={xAt(beat.r - start) - 5} y="31" width="10" height="155" rx="3" /><circle cx={xAt(beat.r - start)} cy={yAt(signalAt(strip, beat.r))} r="6" /><text x={xAt(beat.r - start)} y="201" textAnchor="middle">{STRIPS[strip].beats.indexOf(beats[i]) + 1}</text></g>)}</g>}
    {!highlight && Array.from({ length: end - start + 1 }, (_, i) => <text key={i} x={xAt(i)} y="201" textAnchor="middle" className="ecg-time-label">{start + i}s</text>)}
  </svg>;
}

export default function ECGStrip({ strip, compact = false, highlight = false, children }) {
  const dialog = useRef(null); const scroll = useRef(null); const opener = useRef(null);
  const id = useId();
  const close = () => { dialog.current?.close(); opener.current?.focus({ preventScroll: true }); };
  return <div className={`monitor-tracing ecg-strip ${compact ? 'is-compact' : ''}`} data-ecg={strip}>
    <div className="monitor-tracing-label"><span>STRIP {strip}</span><span>EDUCATIONAL ILLUSTRATION</span></div>
    <div className="ecg-overview"><Signal strip={strip} highlight={highlight} /></div>
    {!compact && <>
      <div className="ecg-mobile-rows"><Signal strip={strip} start={0} end={3} highlight={highlight} /><Signal strip={strip} start={3} end={6} highlight={highlight} /></div>
      <div className="ecg-tools"><span>6 s &#183; {CALIBRATION.mmPerSecond} mm/s &#183; {CALIBRATION.mmPerMv} mm/mV<br /><small>Lead II-style &#183; scaled display, not a recording</small></span><button ref={opener} className="ecg-expand" onClick={() => dialog.current?.showModal()} aria-label={`Expand strip ${strip}`}><span aria-hidden="true">&#x2922;</span>Expand</button></div>
      {highlight && <p className="ecg-marker-key"><span aria-hidden="true" />Native QRS: 0.75 s apart &#183; 80/min<br /><small>Markers only. The signal is unchanged.</small></p>}
      <dialog ref={dialog} className="ecg-dialog" aria-labelledby={`${id}-heading`} onCancel={event => { event.preventDefault(); event.stopPropagation(); close(); }}>
        <div className="ecg-dialog-heading"><div><span>STRIP {strip} / EDUCATIONAL ILLUSTRATION</span><h2 id={`${id}-heading`}>{STRIPS[strip].title}</h2></div><button onClick={close} aria-label={`Close expanded strip ${strip}`}>&times;</button></div>
        <p className="ecg-review-note">Original constructed tracing, not a patient recording. See Sources & review for the scenario review record.</p>
        <div className="ecg-dialog-overview"><Signal strip={strip} highlight={highlight} /></div>
        <div ref={scroll} tabIndex={0} role="region" aria-label={`Enlarged strip ${strip}, scroll horizontally`} className="ecg-scroll"><div className="ecg-detail"><Signal strip={strip} highlight={highlight} /></div></div>
        <div className="ecg-pan"><button aria-label="View earlier part of tracing" onClick={() => scroll.current?.scrollBy({ left: -260, behavior: 'instant' })}>&larr;</button><span>25 mm/s &#183; 10 mm/mV grid<br /><small>Same six seconds, enlarged</small></span><button aria-label="View later part of tracing" onClick={() => scroll.current?.scrollBy({ left: 260, behavior: 'instant' })}>&rarr;</button></div>
        {highlight && <p className="ecg-marker-key"><span aria-hidden="true" />Native QRS highlighted. No noise has been removed.</p>}
        <details className="ecg-description"><summary>Text description &amp; limitations</summary><p>{STRIPS[strip].alt}</p><p>Illustrative amplitudes and Lead II-style morphology, not acquired lead data. The grid rescales with the screen; physical millimetres are not guaranteed. Not for patient interpretation or competency scoring.</p></details>
      </dialog>
    </>}
    {children}
  </div>;
}
