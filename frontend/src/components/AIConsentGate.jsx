import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { consentSnapshot, onConsentChange, parseConsentSnapshot, saveConsent } from '../consent.js';
import '../styles/consent.css';
import AskIntroduction from './AskIntroduction.jsx';
import '../styles/ask-clinical-edge.css';

// Blocks every AI-backed workspace (Shift Brain, Ask) until the user gives
// explicit permission to send entries to a third-party AI provider.
// App Store Review Guidelines 5.1.2(i), 5.1.1(ii) and 1.4.1.
// Children are not mounted until consent exists, so no request can be made.
export default function AIConsentGate({ navigate, children, experience }) {
  const consent = parseConsentSnapshot(useSyncExternalStore(onConsentChange, consentSnapshot, () => 'none'));
  if (consent?.ai) return children;
  return <ConsentScreen navigate={navigate} previous={consent} ask={experience === 'ask'} />;
}

function ConsentScreen({ navigate, previous, ask }) {
  const [analytics, setAnalytics] = useState(previous?.analytics === true);
  const heading = useRef(null);
  const titleId = useId();
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);

  const agree = () => saveConsent({ ai: true, analytics });
  const notNow = () => navigate('/');
  const openLink = (event, path) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(path);
  };

  return (
    <main className={`ce-consent${ask ? ' ce-consent--ask' : ''}`} aria-labelledby={titleId}>
      <div className="ce-consent__card">
        {ask && <AskIntroduction beta={import.meta.env.VITE_ASK_PUBLIC_BETA_ENABLED === 'true'} />}
        {ask ? <section className="ce-ask-first-consent" aria-label="AI consent">
          <h2 id={titleId} ref={heading} tabIndex={-1}>A quick note before we begin</h2>
          <p>Your questions and recent conversation go to Anthropic for AI answers and safety review. AI can make mistakes.</p>
          <ul><li>For nursing education, not individual care or emergencies.</li><li>No names, MRNs or other patient identifiers.</li><li>Conversation history stays in temporary server memory for up to ten minutes. Anthropic normally retains API content for up to 30 days, with safety and legal exceptions.</li></ul>
        </section> : <h1 id={titleId} ref={heading} tabIndex={-1}>How your entries are processed</h1>}
        <details className="ce-ask-consent-details" open={!ask}>
        <summary hidden={!ask}>Full AI and privacy information</summary>
        <ul className="ce-consent__points">
          <li><strong>Sent to Anthropic.</strong> AI entries go through our server to Anthropic. Educational Ask sends your question, relevant conversation history and generated answer for admission, generation and safety review.</li>
          <li><strong>Temporary conversation memory.</strong> Educational Ask history stays in volatile server memory for up to ten minutes, until withdrawal or expiry, and is lost on server restart. Chat content is not written to operational logs or durable chat storage. Anthropic keeps API content up to 30 days, longer if flagged for safety review or required by law.</li>
          <li><strong>No patient identifiers.</strong> No names, initials, MRNs, dates of birth or room numbers.</li>
          <li><strong>Education, not patient care.</strong> Use general questions or fictional examples only. This is not individualized diagnosis, treatment or emergency guidance; do not delay bedside assessment or local emergency help.</li>
        </ul>
        </details>
        <label className="ce-consent__toggle">
          <input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} />
          <span>Also share pseudonymous usage analytics with PostHog <small>(never what you type, optional)</small></span>
        </label>
        <div className="ce-consent__actions">
          <button type="button" className="ce-consent__agree ce-pressable" onClick={agree}>Agree and continue</button>
          <button type="button" className="ce-consent__decline ce-pressable" onClick={notNow}>Not now</button>
        </div>
        <p className="ce-consent__footnote">
          By continuing you agree to the{' '}
          <a href="/terms" onClick={(event) => openLink(event, '/terms')}>Terms of Use</a>.
          Change choices anytime in{' '}
          <a href="/privacy" onClick={(event) => openLink(event, '/privacy')}>Privacy</a>.
        </p>
      </div>
    </main>
  );
}
