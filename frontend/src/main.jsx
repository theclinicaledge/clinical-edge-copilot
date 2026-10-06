/* eslint-disable react-refresh/only-export-components */
import { StrictMode, useState, useEffect, useRef } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './styles/tokens.css'
import './index.css'
import App from './App.jsx'
import AskClinicalEdge from './AskClinicalEdge.jsx'
import Landing from './Landing.jsx'
import Scenario from './Scenario.jsx'
import QuickStart from './QuickStart.jsx'
import Privacy from './Privacy.jsx'
import Support from './Support.jsx'
import Download from './Download.jsx'
import ClinicalEdgeHome from './ClinicalEdgeHome.jsx'
import WorkspaceNavigation from './components/WorkspaceNavigation.jsx'
import RhythmLabModule from './modules/rhythm-lab/RhythmLabModule.tsx'
import RhythmLibraryPage from './modules/rhythm-lab/RhythmLibraryPage.tsx'
import RhythmPracticePage from './modules/rhythm-lab/RhythmPracticePage.tsx'
import RhythmComparePage from './modules/rhythm-lab/RhythmComparePage.tsx'
import RhythmPearlsPage from './modules/rhythm-lab/RhythmPearlsPage.tsx'
import RhythmSprintPage from './modules/rhythm-lab/RhythmSprintPage.tsx'
import IcuDripsModule from './modules/icu-drips/IcuDripsModule.jsx'
import ReferenceHubModule from './modules/reference-hub/ReferenceHubModule.jsx'
import AbgLabModule from './modules/abg-lab/AbgLabModule.jsx'
import BrainSheetsModule from './modules/brain-sheets/BrainSheetsModule.jsx'
import BlogIndex from './blog/BlogIndex.jsx'
import BlogPostPage from './blog/BlogPostPage.jsx'


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
  if (path === '/ask') return 'ask';
  if (path === '/rhythm-lab') return 'rhythmlab';
  if (path === '/rhythm-lab/library')  return 'rhythmlab-library';
  if (path === '/rhythm-lab/practice') return 'rhythmlab-practice';
  if (path === '/rhythm-lab/compare')  return 'rhythmlab-compare';
  if (path === '/rhythm-lab/pearls')   return 'rhythmlab-pearls';
  if (path === '/rhythm-lab/sprint')   return 'rhythmlab-sprint';
  if (path === '/landing')    return 'landing';
  if (path === '/scenario')   return 'scenario';
  if (path === '/quickstart') return 'quickstart';
  if (path === '/privacy')    return 'privacy';
  if (path === '/support')    return 'support';
  if (path === '/download')   return 'download';
  if (path === '/icu-drips')      return 'icudrips';
  if (path === '/reference-hub')  return 'referencehub';
  if (path === '/abg-lab')        return 'abglab';
  if (path === '/brain-sheets')       return 'brainsheets';
  if (path.startsWith('/brain-sheets/')) return 'brainsheets-detail';
  if (path === '/blog')           return 'blog';
  if (path.startsWith('/blog/'))  return 'blogpost';
  return 'home'; // fallback to home hub
}

function Root() {
  const [page, setPage] = useState(getPage);
  const [workspaceEntered, setWorkspaceEntered] = useState(() => getPage() === 'app');
  const [scenarioActive, setScenarioActive] = useState(false);
  const workspacePosition = useRef({ scroll: 0, focus: null });
  const currentPage = useRef(page);
  useEffect(() => { currentPage.current = page; }, [page]);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  // navigate() — pushes pathname and syncs React state without a reload
  const navigate = (path) => {
    if (path === window.location.pathname + window.location.search) return;
    if (page === 'app') workspacePosition.current.scroll = window.scrollY;
    history.replaceState({ ...history.state, ceScroll: window.scrollY }, '', window.location.href);
    history.pushState({ ceScroll: 0 }, '', path);
    setPage(getPage());
    if (getPage() === 'app') setWorkspaceEntered(true);
    requestAnimationFrame(() => {
      window.scrollTo(0, getPage() === 'app' ? workspacePosition.current.scroll : 0);
      if (getPage() === 'app' && workspacePosition.current.focus?.isConnected) workspacePosition.current.focus.focus({ preventScroll: true });
    });
  };

  useEffect(() => {
    // Handle browser back / forward
    const onPop = () => {
      if (currentPage.current === 'app') workspacePosition.current.scroll = window.scrollY;
      setPage(getPage());
      if (getPage() === 'app') setWorkspaceEntered(true);
      requestAnimationFrame(() => {
        window.scrollTo(0, getPage() === 'app' ? workspacePosition.current.scroll : history.state?.ceScroll || 0);
        if (getPage() === 'app' && workspacePosition.current.focus?.isConnected) workspacePosition.current.focus.focus({ preventScroll: true });
      });
    };
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
      {page === 'rhythmlab'          && <RhythmLabModule onGoHome={() => navigate('/')} navigate={navigate} />}
      {page === 'rhythmlab-library'  && <RhythmLibraryPage navigate={navigate} />}
      {page === 'rhythmlab-practice' && <RhythmPracticePage navigate={navigate} />}
      {page === 'rhythmlab-compare'  && <RhythmComparePage navigate={navigate} />}
      {page === 'rhythmlab-pearls'   && <RhythmPearlsPage navigate={navigate} />}
      {page === 'rhythmlab-sprint'   && <RhythmSprintPage navigate={navigate} />}
      {page === 'scenario'   && <Scenario onBack={goBack} onEnterApp={enterApp} onQuickStart={enterQuickStart} />}
      {page === 'quickstart' && <QuickStart onBack={goBackToScenario} onEnterApp={enterApp} />}
      {page === 'landing'    && <Landing onEnterApp={enterApp} onEnterScenario={enterScenario} />}
      {page === 'privacy'    && <Privacy />}
      {page === 'support'    && <Support />}
      {page === 'download'   && <Download onNavigate={navigate} />}
      {page === 'icudrips'      && <IcuDripsModule onGoHome={() => navigate('/')} />}
      {page === 'referencehub'  && <ReferenceHubModule onGoHome={() => navigate('/')} />}
      {page === 'abglab'        && <AbgLabModule onGoHome={() => navigate('/')} />}
      {page === 'brainsheets'        && <BrainSheetsModule navigate={navigate} onGoHome={() => navigate('/')} />}
      {page === 'brainsheets-detail' && <BrainSheetsModule navigate={navigate} onGoHome={() => navigate('/')} templateId={window.location.pathname.replace(/^\/brain-sheets\//, '').replace(/\/$/, '')} />}
      {page === 'blog'          && <BlogIndex />}
      {page === 'blogpost'      && <BlogPostPage slug={window.location.pathname.replace(/^\/blog\//, '').replace(/\/$/, '')} />}
      <div hidden={page !== 'ask'} inert={page !== 'ask'} className="ce-ask-workspace"><AskClinicalEdge navigate={navigate} isVisible={page === 'ask'} /></div>
      {/* Keep the scenario's existing hook tree in memory, never browser storage. */}
      {workspaceEntered && <div hidden={page !== 'app'} inert={page !== 'app'} className="ce-shift-workspace" onFocusCapture={(event) => { workspacePosition.current.focus = event.target; }}><App onGoHome={() => navigate('/')} navigate={navigate} isOnline={isOnline} isVisible={page === 'app'} onScenarioActivity={setScenarioActive} initialCaptureMode={new URLSearchParams(window.location.search).get('capture') === 'rapid' ? 'rapid' : 'manual'} /></div>}
      <WorkspaceNavigation page={page} navigate={navigate} scenarioActive={scenarioActive} />
      <Analytics />
    </>
  );
}

// Prerendered routes ship server-rendered markup inside #root, tagged with
// the exact path it was built for (data-ssr-route). Hydrate only when that
// matches the current URL — e.g. /copilot has no static file on Vercel, so
// the SPA rewrite hands it dist/index.html (prerendered for "/"); that markup
// belongs to Home, not Copilot, and must be replaced rather than hydrated.
const rootEl = document.getElementById('root')
const app = (
  <StrictMode>
    <Root />
  </StrictMode>
)

const normalize = (p) => (p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p)
const ssrRoute = rootEl.getAttribute('data-ssr-route')
const matchesCurrentRoute = ssrRoute !== null && normalize(ssrRoute) === normalize(window.location.pathname)

if (matchesCurrentRoute) {
  hydrateRoot(rootEl, app)
} else {
  // Falling through the SPA rewrite means this HTML was prerendered for a
  // different route (e.g. /copilot receiving Home's dist/index.html) — its
  // title/meta belong to that other page, so reset to the generic default
  // before the real page renders instead of leaving the wrong title visible.
  document.title = 'Clinical Edge Copilot'
  createRoot(rootEl).render(app)
}
