/* eslint-disable react-refresh/only-export-components */
import { StrictMode, Suspense, lazy, useState, useEffect, useRef, useCallback } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { configureProductAnalytics, trackEvent, trackPageView, syncConsent } from './analytics.ts'
import './styles/tokens.css'
import './index.css'
import App from './App.jsx'
import AskClinicalEdge from './AskClinicalEdge.jsx'
import Landing from './Landing.jsx'
import Scenario from './Scenario.jsx'
import QuickStart from './QuickStart.jsx'
import Privacy from './Privacy.jsx'
import Terms from './Terms.jsx'
import Support from './Support.jsx'
import Download from './Download.jsx'
import ClinicalEdgeHome from './ClinicalEdgeHome.jsx'
import WorkspaceNavigation from './components/WorkspaceNavigation.jsx'
import AIConsentGate from './components/AIConsentGate.jsx'
import { onConsentChange } from './consent.js'
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
import { TRACK_ENABLED, trackRoute } from './modules/med-surg-track/feature.js'
import { SHIFT_ENABLED } from './shiftFeature.js'
import { shiftRoute, returningShift } from './modules/the-shift/routing.js'

if (typeof window !== 'undefined') configureProductAnalytics();

function ShiftUnavailable({ navigate, active = true, mode }) {
  useEffect(() => { if (active && mode !== 'return') trackEvent('shift_load_failed'); }, [active, mode]);
  if (!active || mode === 'return') return null;
  return <main className="ce-not-found" role="alert"><h1>The Shift could not load.</h1><p>Your device-local progress has not been cleared. Check your connection and reload, or return Home.</p><button type="button" onClick={() => window.location.reload()}>Reload</button><a href="/" onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); navigate('/'); }}>Return Home</a></main>;
}

// Keep this build-time condition inline so disabled builds emit no scenario chunks.
const ShiftExperience = import.meta.env.VITE_SHIFT_ENABLED === 'true' ? lazy(() => import('./modules/the-shift/ShiftExperience.jsx').catch(() => ({ default: ShiftUnavailable }))) : null;


const MedSurgTrack = import.meta.env.VITE_MED_SURG_TRACK_PREVIEW === 'true' ? lazy(() => import('./modules/med-surg-track/Track.jsx')) : null;

// ── Service Worker Registration ─────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((err) => console.warn('SW registration failed:', err));
  });
}

// ── Routing ─────────────────────────────────────────────────────────────────
function normalizeLegacyPrivacyRoute() {
  if (window.location.pathname === '/' && window.location.hash === '#/privacy') {
    history.replaceState(history.state, '', `/privacy${window.location.search}`);
  }
}

function getPage() {
  normalizeLegacyPrivacyRoute();
  const path = window.location.pathname;
  if (path === '/' || path === '/home') return 'home';
  if (path === '/copilot')    return 'app';
  if (path === '/ask') return 'ask';
  if (SHIFT_ENABLED && TRACK_ENABLED && trackRoute(path)) return 'med-surg';
  if (SHIFT_ENABLED && shiftRoute(path)) return 'shift-learning';
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
  if (path === '/choices')    return 'privacy';
  if (path === '/terms')      return 'terms';
  if (path === '/support')    return 'support';
  if (path === '/download')   return 'download';
  if (path === '/icu-drips')      return 'icudrips';
  if (path === '/reference-hub')  return 'referencehub';
  if (path === '/abg-lab')        return 'abglab';
  if (path === '/brain-sheets')       return 'brainsheets';
  if (path.startsWith('/brain-sheets/')) return 'brainsheets-detail';
  if (path === '/blog')           return 'blog';
  if (path.startsWith('/blog/'))  return 'blogpost';
  return 'notfound';
}

function Root() {
  const [page, setPage] = useState(getPage);
  const [routeKey, setRouteKey] = useState(() => window.location.pathname + window.location.search);
  const [workspaceEntered, setWorkspaceEntered] = useState(() => getPage() === 'app');
  const [askEntered, setAskEntered] = useState(() => getPage() === 'ask');
  const [shiftEntered, setShiftEntered] = useState(() => SHIFT_ENABLED && getPage() === 'shift-learning');
  const [scenarioActive, setScenarioActive] = useState(false);
  const [askSnapshot, setAskSnapshot] = useState(null);
  const shareSnapshot = useCallback(snapshot => setAskSnapshot(snapshot ? structuredClone(snapshot) : null), []);
  const workspacePosition = useRef({ scroll: 0, focus: null });
  const currentPage = useRef(page);
  useEffect(() => { currentPage.current = page; }, [page]);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const sync = () => { syncConsent(); trackPageView(window.location.pathname); };
    const unsubscribe = onConsentChange(sync);
    return unsubscribe;
  }, []);
  useEffect(() => { trackPageView(window.location.pathname); }, [routeKey]);

  // navigate() — pushes pathname and syncs React state without a reload
  const navigate = (path) => {
    if (SHIFT_ENABLED && returningShift(window.location.search) === 'monitor-alarm' && window.location.pathname.startsWith('/rhythm-lab') && /^\/rhythm-lab(?:\/|\?|$)/.test(path)) {
      const destination = new URL(path, window.location.origin);
      destination.searchParams.set('shift', 'monitor-alarm');
      path = destination.pathname + destination.search;
    }
    if (path === window.location.pathname + window.location.search) return;
    if (page === 'app') workspacePosition.current.scroll = window.scrollY;
    history.replaceState({ ...history.state, ceScroll: window.scrollY }, '', window.location.href);
    history.pushState({ ceScroll: 0 }, '', path);
    setPage(getPage());
    setRouteKey(window.location.pathname + window.location.search);
    if (getPage() === 'app') setWorkspaceEntered(true);
    if (getPage() === 'ask') setAskEntered(true);
    if (SHIFT_ENABLED && getPage() === 'shift-learning') setShiftEntered(true);
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
      setRouteKey(window.location.pathname + window.location.search);
      if (getPage() === 'app') setWorkspaceEntered(true);
      if (getPage() === 'ask') setAskEntered(true);
      if (SHIFT_ENABLED && getPage() === 'shift-learning') setShiftEntered(true);
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
  const enterQuickStart  = () => navigate('/quickstart');
  const goBack           = () => navigate('/copilot');
  const goBackToScenario = () => navigate('/scenario');

  return (
    <>
      {SHIFT_ENABLED && returningShift(window.location.search) && ['ask', 'abglab', 'referencehub', 'shift-learning', 'rhythmlab', 'rhythmlab-library', 'rhythmlab-compare', 'rhythmlab-pearls', 'rhythmlab-sprint', 'rhythmlab-practice'].includes(page) && <Suspense fallback={null}><ShiftExperience mode="return" navigate={navigate} routeKey={routeKey} /></Suspense>}
      {page === 'med-surg' && MedSurgTrack && <Suspense fallback={<main role="status">Opening the track...</main>}><MedSurgTrack navigate={navigate} routeKey={routeKey} /></Suspense>}
      {page === 'home'       && <ClinicalEdgeHome onNavigate={navigate} />}
      {SHIFT_ENABLED && shiftEntered && <Suspense fallback={page === 'shift-learning' ? <main className="ce-not-found" role="status">Opening The Shift...</main> : null}><ShiftExperience navigate={navigate} active={page === 'shift-learning'} routeKey={routeKey} /></Suspense>}
      {page === 'rhythmlab'          && <RhythmLabModule onGoHome={() => navigate('/')} navigate={navigate} />}
      {page === 'rhythmlab-library'  && <RhythmLibraryPage navigate={navigate} />}
      {page === 'rhythmlab-practice' && <RhythmPracticePage navigate={navigate} />}
      {page === 'rhythmlab-compare'  && <RhythmComparePage key={routeKey} navigate={navigate} />}
      {page === 'rhythmlab-pearls'   && <RhythmPearlsPage navigate={navigate} />}
      {page === 'rhythmlab-sprint'   && <RhythmSprintPage navigate={navigate} />}
      {page === 'scenario'   && <Scenario onBack={goBack} onEnterApp={enterApp} onQuickStart={enterQuickStart} />}
      {page === 'quickstart' && <QuickStart onBack={goBackToScenario} onEnterApp={enterApp} />}
      {page === 'landing'    && <Landing onNavigate={navigate} />}
      {page === 'privacy'    && <Privacy onNavigate={navigate} />}
      {page === 'terms'      && <Terms onNavigate={navigate} />}
      {page === 'support'    && <Support onNavigate={navigate} />}
      {page === 'notfound' && <main className="ce-not-found"><span>Clinical Edge</span><h1>Page not found</h1><p>This address does not lead to a Clinical Edge page.</p><a href="/" onClick={(event) => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); navigate('/'); }}>Return Home</a></main>}
      {page === 'download'   && <Download onNavigate={navigate} />}
      {page === 'icudrips'      && <IcuDripsModule onGoHome={() => navigate('/')} />}
      {page === 'referencehub'  && <ReferenceHubModule key={routeKey} onGoHome={() => navigate('/')} initialReferenceId={SHIFT_ENABLED && returningShift(window.location.search) ? new URLSearchParams(window.location.search).get('reference') : null} />}
      {page === 'abglab'        && <><p hidden={!(SHIFT_ENABLED && new URLSearchParams(window.location.search).get('example') === 'resp-acidosis' && returningShift(window.location.search))} className="ce-shift-example-note">ABG Lab's existing respiratory-acidosis example uses different values from the Shift. Select Interpret to work through this example.</p><AbgLabModule key={routeKey} onGoHome={() => navigate('/')} initialExampleId={SHIFT_ENABLED && returningShift(window.location.search) ? new URLSearchParams(window.location.search).get('example') : null} /></>}
      {page === 'brainsheets'        && <BrainSheetsModule navigate={navigate} onGoHome={() => navigate('/')} />}
      {page === 'brainsheets-detail' && <BrainSheetsModule navigate={navigate} onGoHome={() => navigate('/')} templateId={window.location.pathname.replace(/^\/brain-sheets\//, '').replace(/\/$/, '')} />}
      {page === 'blog'          && <BlogIndex />}
      {page === 'blogpost'      && <BlogPostPage slug={window.location.pathname.replace(/^\/blog\//, '').replace(/\/$/, '')} />}
      {askEntered && <div hidden={page !== 'ask'} inert={page !== 'ask'} className="ce-ask-workspace"><AIConsentGate navigate={navigate} experience="ask"><AskClinicalEdge navigate={navigate} isVisible={page === 'ask'} snapshot={askSnapshot} /></AIConsentGate></div>}
      {/* Keep the scenario's existing hook tree in memory, never browser storage. */}
      {workspaceEntered && <div hidden={page !== 'app'} inert={page !== 'app'} className="ce-shift-workspace" onFocusCapture={(event) => { workspacePosition.current.focus = event.target; }}><AIConsentGate navigate={navigate}><App onGoHome={() => navigate('/')} navigate={navigate} isOnline={isOnline} isVisible={page === 'app'} onScenarioActivity={setScenarioActive} onSnapshotChange={shareSnapshot} initialCaptureMode={new URLSearchParams(window.location.search).get('capture') === 'rapid' ? 'rapid' : 'manual'} /></AIConsentGate></div>}
      <WorkspaceNavigation page={page} navigate={navigate} scenarioActive={scenarioActive} />
    </>
  );
}

// Prerendered routes ship server-rendered markup inside #root, tagged with
// the exact path it was built for (data-ssr-route). Hydrate only when that
// matches the current URL — e.g. /copilot has no static file on Vercel, so
// the SPA rewrite hands it dist/index.html (prerendered for "/"); that markup
// belongs to Home, not Copilot, and must be replaced rather than hydrated.
normalizeLegacyPrivacyRoute();
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
