import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.jsx'
import Landing from './Landing.jsx'
import Scenario from './Scenario.jsx'
import QuickStart from './QuickStart.jsx'
import Privacy from './Privacy.jsx'
import Support from './Support.jsx'

// ── Service Worker Registration ─────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((err) => console.warn('SW registration failed:', err));
  });
}

// ── iOS Install Hint ────────────────────────────────────────────────────────
// iOS Safari never fires `beforeinstallprompt`, so the user has no idea
// they can add the app. This shows a one-time dismissible pill only on
// iPhone/iPad Safari when NOT already running in standalone mode.
const IOS_HINT_KEY = 'cec_ios_hint_dismissed';

function IOSInstallHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show on iOS Safari (not Chrome/Firefox on iOS, not standalone)
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone = window.navigator.standalone === true;
    const isSafari = /safari/i.test(navigator.userAgent) &&
      !/crios|fxios|opios|edgios/i.test(navigator.userAgent);
    const dismissed = localStorage.getItem(IOS_HINT_KEY);

    if (isIOS && isSafari && !isStandalone && !dismissed) {
      // Small delay so the app shell paints first
      const t = setTimeout(() => setVisible(true), 2500);
      return () => clearTimeout(t);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(IOS_HINT_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      background: '#0d1f35',
      border: '1px solid rgba(0,194,209,0.35)',
      borderRadius: '16px',
      padding: '11px 16px 11px 14px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      fontFamily: 'DM Sans, system-ui, sans-serif',
      fontSize: '13px',
      color: '#c8d8e8',
      maxWidth: '300px',
      userSelect: 'none',
    }}>
      <span style={{ fontSize: '17px', lineHeight: 1, flexShrink: 0 }}>📲</span>
      <span style={{ lineHeight: 1.4 }}>
        Install: tap <strong style={{ color: '#00C2D1' }}>Share</strong> then{' '}
        <strong style={{ color: '#00C2D1' }}>Add to Home Screen</strong>
      </span>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#3A5566',
          fontFamily: 'inherit',
          fontSize: '18px',
          lineHeight: 1,
          padding: 0,
          marginLeft: '2px',
          flexShrink: 0,
        }}
      >×</button>
    </div>
  );
}

// ── Android Install Banner ───────────────────────────────────────────────────
// Shows a small pill at the bottom only when the browser fires
// `beforeinstallprompt` (Android Chrome). Dismissed with one tap or the ×.
// Never shows if already running in standalone / installed mode.
function InstallBanner() {
  const [prompt, setPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Already installed as a standalone app — don't show
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (window.navigator.standalone === true) return;

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setVisible(false);
    setPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    setPrompt(null);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      background: '#0d1f35',
      border: '1px solid rgba(0,194,209,0.35)',
      borderRadius: '999px',
      padding: '10px 16px 10px 14px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.45)',
      fontFamily: 'DM Sans, system-ui, sans-serif',
      fontSize: '13px',
      color: '#c8d8e8',
      whiteSpace: 'nowrap',
      userSelect: 'none',
    }}>
      <span style={{ fontSize: '16px', lineHeight: 1 }}>📲</span>
      <button
        onClick={handleInstall}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#00C2D1',
          fontFamily: 'inherit',
          fontSize: '13px',
          fontWeight: 600,
          padding: 0,
        }}
      >
        Add to Home Screen
      </button>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#3A5566',
          fontFamily: 'inherit',
          fontSize: '16px',
          lineHeight: 1,
          padding: 0,
          marginLeft: '2px',
        }}
      >
        ×
      </button>
    </div>
  );
}

// ── Routing ─────────────────────────────────────────────────────────────────
function getPage() {
  const hash = window.location.hash;
  if (hash === '#/landing') return 'landing';
  if (hash === '#/scenario') return 'scenario';
  if (hash === '#/quickstart') return 'quickstart';
  if (hash === '#/privacy') return 'privacy';
  if (hash === '#/support') return 'support';
  return 'app';
}

function Root() {
  const [page, setPage] = useState(getPage);

  useEffect(() => {
    const onHashChange = () => setPage(getPage());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const enterApp = () => { window.location.hash = '#/app'; };
  const enterScenario = () => { window.location.hash = '#/scenario'; };
  const enterQuickStart = () => { window.location.hash = '#/quickstart'; };
  const goBack = () => { window.location.hash = ''; };
  const goBackToScenario = () => { window.location.hash = '#/scenario'; };

  return (
    <>
      {page === 'app'        && <App />}
      {page === 'scenario'   && <Scenario onBack={goBack} onEnterApp={enterApp} onQuickStart={enterQuickStart} />}
      {page === 'quickstart' && <QuickStart onBack={goBackToScenario} onEnterApp={enterApp} />}
      {page === 'landing'    && <Landing onEnterApp={enterApp} onEnterScenario={enterScenario} />}
      {page === 'privacy'    && <Privacy />}
      {page === 'support'    && <Support />}
      <IOSInstallHint />
      <InstallBanner />
      <Analytics />
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
