import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { consentSnapshot, onConsentChange, parseConsentSnapshot, saveConsent } from '../consent.js';
import '../styles/consent.css';

// Blocks every AI-backed workspace (Shift Brain, Ask) until the user gives
// explicit permission to send entries to a third-party AI provider.
// App Store Review Guidelines 5.1.2(i), 5.1.1(ii) and 1.4.1.
// Children are not mounted until consent exists, so no request can be made.
export default function AIConsentGate({ navigate, children }) {
  const consent = parseConsentSnapshot(useSyncExternalStore(onConsentChange, consentSnapshot, () => 'none'));
  if (consent?.ai) return children;
  return <ConsentScreen navigate={navigate} previous={consent} />;
}

function ConsentScreen({ navigate, previous }) {
  const [analytics, setAnalytics] = useState(previous?.analytics === true);
  const heading = useRef(null);
  const titleId = useId();
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);

  const agree = () => saveConsent({ ai: true, analytics });
  const notNow = () => navigate('/');

  return (
    <main className="ce-consent" aria-labelledby={titleId}>
      <div className="ce-consent__card">
        <p className="ce-consent__eyebrow">Before you start</p>
        <h1 id={titleId} ref={heading} tabIndex={-1}>How your entries are processed</h1>
        <ul className="ce-consent__points">
          <li>
            <strong>Sent to a third-party AI.</strong> What you type or enter in Shift Brain and Ask is sent to our server and then to Anthropic, an AI provider, to generate a response.
          </li>
          <li>
            <strong>Not stored by us.</strong> Our server does not keep your entries or the responses. Anthropic may keep them for up to 30 days, or longer if flagged for safety review or required by law.
          </li>
          <li>
            <strong>No patient identifiers.</strong> Leave out names, initials, MRNs, dates of birth, room numbers and anything else that could identify a patient.
          </li>
          <li>
            <strong>Education, not orders.</strong> Clinical Edge supports your reasoning. It does not diagnose or treat. Confirm decisions with the treating provider and follow your local protocol.
          </li>
        </ul>
        <label className="ce-consent__toggle">
          <input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} />
          <span>
            Also share anonymous usage analytics
            <small>Page views and which features are used. Never what you type. Optional.</small>
          </span>
        </label>
        <div className="ce-consent__actions">
          <button type="button" className="ce-consent__agree ce-pressable" onClick={agree}>Agree and continue</button>
          <button type="button" className="ce-consent__decline ce-pressable" onClick={notNow}>Not now</button>
        </div>
        <p className="ce-consent__footnote">
          You can change these choices anytime in{' '}
          <a href="/privacy" onClick={(event) => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); navigate('/privacy'); }}>Privacy</a>.
          Rhythm Lab, ICU Drips, Reference Hub, ABG Lab and Brain Sheets work without this.
        </p>
      </div>
    </main>
  );
}
