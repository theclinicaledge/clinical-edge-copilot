import { useEffect, useRef, useState } from 'react';
import ModuleHeader from './components/ModuleHeader.jsx';
import AskIntroduction from './components/AskIntroduction.jsx';
import AskAnswer from './components/AskAnswer.jsx';
import { selectSnapshotContext, reportedFacts } from '../../backend/ask-snapshot-context.mjs';
import { trackEvent } from './analytics';
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

export default function AskClinicalEdge({ navigate, isVisible, snapshot = null }) {
  const [contextChoice, setContextChoice] = useState(null);
  const contextEnabled = Boolean(snapshot && contextChoice === snapshot);
  const currentSnapshot = useRef(snapshot);
  currentSnapshot.current = snapshot;
  const requestSnapshot = useRef(null);
  const [question, setQuestion] = useState('');
  const draftVersion = useRef(0);
  const editQuestion = value => { draftVersion.current++; setQuestion(value); };
  const [submitted, setSubmitted] = useState('');
  const [answer, setAnswer] = useState('');
  const [answerRequestId, setAnswerRequestId] = useState(null);
  const [details, setDetails] = useState([]);
  const [earlierExplanations, setEarlierExplanations] = useState([]);
  const [previewConsent, setPreviewConsent] = useState(false);
  const [dailyAllowance,setDailyAllowance]=useState(null);
  const consentReceipt = useRef(null);
  const consentDeadline = useRef(0);
  const [consentExpiresAt, setConsentExpiresAt] = useState(0);
  const [answerSession, setAnswerSession] = useState(null);
  const [sessionNotice, setSessionNotice] = useState('');
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
  const latestAnswer = useRef(null);
  const scrollOnDelivery = useRef(false);
  const followUpAvailable = CONVERSATION_PREVIEW && previewConsent && answerSession === consentReceipt.current;
  const currentTurn = { question: submitted, answer, details, context: answerContext, abg, teaching: abgTeaching, requestId: answerRequestId };
  useEffect(() => { if (isVisible) trackEvent('ask_opened', { mode: 'general' }); }, [isVisible]);
  useEffect(() => () => pending.current?.abort(), []);
  useEffect(() => () => {
    if (CONVERSATION_PREVIEW && consentReceipt.current) fetch(`${API_BASE}/api/ask/v1/conversation/consent`, { method: 'DELETE', headers: { Authorization: `Bearer ${consentReceipt.current}` }, keepalive: true }).catch(() => {});
  }, []);
  useEffect(() => () => { if (snapshot && requestSnapshot.current === snapshot) pending.current?.abort(); }, [snapshot]);
  useEffect(() => {
    if (!previewConsent || !consentExpiresAt) return;
    const expire = () => {
      if (Date.now() < consentExpiresAt) return;
      consentReceipt.current = null; consentDeadline.current = 0; setPreviewConsent(false);
      pending.current?.abort('expired');
      setSessionNotice('This conversation has expired. Earlier answers remain visible, but their context is no longer available. Enable a new conversation to continue learning.');
    };
    const timer = setTimeout(expire, Math.max(0, consentExpiresAt - Date.now()));
    window.addEventListener('focus', expire); document.addEventListener('visibilitychange', expire);
    return () => { clearTimeout(timer); window.removeEventListener('focus', expire); document.removeEventListener('visibilitychange', expire); };
  }, [previewConsent, consentExpiresAt]);
  useEffect(() => {
    const area = input.current;
    if (!area || !isVisible) return;
    const resize = () => { area.style.height = 'auto'; area.style.height = `${area.scrollHeight}px`; };
    resize();
    // Observe the form's width, not the textarea's own height.
    let width = area.parentElement.clientWidth;
    const widthObserver = new ResizeObserver(() => { if (width !== area.parentElement.clientWidth) { width = area.parentElement.clientWidth; resize(); } });
    widthObserver.observe(area.parentElement);
    return () => widthObserver.disconnect();
  }, [question, visibleAnswer, isVisible]);
  useEffect(() => {
    if (!isVisible || !scrollOnDelivery.current || !visibleAnswer) return;
    scrollOnDelivery.current = false;
    latestAnswer.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
    latestAnswer.current?.focus({ preventScroll: true });
  }, [answer, answerRequestId, isVisible, visibleAnswer]);
  const submit = async (event, explain = false) => {
    event.preventDefault();
    if (pending.current || (explain ? submitted : question).trim().length < 4) return;
    if (CONVERSATION_PREVIEW && (!previewConsent || Date.now() >= consentDeadline.current)) { setError(ERRORS.consent_required); return; }
    if (CONVERSATION_PREVIEW) {
      let localAPI = false;
      try { const url = new URL(API_BASE); localAPI = ['http:', 'https:'].includes(url.protocol) && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname); } catch { /* Invalid preview configuration remains closed. */ }
      if (!(import.meta.env.DEV && localAPI) && !(PUBLIC_BETA && API_BASE === 'https://clinical-edge-copilot.onrender.com')) { setError('The educational service configuration is unavailable. No question was sent.'); return; }
    }
    const controller = new AbortController();
    const sentQuestion = explain ? submitted : question;
    const sentDraftVersion = draftVersion.current;
    const sentReceipt = consentReceipt.current;
    let movedWhilePending = false;
    const markReading = () => { movedWhilePending = true; };
    const markKeyReading = event => { if (['PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown', 'Tab'].includes(event.key)) markReading(); };
    window.addEventListener('wheel', markReading, { passive: true });
    window.addEventListener('touchmove', markReading, { passive: true });
    window.addEventListener('scroll', markReading, { passive: true });
    window.addEventListener('keydown', markKeyReading);
    const context = CONVERSATION_PREVIEW || explain ? null : selectedContext;
    const submittedSnapshot = context ? snapshot : null;
    requestSnapshot.current = submittedSnapshot;
    pending.current = controller;
    const timer = setTimeout(() => controller.abort('timeout'), CONVERSATION_PREVIEW ? 60000 : 35000);
    setBusy(true); setError(''); setExplanationNotice('');
    trackEvent('ask_submitted', { mode: 'general' });
    try {
      const response = await fetch(`${API_BASE}${CONVERSATION_PREVIEW ? '/api/ask/v1/conversation/preview' : '/api/ask'}`, { method: 'POST', headers: { ...aiRequestHeaders(), ...(CONVERSATION_PREVIEW ? { Authorization: `Bearer ${sentReceipt}` } : {}) }, body: JSON.stringify(CONVERSATION_PREVIEW ? { question: sentQuestion } : { question: sentQuestion.trim(), contextMode: context ? 'snapshot' : 'general', ...(context ? { snapshotContext: context } : {}), ...(explain ? { abgExplanation: true } : {}) }), signal: controller.signal });
      const data = await response.json().catch(() => ({}));
      if (controller.signal.aborted || CONVERSATION_PREVIEW && (sentReceipt !== consentReceipt.current || Date.now() >= consentDeadline.current)) return;
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
      if (CONVERSATION_PREVIEW && answer) setEarlierExplanations(previous => [...previous, currentTurn].slice(-5));
      scrollOnDelivery.current = !movedWhilePending && draftVersion.current === sentDraftVersion;
      if (draftVersion.current === sentDraftVersion && (!data.abg || data.abg.status === 'verified')) setQuestion('');
      setAnswerSession(sentReceipt);
      setSubmitted(sentQuestion.trim()); setAnswer(data.answer); setAnswerRequestId(typeof data.requestId === 'string' ? data.requestId : null);
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
      window.removeEventListener('wheel', markReading); window.removeEventListener('touchmove', markReading); window.removeEventListener('scroll', markReading); window.removeEventListener('keydown', markKeyReading);
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
      const expires = Date.now() + (Number.isFinite(receipt.expiresInSeconds) ? Math.min(600, Math.max(0, receipt.expiresInSeconds)) : 600) * 1000;
      consentDeadline.current = expires; setConsentExpiresAt(expires); setAnswerSession(null);
      setSessionNotice(answer ? 'A new conversation is ready. Earlier answers are shown for reference only; they are not included in this new conversation.' : '');
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
    setAnswerRequestId(null);editQuestion(''); setSubmitted(''); setAnswer(''); setDetails([]); setEarlierExplanations([]); setAnswerContext(null); setAbg(null); setAbgTeaching([]); setAbgCatalog([]); setExplanationNotice(''); setError(''); setSessionNotice(''); setAnswerSession(null); input.current?.focus();
  };
  const withdrawPreview = async () => {
    pending.current?.abort();
    const receipt = consentReceipt.current;
    consentReceipt.current = null; consentDeadline.current = 0; setPreviewConsent(false); setConsentExpiresAt(0); setAnswerSession(null);
    try {
      const response = await fetch(`${API_BASE}/api/ask/v1/conversation/consent`, { method: 'DELETE', headers: { Authorization: `Bearer ${receipt}` } });
      if (!response.ok) throw new Error('withdrawal');
      setAnswerRequestId(null);setAnswer(''); setDetails([]); setEarlierExplanations([]); setAnswerContext(null); setSessionNotice('');
    } catch { setError('Withdrawal could not reach the server. Stop using this preview; the server receipt expires within ten minutes.'); }
  };
  const fillFollowUp = value => {
    if (!followUpAvailable || busy || Date.now() >= consentDeadline.current) return;
    editQuestion(value); input.current?.focus();
  };
  return <div className={`ce-ask-page${visibleAnswer ? ' ce-ask-page--conversation' : ''}`}>
    <ModuleHeader moduleName="Ask Clinical Edge" onGoHome={() => navigate('/')} />
    <main className="ce-ask-main">
      <AskIntroduction beta={PUBLIC_BETA} compact={Boolean(visibleAnswer)} />
      {CONVERSATION_PREVIEW && <div className="ce-ask-session-bar">
        <details className="ce-ask-allowance"><summary>{dailyAllowance !== null ? `${dailyAllowance} questions per day` : 'Daily question allowance'}</summary><p>{dailyAllowance!==null?`Daily allowance: ${dailyAllowance} counted AI questions per device, shared with other AI tools. `:''}Each submitted conversational question, including follow-ups, counts toward the daily allowance. Limits reset at midnight Pacific. Safety refusals and service errors refund the device allowance; safety refusals still count toward network limits. This is your configured limit, not a live remaining balance.</p></details>
        {previewConsent && <button className="ce-ask-text-button" type="button" onClick={withdrawPreview}>Withdraw AI consent</button>}
        {visibleAnswer && <button className="ce-ask-text-button" type="button" disabled={busy} onClick={newQuestion}>New question</button>}
      </div>}
      {sessionNotice && <p className="ce-ask-session-notice" role="status">{sessionNotice}</p>}
      {CONVERSATION_PREVIEW && !previewConsent && <section className="ce-ask-conversation-consent" aria-label="Private conversation consent"><h2>Ready to start learning?</h2><p>Enable a temporary educational conversation. Your questions and earlier turns go to Anthropic for answers and safety review.</p><details><summary>Conversation and evidence details</summary><p>Your question, reported context, relevant earlier turns and generated answer will be sent to Anthropic for intent checking, explanation and safety review. General education may use model knowledge without independently verified sources; this is labelled on the answer. Nonurgent context may be discussed only as general education, not individual care advice. History stays in server memory for up to ten minutes. Anthropic may retain data under its policies. Use fictional examples only; no patient identifiers.</p></details><button className="ce-ask-enable" type="button" disabled={busy} onClick={enablePreview}>Enable educational conversation <span aria-hidden="true">&#8594;</span></button></section>}
      {CONVERSATION_PREVIEW && earlierExplanations.map((turn, i) => <AskAnswer key={i} turn={turn} earlier beta={PUBLIC_BETA} conversation navigate={navigate} />)}
      {answer && !visibleAnswer && <p role="status">The Snapshot changed. Enable the current Snapshot and ask again; the previous patient answer is no longer shown.</p>}
      {visibleAnswer && <AskAnswer key={`latest-${earlierExplanations.length}`} turn={currentTurn} beta={PUBLIC_BETA} conversation={CONVERSATION_PREVIEW} answerRef={latestAnswer} navigate={navigate} busy={busy} onExplain={event => submit(event, true)} notice={explanationNotice} />}
      {visibleAnswer && CONVERSATION_PREVIEW && <div className="ce-ask-followups" role="group" aria-label="Follow-up ideas">
        {[['Explain more simply', 'Explain the previous answer more simply.'], ['Give an example', 'Give an educational example of the concept in the previous answer.'], ['Go deeper', 'Go deeper into the physiology discussed in the previous answer.']].map(([label, value]) => <button type="button" key={label} disabled={!followUpAvailable || busy} onClick={() => fillFollowUp(value)}>{label}</button>)}
        {!followUpAvailable && <p>Follow-up ideas need an active conversation with this answer in its history.</p>}
      </div>}
      <form className={`ce-ask-composer${visibleAnswer ? ' ce-ask-composer--followup' : ''}`} onSubmit={submit}>
        <div className="ce-ask-context">
          {!CONVERSATION_PREVIEW && <strong>{contextEnabled ? 'Using Patient Snapshot' : 'General Ask'}</strong>}
          {CONVERSATION_PREVIEW ? null : snapshot ? <label><input type="checkbox" checked={contextEnabled} disabled={busy} onChange={e => setContextChoice(e.target.checked ? snapshot : null)} />Use confirmed Patient Snapshot</label>
            : <div className="ce-ask-empty"><div><span>No Snapshot selected</span><p>Add non-identifying context for a more specific answer.</p></div><button type="button" onClick={() => navigate('/copilot')}>Create Snapshot <span aria-hidden="true">&#8594;</span></button></div>}
          {!CONVERSATION_PREVIEW && contextEnabled && !selectedContext && <p>No relevant Snapshot facts selected. This question will use General Ask.</p>}
          {!CONVERSATION_PREVIEW && selectedContext && <details><summary>Reported facts selected for this question ({selectedContext.facts.length})</summary><ul>{reportedFacts(selectedContext).map(fact => <li key={fact.id}><strong>{fact.label}: </strong>{fact.text}</li>)}</ul></details>}
        </div>
        <label htmlFor="ask-question">{visibleAnswer ? followUpAvailable ? 'Continue the conversation' : 'Ask a new question' : 'What would you like to understand?'}<span className="ce-ask-sr-only"> Nursing question</span></label>
        <p id="ask-privacy" className="ce-ask-privacy">No names, MRNs, dates of birth or other patient identifiers. Identifier checks do not guarantee de-identification.</p>
        <textarea id="ask-question" ref={input} value={question} onChange={e => editQuestion(e.target.value)} aria-label="Nursing question" aria-describedby="ask-privacy" placeholder={followUpAvailable ? 'Ask a follow-up...' : 'Ask anything about nursing...'} maxLength={4000} rows={visibleAnswer ? 2 : 4} />
        <div className="ce-ask-controls">
          <button className="ce-ask-submit" aria-label="Ask Clinical Edge" disabled={busy || question.trim().length < 4 || (CONVERSATION_PREVIEW && !previewConsent)} type="submit">{busy ? <span role="status"><span className="ce-ask-spinner" aria-hidden="true" />Preparing your answer...</span> : <>Ask Clinical Edge <span aria-hidden="true">&#8594;</span></>}</button>
          {busy && <button className="ce-ask-cancel" type="button" onClick={() => pending.current?.abort()} aria-label="Cancel question">Cancel</button>}
          {!busy && (question || answer) && !(visibleAnswer && CONVERSATION_PREVIEW) && <button type="button" onClick={newQuestion}>New question</button>}
        </div>
      </form>
      {!answer && <div className="ce-ask-examples" role="group" aria-label="Suggested prompts">{['Explain RAAS simply', 'Help me understand ABGs', 'SSRIs vs. SNRIs'].map(example => <button type="button" key={example} disabled={busy} onClick={()=>{editQuestion(example); input.current?.focus();}}>{example}<span aria-hidden="true">&#8599;</span></button>)}</div>}
      {CONVERSATION_PREVIEW && <p className="ce-ask-boundary">For education, not individual patient care or emergencies. Clinical review remains pending.</p>}
      {error && <div className="ce-ask-error" role="alert"><strong>We couldn't complete this answer.</strong><p>{error}</p></div>}
      <div className="ce-ask-delivery-status ce-ask-sr-only" aria-live="polite">{visibleAnswer && <span key={answerRequestId || submitted}>Answer ready. Your explanation is available in the conversation.</span>}</div>
    </main>
  </div>;
}
