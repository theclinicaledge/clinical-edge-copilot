import { useState, useCallback, useEffect, useRef } from 'react';
import { trackEvent } from '../../analytics';
import { interpretABG, validateABGInput } from './abgRules.js';
import ModuleHeader from '../../components/ModuleHeader.jsx';
import '../../styles/tokens.css';
import './abg-lab.css';

const EXAMPLES = [
  { id: 'resp-acidosis', label: 'Respiratory acidosis', values: { pH: '7.29', paco2: '58', hco3: '27', pao2: '72', fio2: '' } },
  { id: 'met-acidosis', label: 'Metabolic acidosis', values: { pH: '7.28', paco2: '26', hco3: '12', pao2: '88', fio2: '' } },
  { id: 'resp-alkalosis', label: 'Respiratory alkalosis', values: { pH: '7.50', paco2: '28', hco3: '21', pao2: '96', fio2: '' } },
  { id: 'met-alkalosis', label: 'Metabolic alkalosis', values: { pH: '7.48', paco2: '47', hco3: '34', pao2: '82', fio2: '' } },
];
const EMPTY = { pH: '', paco2: '', hco3: '', pao2: '', fio2: '' };
const DISPLAY_FIELDS = [
  { key: 'pH', id: 'abg-ph', label: 'pH', hint: '7.35–7.45', placeholder: '7.32', step: '0.01' },
  { key: 'paco2', id: 'abg-paco2', label: 'PaCO₂', hint: 'mmHg · 35–45', placeholder: '58', step: '1' },
  { key: 'hco3', id: 'abg-hco3', label: 'HCO₃', hint: 'mEq/L · 22–26', placeholder: '28', step: '1' },
  { key: 'pao2', id: 'abg-pao2', label: 'PaO₂', hint: 'mmHg · optional', placeholder: '72', step: '1' },
];
const PH_CHOICES = [['acidemia', 'Acid side'], ['near-normal', 'In range'], ['alkalemia', 'Alkaline side']];
const DRIVER_CHOICES = [['co2', 'PaCO₂'], ['hco3', 'HCO₃'], ['both', 'Both'], ['neither', 'Need more context']];
const RESPONSE_CHOICES = [['opposing', 'Opposing pH effects'], ['same', 'Same pH effect'], ['in-range', 'Other value in range'], ['context', 'Need more context']];

function ReasoningWalkthrough({ result }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const { values, phStatus, driver, steps, compensationCheck: check, oxygenation } = result;
  const options = step === 0 ? PH_CHOICES : step === 1 ? DRIVER_CHOICES : RESPONSE_CHOICES;
  const correct = step === 0 ? phStatus : step === 1 ? driver : check.answer;
  const choice = answers[step];
  const choose = key => setAnswers(a => ({ ...a, [step]: key }));
  const titles = ['Check pH', 'Find the clue', 'Look for a response', 'Oxygenation'];

  return (
    <details className="abg-card abg-walkthrough" style={{ padding: 0 }}>
      <summary>Walk me through this ABG<span>Predict, tap, and check your reasoning in four short steps.</span></summary>
      <div className="abg-walk-body">
        <div className="abg-walk-tabs" role="group" aria-label="Reasoning steps">
          {titles.map((title, i) => <button key={title} type="button" aria-pressed={step === i} onClick={() => setStep(i)}>{i + 1}. {title}</button>)}
        </div>
        <section aria-label={`Step ${step + 1}: ${titles[step]}`}>
          {step < 2 ? <>
            <h3>{step === 0 ? `Where does pH ${values.pH} land?` : phStatus === 'near-normal' ? 'Can pH alone identify the primary process?' : 'Which value helps explain the pH direction?'}</h3>
            <p>{step === 0 ? 'Make your call, then compare it with the reference range.'
              : `PaCO₂ ${values.paco2} mmHg · HCO₃ ${values.hco3} mEq/L. Compare each value with its reference range and the pH direction.`}</p>
            {step === 1 && <ul className="abg-step-list">
              <li>PaCO₂ is the respiratory clue (35–45 mmHg). Higher CO₂ lowers pH; lower CO₂ raises pH.</li>
              <li>HCO₃ is the metabolic clue (22–26 mEq/L). Higher bicarbonate raises pH; lower bicarbonate lowers pH.</li>
            </ul>}
            <div className="abg-choices" role="group" aria-label={step === 0 ? 'Choose the pH direction' : 'Choose the contributor'}>
              {options.map(([key, text]) => <button key={key} type="button" className="abg-choice" aria-pressed={choice === key} onClick={() => choose(key)}>{text}</button>)}
            </div>
            {choice != null ? <div className="abg-feedback" role="status">
              <strong>{choice === 'reveal' ? 'Follow the trail' : choice === correct ? 'You spotted it' : 'Follow this clue'}{choice !== correct && choice !== 'reveal' && ` · ${options.find(([key]) => key === correct)[1]}`}</strong>
              {step === 0 ? <>
                <p>{steps[0]} {phStatus === 'near-normal' ? 'In range is a starting point, not an all-clear. Look at CO₂ and bicarbonate next.' : 'Next, find which value helps explain that direction.'}</p>
                <div className="abg-ph-range" aria-label={`pH ${values.pH}: ${phStatus}`}>
                  {PH_CHOICES.map(([key, label], i) => <span key={key} data-current={phStatus === key}>{label}<small>{['< 7.35', '7.35–7.45', '> 7.45'][i]}</small>{phStatus === key && <small>← This pH</small>}</span>)}
                </div>
              </> : <>
                <p>{steps[1]}</p><p>{steps[2]}</p>
                <p>{driver === 'both' ? 'Both push the same way, which supports a mixed pattern.' : driver === 'neither' ? 'The direction alone does not establish a primary process here.' : `${driver === 'co2' ? 'CO₂' : 'Bicarbonate'} matches the pH direction. Next, look at whether the other value pushes pH back toward the reference range.`}</p>
              </>}
            </div> : <button type="button" className="abg-btn-secondary" onClick={() => choose('reveal')}>Reveal the reasoning</button>}
          </> : step === 2 ? <>
            <h3>Do the values push pH the same way?</h3>
            <p>Compensation is the body’s response that moves pH toward its reference range. Compare the effects of both values:</p>
            <ul className="abg-step-list"><li>{steps[1]}</li><li>{steps[2]}</li></ul>
            <div className="abg-choices" role="group" aria-label="Compare the pH effects">
              {RESPONSE_CHOICES.map(([key, text]) => <button key={key} type="button" className="abg-choice" aria-pressed={choice === key} onClick={() => choose(key)}>{text}</button>)}
            </div>
            {choice != null ? <div className="abg-feedback" role="status">
              <strong>{choice === 'reveal' ? 'Follow the trail' : choice === correct ? 'You spotted it' : 'Follow this clue'}{choice !== correct && choice !== 'reveal' && ` · ${options.find(([key]) => key === correct)[1]}`}</strong>
              <p>{check.summary}</p><p>{check.note}</p>
            </div> : <button type="button" className="abg-btn-secondary" onClick={() => choose('reveal')}>Reveal the reasoning</button>}
            <p className="abg-reference-note">A full review may also need timing, trends, electrolytes, and albumin. Anion gap is not calculated here.</p>
          </> : <>
            <h3>Keep oxygenation separate</h3>
            <p>PaCO₂ helps explain ventilation and acid-base balance. PaO₂ describes oxygen in arterial blood; it answers a different question.</p>
            {oxygenation?.pf != null ? <>
              <p>PaO₂ {oxygenation.pao2} mmHg on FiO₂ {oxygenation.fio2Display}. Convert percent to a fraction before dividing.</p>
              <details className="abg-math"><summary>Reveal the P/F calculation</summary><p>{oxygenation.formula}</p></details>
              <p>{oxygenation.note}</p>
            </> : <p>{oxygenation?.note ?? 'PaO₂ and FiO₂ were not entered. This acid-base pattern does not tell us whether oxygenation is adequate.'}</p>}
          </>}
        </section>
        <div className="abg-walk-footer">
          <button type="button" className="abg-btn-secondary" onClick={() => { setAnswers({}); setStep(0); }}>Start over</button>
          <button type="button" className="abg-btn-primary" onClick={() => setStep(s => (s + 1) % 4)}>{step === 3 ? 'Back to pH' : 'Next clue →'}</button>
        </div>
      </div>
    </details>
  );
}

function ResultCard({ result }) {
  const { disorder, phStatus, compensation, steps, oxygenation, pearl } = result;
  return (
    <div className="abg-result">
      <div className="abg-card">
        <h2 className="abg-card-label abg-result-heading">Pattern Summary</h2>
        <div className="abg-result-pattern">
          <div className="abg-result-disorder">{disorder}</div>
          <div className="abg-result-meta"><strong>pH status:</strong> {phStatus.charAt(0).toUpperCase() + phStatus.slice(1)}
            {compensation && <><br /><strong>Response clue:</strong> {compensation}</>}
          </div>
        </div>
        <hr className="abg-divider" />
        <div className="abg-card-label" style={{ marginBottom: 10 }}>How I Read It</div>
        <ul className="abg-step-list">{steps.map(s => <li key={s}>{s}</li>)}</ul>
      </div>
      <ReasoningWalkthrough result={result} />
      {oxygenation && <div className="abg-card">
        <div className="abg-card-label">Oxygenation</div>
        <div className="abg-oxy-row">
          {oxygenation.pao2 != null && <div className="abg-oxy-cell"><div className="abg-oxy-cell-label">PaO₂</div><div className="abg-oxy-cell-value">{oxygenation.pao2} mmHg</div><div className="abg-oxy-cell-desc">{oxygenation.pao2Label}</div></div>}
          {oxygenation.pf != null && <div className="abg-oxy-cell"><div className="abg-oxy-cell-label">P/F Ratio</div><div className="abg-oxy-cell-value">{oxygenation.pf}</div><div className="abg-oxy-cell-desc">{oxygenation.pfLabel} · FiO₂ {oxygenation.fio2Display}</div></div>}
        </div>
        <p className="abg-reference-note">{oxygenation.note}</p>
      </div>}
      <div className="abg-card">
        <div className="abg-card-label">Nurse-Facing Pearl</div>
        <div className="abg-pearl"><span className="abg-pearl-eyebrow">Pearl</span><span className="abg-pearl-text">{pearl}</span></div>
        <p className="abg-reference-note">Check the basis: <a href="https://www.merckmanuals.com/professional/nephrology/acid-base-regulation-and-disorders/acid-base-disorders" target="_blank" rel="noreferrer">acid-base reasoning</a> · <a href="https://doi.org/10.1164/rccm.202303-0558WS" target="_blank" rel="noreferrer">oxygenation context</a></p>
        <hr className="abg-divider" />
        <div className="abg-safety">Educational pattern recognition only. Interpret with patient context, facility policy, and clinical team guidance. Not a diagnostic tool.</div>
      </div>
    </div>
  );
}

export default function AbgLabModule({ onGoHome, initialExampleId = null, fromDrowsyShift = false }) {
  const ExamplesContainer = fromDrowsyShift ? 'details' : 'div';
  const ExamplesLabel = fromDrowsyShift ? 'summary' : 'div';
  const [fields, setFields] = useState(() => EXAMPLES.find(ex => ex.id === initialExampleId)?.values || EMPTY);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const resultRef = useRef(null);
  useEffect(() => { trackEvent('abg_lab_opened'); }, []);
  useEffect(() => {
    if (!result) return;
    resultRef.current?.focus({ preventScroll: true });
    resultRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  }, [result]);

  const handleField = useCallback((key, val) => { setFields(f => ({ ...f, [key]: val })); setResult(null); setError(null); }, []);
  const readValues = useCallback(values => {
    const err = validateABGInput(values);
    if (err) { setError(err); return; }
    const next = interpretABG(values);
    setResult(next); setError(null);
    trackEvent('abg_interpreted', { has_pao2: values.pao2 !== '', has_fio2: values.fio2 !== '' });
  }, []);
  const handleExample = useCallback(ex => {
    setFields(ex.values);
    readValues(ex.values);
    trackEvent('abg_example_used', { example_id: ex.id });
  }, [readValues]);
  const handleClear = useCallback(() => { setFields(EMPTY); setResult(null); setError(null); trackEvent('abg_cleared'); }, []);

  return (
    <div className="abg-shell">
      <ModuleHeader moduleName="ABG Lab" onGoHome={onGoHome} maxWidth="680px" />
      <div className="abg-main"><div className="abg-content">
        <div className="abg-hero"><div className="abg-hero-eyebrow">Acid-Base · Oxygenation</div><h1>ABG & Oxygenation Lab</h1><p className="abg-hero-sub">Get the pattern, then follow the clues that explain it.</p></div>
        {fromDrowsyShift && <section className="abg-connected-practice" aria-label="Practice after The Drowsy Patient">
          <p className="abg-card-label">From The Drowsy Patient</p>
          <h2>Practice respiratory acidosis</h2>
          <p>A separate practice example, not Room 12's results. The existing ABG Lab example uses different values from the Shift.</p>
          <button type="button" className="abg-btn-primary" onClick={() => handleExample(EXAMPLES.find(ex => ex.id === 'resp-acidosis'))}>Explore this example <span aria-hidden="true">→</span></button>
        </section>}
        <ExamplesContainer className="abg-card"><ExamplesLabel className="abg-card-label">{fromDrowsyShift ? 'Try another example' : 'Try an example'}</ExamplesLabel><div className="abg-example-row">
          {EXAMPLES.map(ex => <button type="button" key={ex.id} className="abg-example-chip" onClick={() => handleExample(ex)}>{ex.label}</button>)}
        </div></ExamplesContainer>
        <div className="abg-card"><div className="abg-card-label">Enter ABG Values</div>
          <form className="abg-form" noValidate onSubmit={e => { e.preventDefault(); readValues(fields); }}>
            <div className="abg-fields-grid">{DISPLAY_FIELDS.map(field => <div key={field.key} className="abg-field">
              <label htmlFor={field.id}>{field.label} <span className="abg-field-sub">{field.hint}</span></label>
              <input id={field.id} type="number" inputMode="decimal" step={field.step} placeholder={field.placeholder} value={fields[field.key]} onChange={e => handleField(field.key, e.target.value)} autoComplete="off" aria-describedby="abg-input-note" />
            </div>)}</div>
            <div className="abg-field"><label htmlFor="abg-fio2">FiO₂ <span className="abg-field-sub">decimal or % · optional · e.g. 0.40 or 40</span></label><input id="abg-fio2" type="number" inputMode="decimal" step="0.01" placeholder="0.40 or 40" value={fields.fio2} onChange={e => handleField('fio2', e.target.value)} autoComplete="off" aria-describedby="abg-input-note" /></div>
            <p className="abg-input-note" id="abg-input-note">Use arterial blood gas values. Numbers stay on this device; this calculator does not send them to AI.</p>
            {error && <div role="alert" style={{ fontSize: 13, color: 'var(--ce-urgency-high)', fontWeight: 600 }}>{error}</div>}
            <div className="abg-actions"><button type="submit" className="abg-btn-primary">Interpret ABG</button><button type="button" className="abg-btn-secondary" onClick={handleClear}>Clear</button></div>
          </form>
        </div>
        {result && <section id="abg-result-anchor" ref={resultRef} tabIndex={-1} aria-label="ABG interpretation"><ResultCard key={JSON.stringify(result.values) + JSON.stringify(result.oxygenation)} result={result} /></section>}
      </div></div>
    </div>
  );
}
