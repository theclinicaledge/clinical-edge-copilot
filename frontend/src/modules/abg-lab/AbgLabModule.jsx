import { useState, useCallback } from 'react';
import { trackEvent } from '../../analytics';
import { interpretABG } from './abgRules.js';
import '../../styles/tokens.css';
import './abg-lab.css';

// ── Example cases ─────────────────────────────────────────────────────────────
const EXAMPLES = [
  {
    id:    'resp-acidosis',
    label: 'Respiratory acidosis',
    values: { pH: '7.29', paco2: '58', hco3: '27', pao2: '72', fio2: '' },
  },
  {
    id:    'met-acidosis',
    label: 'Metabolic acidosis',
    values: { pH: '7.22', paco2: '30', hco3: '12', pao2: '88', fio2: '' },
  },
  {
    id:    'resp-alkalosis',
    label: 'Respiratory alkalosis',
    values: { pH: '7.51', paco2: '28', hco3: '23', pao2: '96', fio2: '' },
  },
  {
    id:    'met-alkalosis',
    label: 'Metabolic alkalosis',
    values: { pH: '7.49', paco2: '48', hco3: '34', pao2: '82', fio2: '' },
  },
];

const EMPTY = { pH: '', paco2: '', hco3: '', pao2: '', fio2: '' };

// ── CE Logo (shared mark) ─────────────────────────────────────────────────────
function CELogo() {
  return (
    <svg width="30" height="30" viewBox="0 0 225 200" xmlns="http://www.w3.org/2000/svg"
      fill="var(--ce-teal)" aria-label="Clinical Edge" style={{ flexShrink: 0, display: 'block' }}>
      <path d="M 159.1,24.3 A 96,96 0 1,0 159.1,175.7 L 135.7,145.7 A 58,58 0 1,1 135.7,54.3 Z" />
      <path d="M 144.0,57 L 208,45 L 218,58 L 208,70 L 150.0,71 Z" />
      <path d="M 158.0,92 L 215,82 L 225,95 L 215,107 L 158.0,108 Z" />
      <path d="M 150.0,129 L 208,130 L 218,142 L 208,155 L 144.0,143 Z" />
    </svg>
  );
}

function validateFields(f) {
  const pH    = parseFloat(f.pH);
  const paco2 = parseFloat(f.paco2);
  const hco3  = parseFloat(f.hco3);
  if (isNaN(pH) || pH < 6.5 || pH > 8.0)  return 'Enter a valid pH (6.5–8.0).';
  if (isNaN(paco2) || paco2 < 5 || paco2 > 150) return 'Enter a valid PaCO₂ (5–150 mmHg).';
  if (isNaN(hco3) || hco3 < 1 || hco3 > 60) return 'Enter a valid HCO₃ (1–60 mEq/L).';
  if (f.pao2 !== '' && (isNaN(parseFloat(f.pao2)) || parseFloat(f.pao2) < 0 || parseFloat(f.pao2) > 700))
    return 'Enter a valid PaO₂ (0–700 mmHg), or leave blank.';
  if (f.fio2 !== '') {
    const fi = parseFloat(f.fio2);
    if (isNaN(fi) || fi <= 0 || fi > 100) return 'Enter FiO₂ as a decimal (0.21–1.0) or percentage (21–100).';
  }
  return null;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function ResultCard({ result }) {
  const { disorder, phStatus, compensation, steps, oxygenation, pearl } = result;

  return (
    <div className="abg-result">
      {/* Pattern Summary */}
      <div className="abg-card" style={{ marginBottom: 16 }}>
        <div className="abg-card-label">Pattern Summary</div>
        <div className="abg-result-pattern">
          <div className="abg-result-disorder">{disorder}</div>
          <div className="abg-result-meta">
            <strong>pH status:</strong>{' '}
            {phStatus.charAt(0).toUpperCase() + phStatus.slice(1)}
            {compensation && (
              <>
                <br />
                <strong>Compensation:</strong> {compensation}
              </>
            )}
          </div>
        </div>

        <hr className="abg-divider" />

        {/* How I read it */}
        <div className="abg-card-label" style={{ marginBottom: 10 }}>How I Read It</div>
        <ul className="abg-step-list">
          {steps.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </div>

      {/* Oxygenation */}
      {oxygenation && (
        <div className="abg-card" style={{ marginBottom: 16 }}>
          <div className="abg-card-label">Oxygenation</div>
          <div className="abg-oxy-row">
            {oxygenation.pao2Label && (
              <div className="abg-oxy-cell">
                <div className="abg-oxy-cell-label">PaO₂</div>
                <div className="abg-oxy-cell-desc">{oxygenation.pao2Label}</div>
              </div>
            )}
            {oxygenation.pf != null && (
              <div className="abg-oxy-cell">
                <div className="abg-oxy-cell-label">P/F Ratio</div>
                <div className="abg-oxy-cell-value">{oxygenation.pf}</div>
                <div className="abg-oxy-cell-desc">{oxygenation.pfLabel}</div>
              </div>
            )}
          </div>
          {oxygenation.pf != null && (
            <div style={{ fontSize: 11, color: 'var(--ce-text-muted)', marginTop: 8, lineHeight: 1.6, fontFamily: 'var(--ce-font-mono)' }}>
              P/F ratio is commonly used to describe oxygenation severity. FiO₂ used: {oxygenation.fio2Display}.
            </div>
          )}
        </div>
      )}

      {/* Pearl + Safety */}
      <div className="abg-card">
        <div className="abg-card-label" style={{ marginBottom: 10 }}>Nurse-Facing Pearl</div>
        <div className="abg-pearl">
          <span className="abg-pearl-eyebrow">Pearl</span>
          <span className="abg-pearl-text">"{pearl}"</span>
        </div>
        <hr className="abg-divider" />
        <div className="abg-safety">
          Educational pattern recognition only. Interpret with patient context, facility policy, and clinical team guidance. Not a diagnostic tool.
        </div>
      </div>
    </div>
  );
}

// ── Main module ───────────────────────────────────────────────────────────────
export default function AbgLabModule({ onGoHome }) {
  const [fields, setFields]   = useState(EMPTY);
  const [result, setResult]   = useState(null);
  const [error,  setError]    = useState(null);

  const handleField = useCallback((key, val) => {
    setFields(f => ({ ...f, [key]: val }));
    setResult(null);
    setError(null);
  }, []);

  const handleInterpret = useCallback(() => {
    const err = validateFields(fields);
    if (err) { setError(err); return; }

    const r = interpretABG({
      pH:    parseFloat(fields.pH),
      paco2: parseFloat(fields.paco2),
      hco3:  parseFloat(fields.hco3),
      pao2:  fields.pao2,
      fio2:  fields.fio2,
    });
    setResult(r);
    setError(null);

    trackEvent('abg_interpreted', {
      pattern:  r.disorder,
      has_pao2: fields.pao2 !== '',
      has_fio2: fields.fio2 !== '',
    });

    // Scroll to result
    setTimeout(() => {
      document.getElementById('abg-result-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }, [fields]);

  const handleClear = useCallback(() => {
    setFields(EMPTY);
    setResult(null);
    setError(null);
    trackEvent('abg_cleared');
  }, []);

  const handleExample = useCallback((ex) => {
    setFields(ex.values);
    setResult(null);
    setError(null);
    trackEvent('abg_example_used', { example_id: ex.id });

    // Auto-interpret
    setTimeout(() => {
      const r = interpretABG({
        pH:    parseFloat(ex.values.pH),
        paco2: parseFloat(ex.values.paco2),
        hco3:  parseFloat(ex.values.hco3),
        pao2:  ex.values.pao2,
        fio2:  ex.values.fio2,
      });
      setResult(r);
      trackEvent('abg_interpreted', {
        pattern:  r.disorder,
        has_pao2: ex.values.pao2 !== '',
        has_fio2: ex.values.fio2 !== '',
      });
      setTimeout(() => {
        document.getElementById('abg-result-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }, 30);
  }, []);

  // Track module open once
  useState(() => { trackEvent('abg_lab_opened'); });

  return (
    <div className="abg-shell">
      {/* Header */}
      <div className="abg-header">
        <div className="abg-header-inner">
          <CELogo />
          <div className="abg-header-titles">
            <span className="abg-header-name">Clinical Edge</span>
            <span className="abg-header-eyebrow">ABG Lab</span>
          </div>
          <button className="ce-back-link" onClick={onGoHome}>
            ← All tools
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="abg-main">
        <div className="abg-content">
          {/* Hero */}
          <div className="abg-hero">
            <div className="abg-hero-eyebrow">Acid-Base · Oxygenation</div>
            <h1>ABG & Oxygenation Lab</h1>
            <p className="abg-hero-sub">
              Enter ABG values for an educational acid-base pattern breakdown.
            </p>
          </div>

          {/* Examples */}
          <div className="abg-card">
            <div className="abg-card-label">Try an example</div>
            <div className="abg-example-row">
              {EXAMPLES.map(ex => (
                <button key={ex.id} className="abg-example-chip" onClick={() => handleExample(ex)}>
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="abg-card">
            <div className="abg-card-label">Enter ABG Values</div>
            <div className="abg-form">
              <div className="abg-fields-grid">
                {/* Required */}
                <div className="abg-field">
                  <label htmlFor="abg-ph">pH <span className="abg-field-sub">7.35–7.45</span></label>
                  <input
                    id="abg-ph"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="6.5"
                    max="8.0"
                    placeholder="7.32"
                    value={fields.pH}
                    onChange={e => handleField('pH', e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div className="abg-field">
                  <label htmlFor="abg-paco2">PaCO₂ <span className="abg-field-sub">mmHg · 35–45</span></label>
                  <input
                    id="abg-paco2"
                    type="number"
                    inputMode="decimal"
                    step="1"
                    placeholder="58"
                    value={fields.paco2}
                    onChange={e => handleField('paco2', e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div className="abg-field">
                  <label htmlFor="abg-hco3">HCO₃ <span className="abg-field-sub">mEq/L · 22–26</span></label>
                  <input
                    id="abg-hco3"
                    type="number"
                    inputMode="decimal"
                    step="1"
                    placeholder="28"
                    value={fields.hco3}
                    onChange={e => handleField('hco3', e.target.value)}
                    autoComplete="off"
                  />
                </div>
                {/* Optional */}
                <div className="abg-field">
                  <label htmlFor="abg-pao2">PaO₂ <span className="abg-field-sub">mmHg · optional</span></label>
                  <input
                    id="abg-pao2"
                    type="number"
                    inputMode="decimal"
                    step="1"
                    placeholder="72"
                    value={fields.pao2}
                    onChange={e => handleField('pao2', e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* FiO2 full-width */}
              <div className="abg-field">
                <label htmlFor="abg-fio2">FiO₂ <span className="abg-field-sub">decimal or % · optional · e.g. 0.40 or 40</span></label>
                <input
                  id="abg-fio2"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  placeholder="0.40 or 40"
                  value={fields.fio2}
                  onChange={e => handleField('fio2', e.target.value)}
                  autoComplete="off"
                />
              </div>

              {error && (
                <div style={{ fontSize: 13, color: 'var(--ce-urgency-high)', fontWeight: 600, padding: '4px 0' }}>
                  {error}
                </div>
              )}

              <div className="abg-actions">
                <button className="abg-btn-primary" onClick={handleInterpret}>
                  Interpret ABG
                </button>
                <button className="abg-btn-secondary" onClick={handleClear}>
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div id="abg-result-anchor" className="ce-section-enter">
              <ResultCard result={result} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
