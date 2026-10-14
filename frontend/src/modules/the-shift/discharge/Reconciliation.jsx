import { useRef, useState } from 'react';
import { script } from './data.js';
import { comparisons, selectedComparisons, flagsForComparisons, toggleComparison } from './reconciliation.js';
import { conflictFound } from './progress.js';
import './reconciliation.css';

export default function Reconciliation({ flags, submitted, onFlag, onSubmit, onNote, sources, noteSources, continueAction }) {
  const [active, setActive] = useState('apixaban');
  const [seen, setSeen] = useState(['apixaban']);
  const panel = useRef(null), review = useRef(null);
  const selection = selectedComparisons(flags);
  const index = comparisons.findIndex(item => item.id === active), item = comparisons[index];
  const navigate = id => {
    setActive(id); setSeen(previous => [...new Set([...previous, id])]);
    requestAnimationFrame(() => { panel.current?.focus({ preventScroll: true }); panel.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' }); });
  };
  const submit = () => {
    onSubmit(flagsForComparisons(selection));
    requestAnimationFrame(() => { review.current?.focus({ preventScroll: true }); review.current?.scrollIntoView({ block: 'start', behavior: 'instant' }); });
  };
  const feedbackItems = comparisons.filter(comparison => ['apixaban', 'water-pill', 'gi-followup'].includes(comparison.id) || selection.includes(comparison.id));
  return <section className="discharge-reconciliation" aria-label="Medication reconciliation">
    <p className="reconcile-prompt">What needs clarification or extra teaching before discharge?</p>
    <p className="reconcile-context">The home list is historical context. Compare the plan with the instructions, then flag one concern per item.</p>
    <details className="discharge-note reconcile-note" onToggle={event => { if (event.currentTarget.open) onNote(); }}><summary>Day 2 progress note <span>Optional chart context</span></summary><p>{script.note}</p>{noteSources}</details>
    <div className="reconcile-workspace">
      <nav className="reconcile-index" aria-label="Medications and follow-up">
        <p className="shift-overline">Review together</p>
        {comparisons.map((comparison, i) => <button key={comparison.id} aria-current={active === comparison.id ? 'true' : undefined} onClick={() => navigate(comparison.id)}><span className="reconcile-index-number" aria-hidden="true">0{i + 1}</span><span>{comparison.title}<small>{selection.includes(comparison.id) ? 'Flagged' : seen.includes(comparison.id) ? 'Viewed' : 'Not viewed'}</small></span>{selection.includes(comparison.id) && <span className="reconcile-index-flag" aria-hidden="true">●</span>}</button>)}
      </nav>
      <div className="reconcile-reading">
        <article className="reconcile-card" aria-labelledby="reconcile-item-title">
          <header><div><span className="shift-overline">{item.label}</span><h2 id="reconcile-item-title" ref={panel} tabIndex={-1}>{item.title}</h2></div><span className="reconcile-item-count">{index + 1} / {comparisons.length}</span></header>
          <div className="reconcile-sources">{item.cells.map((cell, i) => <section key={i} aria-label={['Home medication list', 'Provider discharge list', 'Patient discharge instructions'][i]}><h3><span aria-hidden="true">0{i + 1}</span>{['Home list', 'Provider discharge list', 'Patient instructions'][i]}</h3><small>{['Historical context', 'Discharge plan', 'Patient copy'][i]}</small>{cell.text.length ? cell.text.map(text => <p key={text}>{text}</p>) : <p className="reconcile-absent">{cell.empty}</p>}</section>)}</div>
          <div className="reconcile-card-action"><button className="reconcile-flag-action" aria-pressed={selection.includes(active)} disabled={submitted} onClick={() => onFlag(toggleComparison(flags, active))}><span aria-hidden="true">{selection.includes(active) ? '✓' : '+'}</span>{selection.includes(active) ? 'Concern flagged' : 'Flag concern'}</button><span>{submitted ? 'First review recorded' : selection.includes(active) ? 'Select again to remove' : 'Clarification or patient teaching'}</span></div>
        </article>
        <div className="reconcile-pagination"><button aria-label="Previous item" title="Previous item" disabled={index === 0} onClick={() => navigate(comparisons[index - 1].id)}>←</button><span>{seen.length} of {comparisons.length} viewed</span><button aria-label="Next item" title="Next item" disabled={index === comparisons.length - 1} onClick={() => navigate(comparisons[index + 1].id)}>→</button></div>
      </div>
    </div>
    {!submitted ? <div className="reconcile-submit"><div><strong>{selection.length} {selection.length === 1 ? 'concern' : 'concerns'} flagged</strong><p role="status">{selection.length ? comparisons.filter(comparison => selection.includes(comparison.id)).map(comparison => comparison.title).join(' · ') : 'No concerns flagged yet'}</p></div><button className="shift-primary" onClick={submit}>Done reviewing <span aria-hidden="true">→</span></button></div> : <section className="reconcile-review" aria-label="Reconciliation feedback"><p className="shift-overline">Your reconciliation</p><h2 ref={review} tabIndex={-1}>{conflictFound(flags) ? 'You found the conflicting directions.' : 'The discharge directions disagree.'}</h2><p className="reconcile-feedback-intro">An order conflict, a teaching concern and an unfinished follow-up need different responses.</p><ol>{feedbackItems.map(comparison => <li key={comparison.id}><span className="reconcile-feedback-mark" aria-hidden="true">{selection.includes(comparison.id) ? '✓' : '↗'}</span><div><span className="shift-overline">{selection.includes(comparison.id) ? 'You flagged' : 'Also notice'} / {comparison.title}</span><h3>{comparison.feedbackTitle}</h3><p>{comparison.feedback}</p>{['metoprolol', 'atorvastatin', 'pantoprazole'].includes(comparison.id) && <small>No penalty for raising this question.</small>}</div></li>)}</ol>{sources}{continueAction}</section>}
  </section>;
}
