import { useRef, useState } from 'react';
import { extractReassessment, confirmReassessment } from './reassessmentModel.js';
import { serializePatientSnapshot } from './patientSnapshotModel.js';
import './reassessment.css';

export function ReassessmentEvidence({ assessment, original }) {
  if (!assessment) return null;
  return <section className="ce-reassessment-evidence" aria-label="Reassessment evidence"><header><span>Verified reassessment</span><h2>What changed since the last assessment?</h2><p>Direction alone does not establish improvement, deterioration, or cause.</p></header><div className="ce-reassessment-groups">{[['changed', 'Changed'], ['unchanged', 'Explicitly unchanged'], ['same', 'Same reported value'], ['current', 'Current observations'], ['interval', 'New interval'], ['unknown', 'Unknown / not reassessed']].map(([kind, title]) => {
    const rows = assessment.delta.filter((row) => row.kind === kind);
    return rows.length ? <section key={kind}><h3>{title}</h3><dl>{rows.map((row) => <div key={row.id}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl></section> : null;
  })}</div><p>Other findings were not reassessed. Previous values are not assumed current.</p><details><summary>Previous verified evidence · not current</summary><pre>{serializePatientSnapshot(assessment.previous)}</pre></details>{original && <details><summary>Original Snapshot · not current</summary><pre>{serializePatientSnapshot(original)}</pre></details>}</section>;
}

export default function Reassessment({ previous, disabled, onConfirm, onCancel }) {
  const [narrative, setNarrative] = useState('');
  const [extraction, setExtraction] = useState(null);
  const [after, setAfter] = useState(false);
  const [error, setError] = useState('');
  const review = useRef(null);
  const buildReview = () => {
    try { setExtraction(extractReassessment(narrative, previous)); setError(''); requestAnimationFrame(() => review.current?.focus()); }
    catch { setError('Enter a concise reassessment, then try again.'); }
  };
  const assessment = extraction && confirmReassessment(previous, extraction, after);
  return <section className="ce-reassessment" aria-label="Bedside reassessment"><header><span>Same encounter</span><h2>Reassess</h2><p>Enter only what you reassessed. Missing findings remain not reassessed.</p></header>
    {!extraction ? <><label htmlFor="reassessment-narrative">New bedside findings</label><p id="reassessment-privacy">No names, MRNs, dates of birth, room numbers, or other patient identifiers.</p><textarea autoFocus id="reassessment-narrative" aria-describedby="reassessment-privacy" value={narrative} maxLength={3000} rows={4} onChange={(e) => setNarrative(e.target.value)} placeholder="BP now 94/56, HR 106. Still drowsy. Urine 15 mL this hour." /><div className="ce-reassessment-actions"><button type="button" onClick={onCancel}>Cancel</button><button type="button" disabled={!narrative.trim() || disabled} onClick={buildReview}>Review reassessment</button></div></> : <div ref={review} tabIndex={-1}><label className="ce-reassessment-after"><input type="checkbox" checked={after} onChange={(e) => setAfter(e.target.checked)} />These observations were made after the last confirmed assessment.</label><p>Check only when that timing is established. Otherwise values remain current-only.</p><div className="ce-reassessment-review"><h3>Verify new evidence</h3>{assessment.delta.map((row) => <div key={row.id}><strong>{row.label}</strong><span>{row.value}</span><small>{row.kind === 'interval' ? 'Single interval · not a trend' : row.kind === 'changed' ? 'Previous → current' : row.kind === 'unchanged' ? 'Explicitly unchanged' : 'Current-only'}</small></div>)}</div>
      {extraction.needsReview.length > 0 && <section aria-label="Needs review"><h3>Needs review</h3>{extraction.needsReview.map((item) => <div className="ce-reassessment-unmapped" key={item.id}><p>{item.text}</p><small>{item.reason}</small><button type="button" onClick={() => setExtraction((value) => ({ ...value, needsReview: value.needsReview.filter((row) => row.id !== item.id) }))}>Omit from reassessment</button></div>)}</section>}<p>Omitted findings stay in previous evidence, not in current reasoning.</p><div className="ce-reassessment-actions"><button type="button" onClick={() => setExtraction(null)}>Edit update</button><button type="button" disabled={disabled || !extraction.rows.length || !!extraction.needsReview.length} onClick={() => onConfirm(assessment)}>Confirm reassessment</button></div></div>}
    {error && <p role="alert">{error}</p>}
  </section>;
}
