import { useEffect, useRef, useState } from 'react';
import ModuleHeader from './components/ModuleHeader.jsx';
import AskABGResult from './components/AskABGResult.jsx';
import { selectSnapshotContext, reportedFacts } from '../../backend/ask-snapshot-context.mjs';
import { trackEvent } from './analytics';
import { SOURCES } from './data/clinicalSources.js';
import './styles/ask-clinical-edge.css';
import { aiRequestHeaders } from './deviceId.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://clinical-edge-copilot.onrender.com' : 'http://localhost:3001');
const PUBLIC_BETA = import.meta.env.VITE_ASK_PUBLIC_BETA_ENABLED === 'true';
const CONVERSATION_PREVIEW = PUBLIC_BETA || import.meta.env.DEV && import.meta.env.VITE_LOCAL_CONVERSATIONAL_PREVIEW === 'true'
  && ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
const ERRORS = {
  free_daily_limit_reached: "You've used today's free AI questions. They reset at midnight Pacific. Reference tools, Rhythm Lab and ABG interpretation still work.",
  ai_daily_budget_reached: "Ask is resting until tomorrow. Today's AI capacity is used up and resets at midnight Pacific. Reference tools, Rhythm Lab and ABG interpretation still work.",
  output_safety_withheld: 'This explanation was withheld because its care-advice or evidence boundary could not be safely established. Your question and earlier explanation are unchanged. For patient care, use your local clinical team, not this preview.',
  educational_scope_unavailable: 'This preview explains nursing concepts, not individual diagnoses, treatment decisions or urgent care.',
  consent_required: 'Educational consent expired or was withdrawn. Enable the conversation again before asking.',
  conversation_limit: 'This short educational conversation has reached its turn limit. Start a new conversation to continue.',
  ask_temporarily_restricted: 'General and Snapshot-aware Ask are temporarily paused for safety review. Your question is unchanged. Deterministic ABG interpretation, Rhythm Lab and reference tools remain available. For patient care, use bedside assessment and your local clinical team; do not wait for Ask.',
  identifier_pattern: 'Remove names, MRNs, dates of birth and other patient identifiers. This check cannot guarantee de-identification.',
  invalid_question: 'Enter a nursing question of 4 to 4000 characters.',
  invalid_context_boundary: 'General mode cannot use Snapshot context.',
  provider_not_configured: 'The clinical education service is unavailable.',
  provider_timeout: 'The answer took too long. Your question is unchanged.',
  provider_rate_limit: 'The service is busy. Please wait before asking again.',
  answer_not_accepted: 'An answer could not be safely completed. Your question is unchanged.',
};
const limitMessage=data=>['free_daily_limit_reached','ai_daily_budget_reached'].includes(data.error?.code)&&typeof data.error.message==='string'?data.error.message:null;

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
  const [answerRequestId, setAnswerRequestId] = useState(null);
  const [details, setDetails] = useState([]);
  const [earlierExplanations, setEarlierExplanations] = useState([]);
  const [previewConsent, setPreviewConsent] = useState(false);
  const [dailyAllowance,setDailyAllowance]=useState(null);
  const consentReceipt = useRef(null);
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
  useEffect(() => () => {
    if (CONVERSATION_PREVIEW && consentReceipt.current) fetch(`${API_BASE}/api/ask/v1/conversation/consent`, { method: 'DELETE', headers: { Authorization: `Bearer ${consentReceipt.current}` }, keepalive: true }).catch(() => {});
  }, []);
  useEffect(() => () => { if (snapshot && requestSnapshot.current === snapshot) pending.current?.abort(); }, [snapshot]);
  const submit = async (event, explain = false) => {
    event.preventDefault();
    if (pending.current || (explain ? submitted : question).trim().length < 4) return;
    if (CONVERSATION_PREVIEW && !previewConsent) { setError(ERRORS.consent_required); return; }
    if (CONVERSATION_PREVIEW) {
      let localAPI = false;
      try { const url = new URL(API_BASE); localAPI = ['http:', 'https:'].includes(url.protocol) && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname); } catch { /* Invalid preview configuration remains closed. */ }
      if (!(import.meta.env.DEV && localAPI) && !(PUBLIC_BETA && API_BASE === 'https://clinical-edge-copilot.onrender.com')) { setError('The educational service configuration is unavailable. No question was sent.'); return; }
    }
    const controller = new AbortController();
    const context = CONVERSATION_PREVIEW || explain ? null : selectedContext;
    const submittedSnapshot = context ? snapshot : null;
    requestSnapshot.current = submittedSnapshot;
    pending.current = controller;
    const timer = setTimeout(() => controller.abort('timeout'), CONVERSATION_PREVIEW ? 60000 : 35000);
    setBusy(true); setError(''); setExplanationNotice('');
    trackEvent('ask_submitted', { mode: 'general' });
    try {
      const response = await fetch(`${API_BASE}${CONVERSATION_PREVIEW ? '/api/ask/v1/conversation/preview' : '/api/ask'}`, { method: 'POST', headers: { ...aiRequestHeaders(), ...(CONVERSATION_PREVIEW ? { Authorization: `Bearer ${consentReceipt.current}` } : {}) }, body: JSON.stringify(CONVERSATION_PREVIEW ? { question } : { question: explain ? submitted : question.trim(), contextMode: context ? 'snapshot' : 'general', ...(context ? { snapshotContext: context } : {}), ...(explain ? { abgExplanation: true } : {}) }), signal: controller.signal });
      const data = await response.json().catch(() => ({}));
      if (submittedSnapshot && currentSnapshot.current !== submittedSnapshot) return;
      if (explain) {
        // Explanation responses cannot replace the authoritative result, answer, sources or reported values.
        const ids = data.abgExplanation?.pointIds;
        if (response.ok && data.contextMode === 'general' && data.abgExplanation?.status === 'selected' && Array.isArray(ids) && ids.length >= 1 && ids.length <= 3
          && new Set(ids).size === ids.length && ids.every(id => abgCatalog.some(point => point.id === id))) setAbgTeaching(ids.map(id => abgCatalog.find(point => point.id === id)));
        else setExplanationNotice(limitMessage(data) || 'Additional explanation unavailable. The rule-based interpretation is unchanged.');
        return;
      }
      if (!response.ok || !['general', 'snapshot'].includes(data.contextMode) || typeof data.answer !== 'string' || (data.contextMode === 'snapshot' && !context)) {
        if (CONVERSATION_PREVIEW && data.error?.code === 'consent_required') { setPreviewConsent(false); consentReceipt.current = null; }
        setError(limitMessage(data) || (CONVERSATION_PREVIEW && data.error?.code === 'educational_scope_unavailable' && typeof data.error.message === 'string' ? data.error.message : ERRORS[data.error?.code] || 'The answer service is unavailable. Your question is unchanged.'));
        trackEvent('ask_failed', { mode: 'general', status: response.status });
        return;
      }
      if (CONVERSATION_PREVIEW && answer) setEarlierExplanations(previous => [...previous, { question: submitted, answer, details, sources: answerContext?.evidence?.sources || [] }].slice(-5));
      setSubmitted(question.trim()); setAnswer(data.answer); setAnswerRequestId(typeof data.requestId === 'string' ? data.requestId : null);
      setAbg(data.abg || null); setAbgTeaching(Array.isArray(data.abgTeaching) ? data.abgTeaching : []);
      setAbgCatalog(Array.isArray(data.abgExplanationOptions) ? data.abgExplanationOptions : []);
      setDetails(Array.isArray(data.details) ? data.details.filter(d => typeof d.heading === 'string' && typeof d.text === 'string') : []);
      setAnswerContext({ questionKind: data.questionKind || 'education', educationalReframing:data.educationalReframing===true, offerSnapshot: data.offerSnapshot === true, evidence: data.evidence, snapshotUse: data.snapshotUse, snapshot: submittedSnapshot });
      trackEvent('ask_answered', { mode: 'general' });
    } catch {
      if (explain) setExplanationNotice('Additional explanation unavailable. The rule-based interpretation is unchanged.');
      else setError(controller.signal.aborted ? controller.signal.reason === 'timeout' ? ERRORS.provider_timeout : 'Request cancelled. Your question is unchanged.' : 'Connection unavailable. Your question is unchanged.');
      trackEvent('ask_failed', { mode: 'general', status: 0 });
    } finally {
      clearTimeout(timer); pending.current = null; setBusy(false);
    }
  };
  const enablePreview = async () => {
    setBusy(true); setError('');
    try {
      const url = new URL(API_BASE);
      if (!(import.meta.env.DEV && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) && !(PUBLIC_BETA && url.href.replace(/\/$/,'') === 'https://clinical-edge-copilot.onrender.com')) throw new Error('nonlocal');
      const response = await fetch(`${API_BASE}/api/ask/v1/conversation/consent`, { method: 'POST', headers: { ...aiRequestHeaders(), ...(consentReceipt.current ? { Authorization: `Bearer ${consentReceipt.current}` } : {}) }, body: JSON.stringify({ accepted: true, version: 4 }) });
      if (!response.ok) throw new Error('consent');
      const receipt = await response.json();
      if (receipt.version !== 4 || !/^[a-f0-9]{64}$/.test(receipt.receipt || '')) throw new Error('consent');
      setPreviewConsent(true); consentReceipt.current = receipt.receipt;
      setDailyAllowance(Number.isInteger(receipt.dailyQuestionAllowance)&&receipt.dailyQuestionAllowance>=0?receipt.dailyQuestionAllowance:null);
    } catch { setError('Educational consent could not be established. No question was sent.'); }
    finally { setBusy(false); }
  };
  const newQuestion = async () => {
    if (CONVERSATION_PREVIEW && previewConsent) {
      try {
        const r = await fetch(`${API_BASE}/api/ask/v1/conversation/reset`, { method: 'POST', headers: { Authorization: `Bearer ${consentReceipt.current}` } });
        if (!r.ok) throw new Error('reset');
      } catch { setError('The conversation could not be cleared. Your question is unchanged.'); return; }
    }
    setAnswerRequestId(null);setQuestion(''); setSubmitted(''); setAnswer(''); setDetails([]); setEarlierExplanations([]); setAnswerContext(null); setAbg(null); setAbgTeaching([]); setAbgCatalog([]); setExplanationNotice(''); setError(''); input.current?.focus();
  };
  const withdrawPreview = async () => {
    pending.current?.abort();
    const receipt = consentReceipt.current;
    consentReceipt.current = null; setPreviewConsent(false);
    try {
      const response = await fetch(`${API_BASE}/api/ask/v1/conversation/consent`, { method: 'DELETE', headers: { Authorization: `Bearer ${receipt}` } });
      if (!response.ok) throw new Error('withdrawal');
      setAnswerRequestId(null);setAnswer(''); setDetails([]); setEarlierExplanations([]); setAnswerContext(null);
    } catch { setError('Withdrawal could not reach the server. Stop using this preview; the server receipt expires within ten minutes.'); }
  };
  return <div className="ce-ask-page">
    <ModuleHeader moduleName="Ask Clinical Edge" onGoHome={() => navigate('/')} />
    <main className="ce-ask-main">
      <header><span className="ce-ask-scope">Nursing questions</span><h1>{PUBLIC_BETA ? 'Ask Clinical Edge — Public Beta' : 'Ask Clinical Edge'}</h1></header>
      {CONVERSATION_PREVIEW && <p className="ce-ask-privacy" role="status">AI-powered nursing education for nurses and students across specialties. Not individualized patient care or emergency guidance. Clinical review remains pending.</p>}
      {CONVERSATION_PREVIEW && <p className="ce-ask-privacy">{dailyAllowance!==null?`Daily allowance: ${dailyAllowance} counted AI questions per device, shared with other AI tools. `:''}Each submitted conversational question, including follow-ups, counts toward the daily allowance. Limits reset at midnight Pacific. Safety refusals and service errors refund the device allowance; safety refusals still count toward network limits.</p>}
      {CONVERSATION_PREVIEW && previewConsent && <div className="ce-ask-controls"><button type="button" onClick={withdrawPreview}>Withdraw educational AI consent</button></div>}
      {CONVERSATION_PREVIEW && !previewConsent && <section className="ce-ask-context" aria-label="Private conversation consent"><h2>Before educational Ask</h2><p>Your question, reported context, relevant earlier turns and generated answer will be sent to Anthropic for intent checking, explanation and safety review. General education may use model knowledge without independently verified sources; this is labelled on the answer. Nonurgent context may be discussed only as general education, not individual care advice. History stays in server memory for up to ten minutes. Anthropic may retain data under its policies. Use fictional examples only; no patient identifiers.</p><button type="button" disabled={busy} onClick={enablePreview}>Enable educational conversation</button></section>}
      {answerRequestId && <p><a href={`mailto:clinicaledgehq@gmail.com?subject=${encodeURIComponent('Ask concern: '+answerRequestId)}&body=${encodeURIComponent('Request ID: '+answerRequestId+'\nConcern: inaccurate / confusing / concerning (choose one).\nDo not include patient information or copy clinical chat content.')}`}>Report a concern</a></p>}
      <form onSubmit={submit}>
        <div className="ce-ask-context">
          <strong>{CONVERSATION_PREVIEW ? 'Nursing education' : contextEnabled ? 'Using Patient Snapshot' : 'General Ask'}</strong>
          {CONVERSATION_PREVIEW ? null : snapshot ? <label><input type="checkbox" checked={contextEnabled} disabled={busy} onChange={e => setContextChoice(e.target.checked ? snapshot : null)} />Use confirmed Patient Snapshot</label>
            : <div className="ce-ask-empty"><div><span>No Snapshot selected</span><p>Add non-identifying context for a more specific answer.</p></div><button type="button" onClick={() => navigate('/copilot')}>Create Snapshot <span aria-hidden="true">&#8594;</span></button></div>}
          {!CONVERSATION_PREVIEW && contextEnabled && !selectedContext && <p>No relevant Snapshot facts selected. This question will use General Ask.</p>}
          {!CONVERSATION_PREVIEW && selectedContext && <details><summary>Reported facts selected for this question ({selectedContext.facts.length})</summary><ul>{reportedFacts(selectedContext).map(fact => <li key={fact.id}><strong>{fact.label}: </strong>{fact.text}</li>)}</ul></details>}
        </div>
        <label htmlFor="ask-question">Nursing question</label>
        <p id="ask-privacy" className="ce-ask-privacy">No names, MRNs, dates of birth or other patient identifiers. Identifier checks do not guarantee de-identification.</p>
        <textarea id="ask-question" ref={input} value={question} onChange={e => setQuestion(e.target.value)} aria-describedby="ask-privacy" placeholder="What would you like to understand?" maxLength={4000} rows={4} disabled={busy} />
        <div className="ce-ask-controls">
          <button className="ce-ask-submit" aria-label="Ask Clinical Edge" disabled={busy || question.trim().length < 4 || (CONVERSATION_PREVIEW && !previewConsent)} type="submit">{busy ? <span role="status"><span className="ce-ask-spinner" aria-hidden="true" />Preparing your answer...</span> : <>Ask Clinical Edge <span aria-hidden="true">&#8594;</span></>}</button>
          {busy && <button className="ce-ask-cancel" type="button" onClick={() => pending.current?.abort()} aria-label="Cancel question">Cancel</button>}
          {!busy && (answer || question) && <button type="button" onClick={newQuestion}>New question</button>}
        </div>
      </form>
      {error && <p className="ce-ask-error" role="alert">{error}</p>}
      {CONVERSATION_PREVIEW && earlierExplanations.map((earlier, i) => <section className="ce-ask-answer" key={i} aria-label="Earlier educational explanation"><h2>{earlier.question}</h2><Answer text={earlier.answer} />{earlier.details.map(d => <div key={d.heading}><h3>{d.heading}</h3><Answer text={d.text} /></div>)}<ul className="ce-ask-sources">{earlier.sources.map(source => <li key={source.id}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></li>)}</ul></section>)}
      {answer && !visibleAnswer && <p role="status">The Snapshot changed. Enable the current Snapshot and ask again; the previous patient answer is no longer shown.</p>}
      {visibleAnswer && <section className="ce-ask-answer" aria-labelledby="ask-answer-heading" aria-live="polite">
        <strong className="ce-ask-answer-mode">{PUBLIC_BETA ? 'Educational beta' : CONVERSATION_PREVIEW ? 'Bounded educational preview' : answerContext?.snapshotUse ? 'Using Patient Snapshot' : 'General Ask'}</strong>
        {CONVERSATION_PREVIEW && answerContext?.evidence?.status==='not_independently_source_verified' && <p role="status">Model-generated education, not independently source-verified. Pending clinical accuracy review.</p>}
        {CONVERSATION_PREVIEW && answerContext?.educationalReframing && <p role="status">Your reported context is being discussed as general education, not a determination of this individual's diagnosis or care.</p>}
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
        {abg?.status === 'verified' && !CONVERSATION_PREVIEW && <div className="ce-ask-controls"><button type="button" disabled={busy} onClick={event => submit(event, true)}>Explain this pattern <span aria-hidden="true">&#8594;</span></button></div>}
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
