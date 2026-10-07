import { useEffect, useRef, useState } from 'react';
import ModuleHeader from './components/ModuleHeader.jsx';
import AskABGResult from './components/AskABGResult.jsx';
import { selectSnapshotContext, reportedFacts } from '../../backend/ask-snapshot-context.mjs';
import { trackEvent } from './analytics';
import { SOURCES } from './data/clinicalSources.js';
import './styles/ask-clinical-edge.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://clinical-edge-copilot.onrender.com' : 'http://localhost:3001');
const ERRORS = {
  identifier_pattern: 'Remove names, MRNs, dates of birth and other patient identifiers. This check cannot guarantee de-identification.',
  invalid_question: 'Enter a nursing question of 4 to 4000 characters.',
  invalid_context_boundary: 'General mode cannot use Snapshot context.',
  provider_not_configured: 'The clinical education service is unavailable.',
  provider_timeout: 'The answer took too long. Your question is unchanged.',
  provider_rate_limit: 'The service is busy. Please wait before asking again.',
  answer_not_accepted: 'An answer could not be safely completed. Your question is unchanged.',
};

function Answer({ text }) {
  return text.split(/\n\s*\n/).filter(Boolean).map((block, i) => {
    const lines = block.split('\n');
    return lines.every(line => /^-\s/.test(line))
      ? <ul key={i}>{lines.map((line, j) => <li key={j}>{line.replace(/^-\s+/, '')}</li>)}</ul>
      : <p key={i}>{block}</p>;
  });
}

export default function AskClinicalEdge({ navigate, isVisible, snapshot = null }) {
  const [contextChoice, setContextChoice] = useState(null);
  const contextEnabled = Boolean(snapshot && contextChoice === snapshot);
  const currentSnapshot = useRef(snapshot);
  currentSnapshot.current = snapshot;
  const requestSnapshot = useRef(null);
  const [question, setQuestion] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [answer, setAnswer] = useState('');
  const [details, setDetails] = useState([]);
  const [answerContext, setAnswerContext] = useState(null);
  const selectedContext = selectSnapshotContext(question, snapshot, contextEnabled);
  const visibleAnswer = answer && (!answerContext?.snapshotUse || answerContext.snapshot === snapshot);
  const [abg, setAbg] = useState(null);
  const [abgTeaching, setAbgTeaching] = useState([]);
  const [abgCatalog, setAbgCatalog] = useState([]);
  const [explanationNotice, setExplanationNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef(null);
  const input = useRef(null);
  const presentationDetails = abg || answerContext?.snapshotUse ? details : [...details].sort((a, b) => {
    const rank = heading => ({ 'At the bedside': 0, Safety: 1, 'What changes interpretation': 2 }[heading] ?? 3);
    return rank(a.heading) - rank(b.heading);
  });
  useEffect(() => { if (isVisible) trackEvent('ask_opened', { mode: 'general' }); }, [isVisible]);
  useEffect(() => () => pending.current?.abort(), []);
  useEffect(() => () => { if (snapshot && requestSnapshot.current === snapshot) pending.current?.abort(); }, [snapshot]);
  const submit = async (event, explain = false) => {
    event.preventDefault();
    if (pending.current || (explain ? submitted : question).trim().length < 4) return;
    const controller = new AbortController();
    const context = explain ? null : selectedContext;
    const submittedSnapshot = context ? snapshot : null;
    requestSnapshot.current = submittedSnapshot;
    pending.current = controller;
    const timer = setTimeout(() => controller.abort('timeout'), 35000);
    setBusy(true); setError(''); setExplanationNotice('');
    trackEvent('ask_submitted', { mode: 'general' });
    try {
      const response = await fetch(`${API_BASE}/api/ask`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: explain ? submitted : question.trim(), contextMode: context ? 'snapshot' : 'general', ...(context ? { snapshotContext: context } : {}), ...(explain ? { abgExplanation: true } : {}) }), signal: controller.signal });
      const data = await response.json().catch(() => ({}));
      if (submittedSnapshot && currentSnapshot.current !== submittedSnapshot) return;
      if (explain) {
        // Explanation responses cannot replace the authoritative result, answer, sources or reported values.
        const ids = data.abgExplanation?.pointIds;
        if (response.ok && data.contextMode === 'general' && data.abgExplanation?.status === 'selected' && Array.isArray(ids) && ids.length >= 1 && ids.length <= 3
          && new Set(ids).size === ids.length && ids.every(id => abgCatalog.some(point => point.id === id))) setAbgTeaching(ids.map(id => abgCatalog.find(point => point.id === id)));
        else setExplanationNotice('Additional explanation unavailable. The rule-based interpretation is unchanged.');
        return;
      }
      if (!response.ok || !['general', 'snapshot'].includes(data.contextMode) || typeof data.answer !== 'string' || (data.contextMode === 'snapshot' && !context)) {
        setError(ERRORS[data.error?.code] || 'The answer service is unavailable. Your question is unchanged.');
        trackEvent('ask_failed', { mode: 'general', status: response.status });
        return;
      }
      setSubmitted(question.trim()); setAnswer(data.answer);
      setAbg(data.abg || null); setAbgTeaching(Array.isArray(data.abgTeaching) ? data.abgTeaching : []);
      setAbgCatalog(Array.isArray(data.abgExplanationOptions) ? data.abgExplanationOptions : []);
      setDetails(Array.isArray(data.details) ? data.details.filter(d => typeof d.heading === 'string' && typeof d.text === 'string') : []);
      setAnswerContext({ questionKind: data.questionKind || 'education', offerSnapshot: data.offerSnapshot === true, evidence: data.evidence, snapshotUse: data.snapshotUse, snapshot: submittedSnapshot });
      trackEvent('ask_answered', { mode: 'general' });
    } catch {
      if (explain) setExplanationNotice('Additional explanation unavailable. The rule-based interpretation is unchanged.');
      else setError(controller.signal.aborted ? controller.signal.reason === 'timeout' ? ERRORS.provider_timeout : 'Request cancelled. Your question is unchanged.' : 'Connection unavailable. Your question is unchanged.');
      trackEvent('ask_failed', { mode: 'general', status: 0 });
    } finally {
      clearTimeout(timer); pending.current = null; setBusy(false);
    }
  };
  return <div className="ce-ask-page">
    <ModuleHeader moduleName="Ask Clinical Edge" onGoHome={() => navigate('/')} />
    <main className="ce-ask-main">
      <header><span className="ce-ask-scope">Nursing questions</span><h1>Ask Clinical Edge</h1></header>
      <form onSubmit={submit}>
        <div className="ce-ask-context">
          <strong>{contextEnabled ? 'Using Patient Snapshot' : 'General Ask'}</strong>
          {snapshot ? <label><input type="checkbox" checked={contextEnabled} disabled={busy} onChange={e => setContextChoice(e.target.checked ? snapshot : null)} />Use confirmed Patient Snapshot</label>
            : <div className="ce-ask-empty"><div><span>No Snapshot selected</span><p>Add non-identifying context for a more specific answer.</p></div><button type="button" onClick={() => navigate('/copilot')}>Create Snapshot <span aria-hidden="true">&#8594;</span></button></div>}
          {contextEnabled && !selectedContext && <p>No relevant Snapshot facts selected. This question will use General Ask.</p>}
          {selectedContext && <details><summary>Reported facts selected for this question ({selectedContext.facts.length})</summary><ul>{reportedFacts(selectedContext).map(fact => <li key={fact.id}><strong>{fact.label}: </strong>{fact.text}</li>)}</ul></details>}
        </div>
        <label htmlFor="ask-question">Nursing question</label>
        <p id="ask-privacy" className="ce-ask-privacy">No names, MRNs, dates of birth or other patient identifiers. Identifier checks do not guarantee de-identification.</p>
        <textarea id="ask-question" ref={input} value={question} onChange={e => setQuestion(e.target.value)} aria-describedby="ask-privacy" placeholder="What would you like to understand?" maxLength={4000} rows={4} disabled={busy} />
        <div className="ce-ask-controls">
          <button className="ce-ask-submit" aria-label="Ask Clinical Edge" disabled={busy || question.trim().length < 4} type="submit">{busy ? <span role="status"><span className="ce-ask-spinner" aria-hidden="true" />Preparing your answer...</span> : <>Ask Clinical Edge <span aria-hidden="true">&#8594;</span></>}</button>
          {busy && <button className="ce-ask-cancel" type="button" onClick={() => pending.current?.abort()} aria-label="Cancel question">Cancel</button>}
          {!busy && (answer || question) && <button type="button" onClick={() => { setQuestion(''); setSubmitted(''); setAnswer(''); setDetails([]); setAnswerContext(null); setAbg(null); setAbgTeaching([]); setAbgCatalog([]); setExplanationNotice(''); setError(''); input.current?.focus(); }}>New question</button>}
        </div>
      </form>
      {error && <p className="ce-ask-error" role="alert">{error}</p>}
      {answer && !visibleAnswer && <p role="status">The Snapshot changed. Enable the current Snapshot and ask again; the previous patient answer is no longer shown.</p>}
      {visibleAnswer && <section className="ce-ask-answer" aria-labelledby="ask-answer-heading" aria-live="polite">
        <strong className="ce-ask-answer-mode">{answerContext?.snapshotUse ? 'Using Patient Snapshot' : 'General Ask'}</strong>
        <header><div><span className="ce-ask-scope">{answerContext?.questionKind === 'reported_context' ? 'Reported context · Not a diagnosis' : 'Nursing education'}</span><h2 id="ask-answer-heading">{submitted}</h2></div></header>
        {abg ? <AskABGResult result={abg} /> : <div className="ce-ask-direct"><Answer text={answer} /></div>}
        {answerContext?.snapshotUse && <>
          <details className="ce-ask-context"><summary>REPORTED · Information used</summary><ul>{answerContext.snapshotUse.reported.map(fact => <li key={fact.id}><strong>{fact.label}: </strong>{fact.text}</li>)}</ul></details>
          {answerContext.snapshotUse.calculated && (answerContext.snapshotUse.synthesisBindings
            ? <details className="ce-ask-context"><summary>CALCULATED · ABG rule check</summary><AskABGResult result={answerContext.snapshotUse.calculated} /></details>
            : <section className="ce-ask-detail"><h3>CALCULATED · ABG rule check</h3><AskABGResult result={answerContext.snapshotUse.calculated} /></section>)}
          <p className="ce-ask-scope">{answerContext.snapshotUse.interpretationLabel} · {answerContext.snapshotUse.resolution === 'model_selected' ? 'AI-selected reference explanation' : 'Reference-guided explanation; not a model-generated answer'}</p>
          {answerContext.snapshotUse.unknown.length > 0 && <section className="ce-ask-detail"><h3>UNKNOWN · What would change interpretation</h3><ul>{answerContext.snapshotUse.unknown.map(text => <li key={text}>{text}</li>)}</ul></section>}
        </>}
        {abgTeaching.length > 0 && <section className="ce-ask-detail" aria-label="ABG physiology explanation"><h3>Why</h3>{abgTeaching.map(point => <p key={point.id}>{point.text}</p>)}</section>}
        {abg?.status === 'verified' && <div className="ce-ask-controls"><button type="button" disabled={busy} onClick={event => submit(event, true)}>Explain this pattern <span aria-hidden="true">&#8594;</span></button></div>}
        {explanationNotice && <p role="status">{explanationNotice}</p>}
        {presentationDetails.map((detail, index) => <section className={'ce-ask-detail' + (detail.heading === 'At the bedside' ? ' ce-ask-bedside' : '')} key={index}><h3>{detail.heading}</h3><Answer text={detail.text} /></section>)}
        {answerContext?.evidence && (!abg || abg.status === 'verified') && <aside className="ce-ask-evidence" aria-label="Evidence boundary">
          {['curated_evidence', 'scope_limited', 'deterministic_rules', 'snapshot_reference'].includes(answerContext.evidence.status) ? <>
            <h3>{answerContext.evidence.status === 'scope_limited' ? 'Limited evidence coverage' : answerContext.evidence.status === 'deterministic_rules' ? 'Sources for these rules' : 'References supplied for this answer'}</h3>
            <p>{answerContext.evidence.status === 'snapshot_reference' ? 'Reported facts come from the confirmed Snapshot. Curated references support the bounded physiology explanation, not independent verification of the case. ABG calculations remain code-owned.' : answerContext.evidence.status === 'scope_limited' ? 'A bounded reference explanation, not a complete model-generated answer.' : answerContext.evidence.status === 'deterministic_rules' ? 'Code applies these source-backed rules. Calculations and interpretation are not generated or independently verified by the AI.' : 'Curated excerpts were provided before generation. References support general concepts, not additional patient findings or independent verification of every sentence.'}</p>
            {answerContext.evidence.deviceScope && <p>{answerContext.evidence.deviceScope}</p>}
            <ul className="ce-ask-sources">{(Array.isArray(answerContext.evidence.sources) ? answerContext.evidence.sources : []).filter(source => source && typeof source.title === 'string' && typeof source.publisher === 'string' && typeof source.url === 'string' && source.url.startsWith('https://')).map(source => <li key={source.id}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a><span>{source.publisher}{source.publication && ` · ${source.publication}`}{source.updated && ` · Updated ${source.updated}`}</span></li>)}</ul>
          </> : <p>{answerContext.evidence.requiresVerification ? 'Reference check required. This generated explanation was not verified against a current source. Confirm medication specifics, numerical criteria and device guidance in approved references and local policy.' : 'Educational support, not a source-verified clinical recommendation. Use clinical judgment and local protocol/provider guidance.'}</p>}
          {answerContext.evidence.categories?.includes('medication') && <a href={SOURCES['dailymed-fda-labeling'].url} target="_blank" rel="noopener noreferrer">Check official medication labeling</a>}
        </aside>}
        {answerContext?.offerSnapshot && <div className="ce-ask-handoff"><button type="button" onClick={() => navigate('/copilot?capture=rapid')}>Open Shift Brain <span aria-hidden="true">&#8594;</span></button><span>No question or answer is transferred.</span></div>}
      </section>}
    </main>
  </div>;
}
