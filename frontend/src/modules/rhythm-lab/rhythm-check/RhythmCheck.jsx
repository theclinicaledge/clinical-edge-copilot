import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import ModuleHeader from '../../../components/ModuleHeader.jsx';
import { RhythmStrip } from '../components/RhythmStrip';
import { PAPER_SPEED, GAIN, STRIP_SECONDS, secondsToUnits, unitsToSeconds } from '../utils/calibration';
import { RHYTHM_CHECK_CASES, INTERPRETATIONS, PR_OBSERVATIONS, ENDPOINT_TOLERANCE, assessMeasurement, canSubmitCheck, clampMarker, measureMarkers, rateExercise } from './cases';
import './rhythm-check.css';

const formatSeconds = value => value === null ? 'Not placed' : `${value.toFixed(2)} s`;

const desktopQuery = '(min-width: 1040px)';
const isDesktop = () => window.matchMedia(desktopQuery).matches;
function subscribeToDesktop(callback) {
  const query = window.matchMedia(desktopQuery);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

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

function MeasurementReview({ example, reference, markers, onCenter, onShowMap, showMap }) {
  const [start, end] = reference.span;
  const measured = measureMarkers(markers);
  const expected = end - start;
  const { duration, landmarks: targetMatch } = assessMeasurement(markers, reference.span);
  const matches = duration && targetMatch;
  const firstMarker = markers[0] <= markers[1] ? 0 : 1;
  const targetName = time => time === reference.p ? 'atrial onset' : 'QRS onset';
  const landmarks = example.beats.flatMap(({ p, q }, index) => [
    { time: p, name: 'atrial onset', beat: index + 1 },
    ...(q === null ? [] : [{ time: q, name: 'QRS onset', beat: index + 1 }]),
  ]);
  const difference = Math.round((measured - expected) * 100);
  const nearby = markers.map(time => landmarks.filter(item => Math.abs(item.time - time) <= ENDPOINT_TOLERANCE + 1e-9));
  const [nearA, nearB] = nearby;
  const acrossBeats = nearA.length === 1 && nearB.length === 1 && nearA[0].beat !== nearB[0].beat;
  const anotherBeat = nearA.length === 1 && nearB.length === 1 && !acrossBeats
    && nearA[0].name === targetName(firstMarker === 0 ? start : end)
    && nearB[0].name === targetName(firstMarker === 0 ? end : start)
    && nearA[0].beat !== landmarks.find(item => item.time === reference.p)?.beat;
  const wrongLandmark = nearby.some((items, index) => {
    const target = index === firstMarker ? start : end;
    return items.length === 1 && items[0].time !== target;
  });

  return <section className="rc-review-panel" aria-label="Selected interval comparison">
    <div className="rc-review-top">
      <strong>{reference.label}</strong>
      <span className="rc-measure-status" data-match={duration}>{duration ? 'Duration matches' : 'Duration outside tolerance'}</span>
    </div>
    <dl className="rc-span-pair">
      <div><dt>Your span</dt><dd>{formatSeconds(measured)}</dd></div>
      <div><dt>Reference</dt><dd>{formatSeconds(expected)}</dd></div>
    </dl>
    <p><strong>Landmarks and beat</strong> · {targetMatch ? 'Target endpoints match' : 'Check the target endpoints'}</p>
    {!matches && <p className="rc-reference-copy">
      {!duration && difference !== 0 && <>Your span is {formatSeconds(Math.abs(difference) / 100)} {difference > 0 ? 'longer' : 'shorter'}. </>}
      {targetMatch ? 'Both markers are near the requested onsets. Fine-tune their positions to match the reference span.'
        : acrossBeats ? <>A and B are near onsets on different beats ({nearA[0].beat} and {nearB[0].beat}).</>
        : anotherBeat ? <>Both markers are near the expected types of onsets on beat {nearA[0].beat}. Compare them with the requested beat.</>
        : wrongLandmark ? 'At least one marker is near a different onset than the target.'
        : 'Compare A and B with the two reference onsets.'}
    </p>}
    <details className="rc-placement-details"><summary>Marker details</summary>
    <p>{targetName(start)} {formatSeconds(start)} → {targetName(end)} {formatSeconds(end)}.</p>
    <ul className="rc-marker-review">
      {markers.map((time, index) => {
        const target = index === firstMarker ? start : end;
        const delta = Math.round((time - target) * 100);
        const near = nearby[index];
        return <li key={index}>
          <strong>{index === 0 ? 'A' : 'B'} · {formatSeconds(time)}</strong>
          <span>{near.length === 1 ? <>Near beat {near[0].beat} {near[0].name}. </> : near.length === 0 ? 'Away from a marked atrial or QRS onset. ' : 'Near more than one marked onset. '}
          {delta === 0 ? <>On the target {targetName(target)}.</> : <>{formatSeconds(Math.abs(delta) / 100)} {delta < 0 ? 'before' : 'after'} the target {targetName(target)}.</>}</span>
        </li>;
      })}
    </ul>
    </details>
    <div className="rc-review-actions">
      <button type="button" onClick={() => onCenter(markers)}>Find my markers</button>
      <button type="button" onClick={() => { onShowMap(true); onCenter(reference.span); }}>Find reference</button>
      <button type="button" aria-pressed={showMap} onClick={() => onShowMap(!showMap)}>{showMap ? 'Hide evidence overlay' : 'Show evidence overlay'}</button>
    </div>
  </section>;
}

function CaseExercise({ example, position, onNext }) {
  const desktop = useSyncExternalStore(subscribeToDesktop, isDesktop);
  const [intervals, setIntervals] = useState(() => example.measurements.map(() => [null, null]));
  const [active, setActive] = useState(0);
  const [marker, setMarker] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState(0);
  const pendingCenter = useRef(null);
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
  const [rateAnswer, setRateAnswer] = useState('');
  const [regularity, setRegularity] = useState('');
  const rate = rateExercise(example);
  const asksLocalization = example.id === 'RC-04';
  const ready = canSubmitCheck(intervals, answer, observation, Boolean(example.prPattern))
    && (!asksLocalization || Boolean(localization))
    && (!rate || (/^[0-9]{1,3}$/.test(rateAnswer) && (!rate.assessRegularity || regularity)));

  function centerStrip(time) {
    const pane = viewport.current;
    if (pane) pane.scrollLeft = time / STRIP_SECONDS * pane.scrollWidth - pane.clientWidth / 2;
  }

  function changeZoom(value, time) {
    if (value === zoom) {
      if (time !== undefined) centerStrip(time);
      return;
    }
    const pane = viewport.current;
    pendingCenter.current = time ?? (pane.scrollLeft + pane.clientWidth / 2) / pane.scrollWidth * STRIP_SECONDS;
    setZoom(value);
  }

  function inspectInterval(index) {
    setActive(index);
    setMarker(0);
    if (submitted) {
      const [start, end] = example.measurements[index].span;
      centerStrip((start + end) / 2);
    }
  }

  useLayoutEffect(() => {
    const pane = viewport.current;
    if (pane && pendingCenter.current !== null) {
      pane.scrollLeft = pendingCenter.current / STRIP_SECONDS * pane.scrollWidth - pane.clientWidth / 2;
      pendingCenter.current = null;
    }
  }, [zoom]);

  const slow = example.measurements.length === 1;
  // Stable option order within each topic avoids leaking the key through ordering.
  const options = slow ? ['sinus', 'junctional'] : ['mobitzI', 'mobitzII'];
  if (!asksLocalization) options.push('uncertain');

  useEffect(() => { questionHeading.current?.focus({ preventScroll: true }); }, []);
  useEffect(() => {
    if (!submitted) return;
    resultHeading.current?.focus({ preventScroll: true });
    resultHeading.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
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

  const rateField = !submitted && rate && (
    <div className="rc-rate-row">
      <label htmlFor="rc-rate">Ventricular rate (bpm)</label>
      <input id="rc-rate" form="rc-answer" value={rateAnswer} onChange={event => setRateAnswer(event.target.value)}
        inputMode="numeric" enterKeyHint="done" maxLength={3} aria-describedby="rc-rate-help"
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === 'Escape') {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }} />
      <p id="rc-rate-help">Count QRS complexes on the full six-second strip and multiply by 10.</p>
    </div>
  );

  return <article className="rc-card" aria-labelledby="rc-case-title">
    <div className="rc-case-intro">
      <div className="rc-case-top">
        <div><p className="rc-eyebrow">Case {position + 1} of {RHYTHM_CHECK_CASES.length} · {example.guided ? 'Guided' : 'Independent attempt'}</p>
          <h2 ref={questionHeading} id="rc-case-title" tabIndex={-1}>{slow ? 'Slow regular or near-regular rhythm' : 'Intermittent nonconducted beats'}</h2></div>
        <span className="rc-case-id">{example.id}</span>
      </div>
      {!submitted && <p className="rc-instruction">{example.prompt}</p>}
      {!submitted && example.guided && <details className="rc-guide"><summary>How to approach it</summary><p>{example.coaching}</p></details>}
    </div>
    {submitted && <section className="rc-measurement-review" aria-labelledby="rc-result-title">
      <h3 ref={resultHeading} id="rc-result-title" className="rc-review-heading" tabIndex={-1}>Measurement accuracy</h3>
      <MeasurementReview example={example} reference={reference} markers={markers} showMap={showMap}
          onShowMap={setShowMap} onCenter={span => {
            const duration = measureMarkers(span) + 0.2;
            const fittingZoom = [3, 2, 1].find(value => STRIP_SECONDS / value >= duration) ?? 1;
            changeZoom(Math.min(Math.max(2, zoom), fittingZoom), (span[0] + span[1]) / 2);
            viewport.current?.focus({ preventScroll: true });
            const strip = viewport.current;
            if (!strip) return;
            const header = strip.closest('.app-shell')?.querySelector('.ce-module-header');
            const dock = document.querySelector('.ce-tool-dock');
            const top = header?.getBoundingClientRect().bottom ?? 0;
            const dockRect = dock?.getBoundingClientRect();
            const bottom = dockRect?.height ? dockRect.top : window.innerHeight;
            const rect = strip.getBoundingClientRect();
            if (rect.top < top || rect.bottom > bottom) workbench.current?.scrollIntoView({ block: 'start' });
          }} />
    </section>}
    <section id="rc-strip" tabIndex={-1} ref={workbench} className="rc-workbench" aria-label="Calibrated strip and measurements">
      <div className="rc-strip-bar">
        <span>Lead {example.signal.lead} · {STRIP_SECONDS} s · {PAPER_SPEED} mm/s · {GAIN} mm/mV</span>
        <div className="rc-zoom" role="group" aria-label="Strip zoom">
          {[1, 2, 3].map(value => <button type="button" key={value} aria-pressed={zoom === value} onClick={() => changeZoom(value, zoom === 1 && value > 1 ? markers[marker] ?? markers[0] ?? 0 : undefined)}>{value === 1 ? 'Fit' : `${value}×`}</button>)}
        </div>
      </div>
      <div ref={viewport} className="rc-scroll" tabIndex={0} onScroll={event => {
        const pane = event.currentTarget;
        const max = pane.scrollWidth - pane.clientWidth;
        setPan(max > 0 ? Math.round(100 * pane.scrollLeft / max) : 0);
      }} aria-label="Rhythm strip viewport. Scroll horizontally when zoomed.">
        <div className="rc-plot" style={{ width: `${zoom * 100}%` }} onClick={tapStrip}>
          <RhythmStrip rhythmId={example.id} examplePath={example.path} overlay={overlay} accessibleLabel={`Synthetic lead ${example.signal.lead} rhythm strip, six seconds${submitted && showMap ? ', with evidence markers' : ''}`} />
        </div>
      </div>
      {zoom > 1 && <div className="rc-overview">
        <div className="rc-overview-track" aria-hidden="true">
          <RhythmStrip rhythmId={example.id} examplePath={example.path} />
          <span style={{ width: `${100 / zoom}%`, left: `${pan * (1 - 1 / zoom)}%` }} />
        </div>
        <label htmlFor="rc-pan">Pan full strip</label>
        <input id="rc-pan" type="range" min="0" max="100" value={pan} aria-valuetext={`${pan}% along strip`}
          onChange={event => {
            const pane = viewport.current;
            if (pane) pane.scrollLeft = Number(event.target.value) / 100 * (pane.scrollWidth - pane.clientWidth);
          }} />
      </div>}
      {!desktop && rateField}
      {intervals.length > 1 && <div className="rc-intervals rc-interval-picker" role="group" aria-label={submitted ? 'Review measured interval' : 'Interval to measure'}>
        {intervals.map((pair, index) => <button key={index} type="button" aria-pressed={index === active} onClick={() => inspectInterval(index)}>
          Interval {index + 1} · {example.measurements[index].label}<br />{formatSeconds(measureMarkers(pair))}
        </button>)}
      </div>}
      {submitted ? <>
        <p className="rc-overlay-key"><strong>White dashed</strong> · Your A/B
          {showMap && <> · <strong>Gold solid</strong> · Reference
            {example.prPattern && <> · Gold dashed · Nonconducted P</>}</>}
        </p>
      </> : <div className="rc-controls">
        <p className="rc-marker-help">Tap the strip to place A or B. Swipe to pan when zoomed. Fine-tune below.</p>
        <div className="rc-marker-grid">
          {markers.map((value, i) => <div key={i} className="rc-marker-control">
            <button type="button" aria-pressed={marker === i} onClick={() => setMarker(i)}>Marker {i === 0 ? 'A' : 'B'}</button>
            <label htmlFor={`rc-marker-${i}`}><span className="rc-sr">Marker {i === 0 ? 'A' : 'B'} time. </span>{formatSeconds(value)}</label>
            <input id={`rc-marker-${i}`} type="range" min="0" max={STRIP_SECONDS} step="0.01" value={value ?? 0} aria-valuetext={formatSeconds(value)} onChange={event => place(i, Number(event.target.value))} />
          </div>)}
        </div>
        <p className="rc-measurement" aria-live="polite">Measured span · <strong>{formatSeconds(measureMarkers(markers))}</strong></p>
        <a className="rc-jump" href="#rc-answer">Go to questions ↓</a>
      </div>}
    </section>
    {!submitted ? <form id="rc-answer" tabIndex={-1} className="rc-answer" onSubmit={event => { event.preventDefault(); if (ready) setRevealed(true); }}>
      {desktop && rateField}
      {rate?.assessRegularity && <fieldset><legend>Are the R–R intervals evenly spaced?</legend>
        {['Evenly spaced', 'Unevenly spaced'].map(label => <label className="rc-option" key={label}>
          <input type="radio" name="regularity" checked={regularity === label} onChange={() => setRegularity(label)} />{label}
        </label>)}
      </fieldset>}
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
      <p className="rc-hint">Place both markers for each interval and answer the questions above to submit.</p>
    </form> : <section className="rc-result" aria-label="Rhythm feedback">
      {rate && <section className="rc-feedback-card">
        <h3>Ventricular rate and spacing</h3>
        <p><strong>{Number(rateAnswer) === rate.estimate ? 'Estimate matches' : 'Recheck the QRS count'}</strong> · You entered {Number(rateAnswer)} bpm. {rate.count} QRS complexes × 10 ≈ {rate.estimate} bpm.</p>
        <p>This is an estimate over six seconds. Dividing 60 by one R–R interval gives the rate for that interval.</p>
        {rate.assessRegularity ? <>
          <p><strong>{regularity === (rate.regular ? 'Evenly spaced' : 'Unevenly spaced') ? 'Spacing matches' : 'Recheck the spacing'}</strong> · You chose {regularity.toLowerCase()}. Ventricular intervals range from {formatSeconds(rate.shortest)} to {formatSeconds(rate.longest)}.</p>
          <p>Counting P waves separately gives an atrial estimate of {rate.atrialEstimate} bpm. A nonconducted P wave counts toward the atrial estimate only.</p>
        </> : <p>The R–R interval is {formatSeconds(rate.shortest)} here, giving {Math.round(60 / rate.shortest)} bpm by the interval method. Rate alone cannot distinguish sinus bradycardia from junctional rhythm.</p>}
      </section>}
      {(example.prPattern || asksLocalization) && <section className="rc-feedback-card">
        <h3>Clinical observation</h3>
        {example.prPattern && <p><strong>PR observation {observation === example.prPattern ? 'matches' : 'needs review'}</strong> · {PR_OBSERVATIONS[observation]}<br />
          Reference pattern · {PR_OBSERVATIONS[example.prPattern]}
        </p>}
        {asksLocalization && <p><strong>Localization {localization === 'No' ? 'matches' : 'needs review'}</strong> · Your answer: {localization}. Reference answer: No.</p>}
      </section>}
      <section className="rc-feedback-card">
        <div className="rc-review-top"><h3>Rhythm interpretation</h3>
          <span className="rc-status" data-match={answer === example.answer}>{answer === example.answer ? 'Interpretation matches' : 'Review the deciding evidence'}</span>
        </div>
        <p>Your interpretation · {INTERPRETATIONS[answer]}</p>
        <p><strong>Reference rhythm</strong> · {INTERPRETATIONS[example.answer]}</p>
        <p><strong>Closest alternative</strong> · {INTERPRETATIONS[example.alternative]}</p>
        <details><summary>Why this rhythm fits</summary>
          <p>{example.feedback}</p>
          {!slow && <p><strong>Conducted PR spans in strip order.</strong> {example.beats.map(({ p, q }) => q === null ? 'P only' : formatSeconds(q - p)).join(' · ')}</p>}
          {answer === 'uncertain' && <p>A longer strip or another lead can help when atrial activity is unclear. Here, the marked events supply the distinguishing evidence.</p>}
        </details>
      </section>
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
