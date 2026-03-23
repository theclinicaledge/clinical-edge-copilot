import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Landing from './Landing.jsx'
import Scenario from './Scenario.jsx'
import QuickStart from './QuickStart.jsx'

// ── Service Worker Registration ─────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((err) => console.warn('SW registration failed:', err));
  });
}

// ── Subtle Install Banner ───────────────────────────────────────────────────
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
  if (hash === '#/app') return 'app';
  if (hash === '#/scenario') return 'scenario';
  if (hash === '#/quickstart') return 'quickstart';
  return 'landing';
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
      <InstallBanner />
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
