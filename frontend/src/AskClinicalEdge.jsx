import { useEffect, useRef, useState } from 'react';
import ModuleHeader from './components/ModuleHeader.jsx';
import { trackEvent } from './analytics';
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

export default function AskClinicalEdge({ navigate, isVisible }) {
  const [question, setQuestion] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef(null);
  const input = useRef(null);
  useEffect(() => { if (isVisible) trackEvent('ask_opened', { mode: 'general' }); }, [isVisible]);
  useEffect(() => () => pending.current?.abort(), []);
  const submit = async event => {
    event.preventDefault();
    if (pending.current || question.trim().length < 4) return;
    const controller = new AbortController();
    pending.current = controller;
    const timer = setTimeout(() => controller.abort('timeout'), 35000);
    setBusy(true); setError('');
    trackEvent('ask_submitted', { mode: 'general' });
    try {
      // Deliberately no Snapshot, history, route parameters or hidden workspace state.
      const response = await fetch(`${API_BASE}/api/ask`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: question.trim(), contextMode: 'general' }), signal: controller.signal });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.contextMode !== 'general' || typeof data.answer !== 'string') {
        setError(ERRORS[data.error?.code] || 'The answer service is unavailable. Your question is unchanged.');
        trackEvent('ask_failed', { mode: 'general', status: response.status });
        return;
      }
      setSubmitted(question.trim()); setAnswer(data.answer);
      trackEvent('ask_answered', { mode: 'general' });
    } catch {
      setError(controller.signal.aborted ? controller.signal.reason === 'timeout' ? ERRORS.provider_timeout : 'Request cancelled. Your question is unchanged.' : 'Connection unavailable. Your question is unchanged.');
      trackEvent('ask_failed', { mode: 'general', status: 0 });
    } finally {
      clearTimeout(timer); pending.current = null; setBusy(false);
    }
  };
  return <div className="ce-ask-page">
    <ModuleHeader moduleName="Ask Clinical Edge" onGoHome={() => navigate('/')} />
    <main className="ce-ask-main">
      <header><span className="ce-ask-scope">General education · No Snapshot context</span><h1>Ask Clinical Edge</h1></header>
      <form onSubmit={submit}>
        <label htmlFor="ask-question">Nursing question</label>
        <p id="ask-privacy" className="ce-ask-privacy">No names, MRNs, dates of birth or other patient identifiers. Identifier checks do not guarantee de-identification.</p>
        <textarea id="ask-question" ref={input} value={question} onChange={e => setQuestion(e.target.value)} aria-describedby="ask-privacy" placeholder="What would you like to understand?" maxLength={4000} rows={4} disabled={busy} />
        <div className="ce-ask-controls">
          <button className="ce-ask-submit" disabled={busy || question.trim().length < 4} type="submit">Ask Clinical Edge <span aria-hidden="true">&#8594;</span></button>
          {busy && <button type="button" onClick={() => pending.current?.abort()} aria-label="Cancel question" title="Cancel question">&#215;</button>}
          {!busy && (answer || question) && <button type="button" onClick={() => { setQuestion(''); setSubmitted(''); setAnswer(''); setError(''); input.current?.focus(); }}>New question</button>}
        </div>
      </form>
      {busy && <p role="status">Preparing your answer...</p>}
      {error && <p className="ce-ask-error" role="alert">{error}</p>}
      {answer && <section className="ce-ask-answer" aria-labelledby="ask-answer-heading" aria-live="polite">
        <header><div><span className="ce-ask-scope">General nursing education</span><h2 id="ask-answer-heading">{submitted}</h2></div></header>
        <Answer text={answer} />
      </section>}
    </main>
  </div>;
}
