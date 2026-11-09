import { useEffect, useRef, useState } from 'react';
import ModuleHeader from '../../../components/ModuleHeader.jsx';
import { RhythmStrip } from '../components/RhythmStrip';
import { PAPER_SPEED, GAIN, STRIP_SECONDS, secondsToUnits, unitsToSeconds } from '../utils/calibration';
import { RHYTHM_CHECK_CASES, INTERPRETATIONS, PR_OBSERVATIONS, canSubmitCheck, clampMarker, matchesSpan, measureMarkers } from './cases';
import './rhythm-check.css';

const formatSeconds = value => value === null ? 'Not placed' : `${value.toFixed(2)} s`;

function Evidence({ example }) {
  return <g className="rc-evidence" aria-hidden="true">
    {example.beats.map(({ p, q }, index) => {
      const atrial = example.signal.waves.find(wave => wave.start === p && wave.role !== 'qrs');
      const ventricular = example.signal.waves.find(wave => wave.start === q && wave.role === 'qrs');
      return <g key={p}>
        <rect className="rc-atrial" x={secondsToUnits(p)} y="20" width={secondsToUnits(atrial.duration)} height="69" />
        {ventricular && <rect className="rc-ventricular" x={secondsToUnits(q)} y="20" width={secondsToUnits(ventricular.duration)} height="69" />}
        {q === null && <path className="rc-dropped" d={`M ${secondsToUnits(p)} 19 V 91`} />}
        {q !== null && <path className="rc-reference-span" d={`M ${secondsToUnits(p)} 19 V 14 H ${secondsToUnits(q)} V 19`} />}
        <text x={secondsToUnits(Math.min(p, q ?? p))} y="11">{index + 1}{q === null ? ' · P only' : ''}</text>
      </g>;
    })}
  </g>;
}

function CaseExercise({ example, position, onNext }) {
  const [intervals, setIntervals] = useState(() => example.measurements.map(() => [null, null]));
  const [active, setActive] = useState(0);
  const [marker, setMarker] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [observation, setObservation] = useState('');
  const [answer, setAnswer] = useState('');
  const [localization, setLocalization] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const resultHeading = useRef(null);
  const questionHeading = useRef(null);
  const workbench = useRef(null);
  const submitted = revealed;
  const markers = intervals[active];
  const reference = example.measurements[active];
  const viewport = useRef(null);
  const asksLocalization = example.id === 'RC-04';
  const ready = canSubmitCheck(intervals, answer, observation, Boolean(example.prPattern))
    && (!asksLocalization || Boolean(localization));

  function inspectInterval(index) {
    setActive(index);
    setMarker(0);
    if (submitted && viewport.current) {
      const pane = viewport.current;
      const [start, end] = example.measurements[index].span;
      pane.scrollLeft = (start + end) / 2 / STRIP_SECONDS * pane.scrollWidth - pane.clientWidth / 2;
    }
  }
  const slow = example.measurements.length === 1;
  // Stable option order within each topic avoids leaking the key through ordering.
  const options = slow ? ['sinus', 'junctional'] : ['mobitzI', 'mobitzII'];
  if (!asksLocalization) options.push('uncertain');

  useEffect(() => { questionHeading.current?.focus({ preventScroll: true }); }, []);
  useEffect(() => {
    if (!submitted) return;
    resultHeading.current?.focus({ preventScroll: true });
    workbench.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [submitted]);

  function place(which, seconds) {
    if (submitted || !Number.isFinite(seconds)) return;
    setIntervals(previous => previous.map((pair, index) => index === active
      ? pair.map((value, i) => i === which ? clampMarker(seconds) : value)
      : pair));
  }

  function tapStrip(event) {
    if (submitted) return;
    const svg = event.currentTarget.querySelector('svg');
    const matrix = svg?.getScreenCTM();
    if (!matrix) return;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    place(marker, unitsToSeconds(point.x));
    if (marker === 0) setMarker(1);
  }

  const overlay = <>
    {submitted && showMap && <>
      <Evidence example={example} />
      {reference.span.map(time => <line key={time} className="rc-reference-marker" x1={secondsToUnits(time)} x2={secondsToUnits(time)} y1="0" y2="100" />)}
    </>}
    {markers.map((value, i) => value !== null && <g key={i} className="rc-learner-marker" aria-hidden="true">
      <line x1={secondsToUnits(value)} x2={secondsToUnits(value)} y1="0" y2="100" />
      <text x={Math.min(secondsToUnits(value) + 3, 785)} y={i === 0 ? 97 : 82}>{i === 0 ? 'A' : 'B'}</text>
    </g>)}
  </>;

  return <article className="rc-card" aria-labelledby="rc-case-title">
    <div className="rc-case-top">
      <div><p className="rc-eyebrow">Case {position + 1} of {RHYTHM_CHECK_CASES.length} · {example.guided ? 'Guided' : 'Independent attempt'}</p>
        <h2 ref={questionHeading} id="rc-case-title" tabIndex={-1}>{slow ? 'Slow regular or near-regular rhythm' : 'Intermittent nonconducted beats'}</h2></div>
      <span className="rc-case-id">{example.id}</span>
    </div>
    <p className="rc-instruction">{example.prompt}</p>
    {example.guided && <p className="rc-guide"><strong>How to approach it.</strong> {example.coaching}</p>}
    <section ref={workbench} className="rc-workbench" aria-label="Calibrated strip and measurements">
      <div className="rc-strip-bar">
        <span>Lead {example.signal.lead} · {STRIP_SECONDS} s · {PAPER_SPEED} mm/s · {GAIN} mm/mV</span>
        <div className="rc-zoom" role="group" aria-label="Strip zoom">
          {[1, 2, 3].map(value => <button type="button" key={value} aria-pressed={zoom === value} onClick={() => setZoom(value)}>{value === 1 ? 'Fit' : `${value}×`}</button>)}
        </div>
      </div>
      <div ref={viewport} className="rc-scroll" tabIndex={0} aria-label="Rhythm strip viewport. Scroll horizontally when zoomed.">
        <div className="rc-plot" style={{ width: `${zoom * 100}%` }} onClick={tapStrip}>
          <RhythmStrip rhythmId={example.id} examplePath={example.path} overlay={overlay} accessibleLabel={`Synthetic lead ${example.signal.lead} rhythm strip, six seconds${submitted && showMap ? ', with evidence markers' : ''}`} />
        </div>
      </div>
      {intervals.length > 1 && <div className="rc-intervals rc-interval-picker" role="group" aria-label={submitted ? 'Review measured interval' : 'Interval to measure'}>
        {intervals.map((pair, index) => <button key={index} type="button" aria-pressed={index === active} onClick={() => inspectInterval(index)}>
          Interval {index + 1} · {example.measurements[index].label}<br />{formatSeconds(measureMarkers(pair))}
        </button>)}
      </div>}
      {submitted ? <div className="rc-legend">
        <button type="button" aria-pressed={showMap} onClick={() => setShowMap(value => !value)}>{showMap ? 'Hide evidence overlay' : 'Show evidence overlay'}</button>
        {showMap && <p><span className="rc-key-p">Atrial deflection</span> · <span className="rc-key-q">QRS</span> · Brackets connect onsets. Solid gold lines mark the selected reference. Dashed white lines show your A and B markers. Dashed gold lines mark a P without a QRS.</p>}
      </div> : <div className="rc-controls">
        <p className="rc-marker-help">Tap the strip to place the selected marker. Use the sliders or arrow keys for fine placement. At higher zoom, swipe to inspect the rest.</p>
        <div className="rc-marker-grid">
          {markers.map((value, i) => <div key={i} className="rc-marker-control">
            <button type="button" aria-pressed={marker === i} onClick={() => setMarker(i)}>Marker {i === 0 ? 'A' : 'B'}</button>
            <label htmlFor={`rc-marker-${i}`}><span className="rc-sr">Marker {i === 0 ? 'A' : 'B'} time. </span>{formatSeconds(value)}</label>
            <input id={`rc-marker-${i}`} type="range" min="0" max={STRIP_SECONDS} step="0.01" value={value ?? 0} aria-valuetext={formatSeconds(value)} onChange={event => place(i, Number(event.target.value))} />
          </div>)}
        </div>
        <p className="rc-measurement" aria-live="polite">Measured span · <strong>{formatSeconds(measureMarkers(markers))}</strong></p>
      </div>}
    </section>
    {!submitted ? <form className="rc-answer" onSubmit={event => { event.preventDefault(); if (ready) setRevealed(true); }}>
      {example.prPattern && <fieldset><legend>How does PR behave around the pause?</legend>
        {Object.entries(PR_OBSERVATIONS).map(([value, label]) => <label className="rc-option" key={value}>
          <input type="radio" name="pr-observation" value={value} checked={observation === value} onChange={() => setObservation(value)} />{label}
        </label>)}
      </fieldset>}
      <fieldset><legend>{asksLocalization
        ? 'Which rhythm better fits this strip: sinus bradycardia or junctional rhythm?'
        : 'Which interpretation fits the visible evidence?'}</legend>
        {options.map(option => <label className="rc-option" key={option}><input type="radio" name="interpretation" value={option} checked={answer === option} onChange={() => setAnswer(option)} />{INTERPRETATIONS[option]}</label>)}
      </fieldset>
      {asksLocalization && <fieldset><legend>Can this Lead II strip establish the exact pacemaker origin?</legend>
        {['Yes', 'No'].map(option => <label className="rc-option" key={option}>
          <input type="radio" name="localization" value={option} checked={localization === option} onChange={() => setLocalization(option)} />{option}
        </label>)}
      </fieldset>}
      <button className="rc-primary" type="submit" disabled={!ready}>Submit interpretation</button>
      <p className="rc-hint">Place both markers for each interval{example.prPattern ? ', record the PR pattern,' : ''} and select an interpretation{asksLocalization ? ' and a localization answer' : ''} to submit.</p>
    </form> : <section className="rc-result" aria-labelledby="rc-result-title">
      <p className="rc-eyebrow">{answer === example.answer ? 'Interpretation matches' : 'Review the deciding evidence'}</p>
      <h3 ref={resultHeading} id="rc-result-title" tabIndex={-1}>{INTERPRETATIONS[example.answer]}</h3>
      <p>Your interpretation · {INTERPRETATIONS[answer]}</p>
      {asksLocalization && <p><strong>Localization {localization === 'No' ? 'matches' : 'needs review'}</strong> · Your answer: {localization}. Reference answer: No.</p>}
      {example.prPattern && <p><strong>PR observation {observation === example.prPattern ? 'matches' : 'needs review'}</strong> · {PR_OBSERVATIONS[observation]}<br />
        Reference pattern · {PR_OBSERVATIONS[example.prPattern]}. Marker results below assess placement on each beat separately.
      </p>}
      <p>{example.feedback}</p>
      <p><strong>Closest alternative</strong> · {INTERPRETATIONS[example.alternative]}</p>
      <ul className="rc-measurements">
        {example.measurements.map(({ label, span, p, q }, index) => <li key={label}>
          <strong>{label}</strong> · {matchesSpan(intervals[index], span) ? 'Markers match' : 'Recheck marker placement'}<br />
          Your span {formatSeconds(measureMarkers(intervals[index]))} · Reference {formatSeconds(span[1] - span[0])}<br />
          Your A {formatSeconds(intervals[index][0])} · B {formatSeconds(intervals[index][1])}<br />
          Atrial onset {formatSeconds(p)} · QRS onset {formatSeconds(q)}
        </li>)}
      </ul>
      {!slow && <p><strong>Conducted PR spans in strip order.</strong> {example.beats.map(({ p, q }) => q === null ? 'P only' : formatSeconds(q - p)).join(' · ')}</p>}
      {answer === 'uncertain' && <p>A longer strip or another lead can help when atrial activity is unclear. Here, the marked events supply the distinguishing evidence.</p>}
      <details><summary>Educational sources</summary><ul>{example.sources.map(([name, url]) => <li key={url}><a href={url} target="_blank" rel="noreferrer">{name}</a></li>)}</ul></details>
      <button className="rc-primary" type="button" onClick={onNext}>{position + 1 < RHYTHM_CHECK_CASES.length ? 'Next case' : 'Finish Rhythm Check'}</button>
    </section>}
  </article>;
}

export default function RhythmCheck({ navigate }) {
  const [position, setPosition] = useState(0);
  const complete = position >= RHYTHM_CHECK_CASES.length;
  function moveTo(next) {
    setPosition(next);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  return <div className="rhythm-lab-root">
    <div className="app-shell">
      <ModuleHeader moduleName="Rhythm Lab" onGoHome={() => navigate('/')} onBack={() => navigate('/rhythm-lab')} backLabel="Rhythm Lab" maxWidth="1280px" />
      <main className="rc-shell">
        <header className="rc-intro">
          <p className="rc-eyebrow">Rhythm Lab · Beta</p>
          <h1>Rhythm Check</h1>
          <p>Measure the finding, commit to an interpretation, then see the evidence on the strip.</p>
          <p className="rc-hint">Synthetic educational examples · Clinical Review Pending</p>
        </header>
        {complete ? <section className="rc-card"><h2>Rhythm Check complete</h2><p>You worked through eight synthetic examples across two rhythm distinctions.</p><button className="rc-primary" type="button" onClick={() => moveTo(0)}>Start again</button></section>
          : <CaseExercise key={position} example={RHYTHM_CHECK_CASES[position]} position={position} onNext={() => moveTo(position + 1)} />}
        <p className="rc-footer">Fictional education. Interpret clinical tracings with the patient context, treating team and local protocol.</p>
      </main>
    </div>
  </div>;
}
