import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './styles/tokens.css'
import './index.css'
import App from './App.jsx'
import Landing from './Landing.jsx'
import Scenario from './Scenario.jsx'
import QuickStart from './QuickStart.jsx'
import Privacy from './Privacy.jsx'
import Support from './Support.jsx'
import Download from './Download.jsx'
import ClinicalEdgeHome from './ClinicalEdgeHome.jsx'
import RhythmLabModule from './modules/rhythm-lab/RhythmLabModule.tsx'
import IcuDripsModule from './modules/icu-drips/IcuDripsModule.jsx'
import ReferenceHubModule from './modules/reference-hub/ReferenceHubModule.jsx'

// ── Service Worker Registration ─────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((err) => console.warn('SW registration failed:', err));
  });
}

// ── Routing ─────────────────────────────────────────────────────────────────
function getPage() {
  const path = window.location.pathname;
  if (path === '/' || path === '/home') return 'home';
  if (path === '/copilot')    return 'app';
  if (path === '/rhythm-lab') return 'rhythmlab';
  if (path === '/landing')    return 'landing';
  if (path === '/scenario')   return 'scenario';
  if (path === '/quickstart') return 'quickstart';
  if (path === '/privacy')    return 'privacy';
  if (path === '/support')    return 'support';
  if (path === '/download')   return 'download';
  if (path === '/icu-drips')      return 'icudrips';
  if (path === '/reference-hub')  return 'referencehub';
  return 'home'; // fallback to home hub
}

function Root() {
  const [page, setPage] = useState(getPage);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  // navigate() — pushes pathname and syncs React state without a reload
  const navigate = (path) => {
    history.pushState({}, '', path);
    setPage(getPage());
  };

  useEffect(() => {
    // Handle browser back / forward
    const onPop = () => setPage(getPage());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    const handleOnline  = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const enterApp         = () => navigate('/copilot');
  const enterScenario    = () => navigate('/scenario');
  const enterQuickStart  = () => navigate('/quickstart');
  const goBack           = () => navigate('/copilot');
  const goBackToScenario = () => navigate('/scenario');

  return (
    <>
      {page === 'home'       && <ClinicalEdgeHome onNavigate={navigate} />}
      {page === 'app'        && <App onGoHome={() => navigate('/')} isOnline={isOnline} />}
      {page === 'rhythmlab'  && <RhythmLabModule onGoHome={() => navigate('/')} />}
      {page === 'scenario'   && <Scenario onBack={goBack} onEnterApp={enterApp} onQuickStart={enterQuickStart} />}
      {page === 'quickstart' && <QuickStart onBack={goBackToScenario} onEnterApp={enterApp} />}
      {page === 'landing'    && <Landing onEnterApp={enterApp} onEnterScenario={enterScenario} />}
      {page === 'privacy'    && <Privacy />}
      {page === 'support'    && <Support />}
      {page === 'download'   && <Download />}
      {page === 'icudrips'      && <IcuDripsModule onGoHome={() => navigate('/')} />}
      {page === 'referencehub'  && <ReferenceHubModule onGoHome={() => navigate('/')} />}
      <Analytics />
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
