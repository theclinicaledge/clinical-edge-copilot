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
        <h1 id={titleId} ref={heading} tabIndex={-1}>How your entries are processed</h1>
        <ul className="ce-consent__points">
          <li><strong>Sent to Anthropic.</strong> Shift Brain and Ask entries go through our server to Anthropic, a third-party AI, to generate responses.</li>
          <li><strong>Not stored by us.</strong> Anthropic keeps them up to 30 days, longer if flagged for safety review or required by law.</li>
          <li><strong>No patient identifiers.</strong> No names, initials, MRNs, dates of birth or room numbers.</li>
          <li><strong>Education, not orders.</strong> Confirm decisions with the treating provider and follow local protocol.</li>
        </ul>
        <label className="ce-consent__toggle">
          <input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} />
          <span>Also share anonymous usage analytics <small>(never what you type, optional)</small></span>
        </label>
        <div className="ce-consent__actions">
          <button type="button" className="ce-consent__agree ce-pressable" onClick={agree}>Agree and continue</button>
          <button type="button" className="ce-consent__decline ce-pressable" onClick={notNow}>Not now</button>
        </div>
        <p className="ce-consent__footnote">
          Change anytime in{' '}
          <a href="/privacy" onClick={(event) => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); navigate('/privacy'); }}>Privacy</a>.
          Other tools work without this.
        </p>
      </div>
    </main>
  );
}
