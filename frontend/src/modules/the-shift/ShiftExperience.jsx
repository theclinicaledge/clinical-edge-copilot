import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ClinicalEdgeMark } from '../../components/ModuleHeader.jsx';
import AppStoreBadge from '../../components/AppStoreBadge.jsx';
import { LEARN_ACTIONS } from '../../components/workspaceActions.js';
import Shift from './Shift.jsx';
import Monitor from './monitor/Monitor.jsx';
import Discharge from './discharge/Discharge.jsx';
import LibraryMonitorArtwork from './LibraryMonitorArtwork.jsx';
import { CONVERSATION_ENABLED } from './conversation/private.js';
import Conversation from './conversation/Conversation.jsx';
import Shift5 from './shift5/Shift5.jsx';
import { SHIFTS, getShift, progressLabel, scenarioLink } from './integrated/registry.js';
import { shiftRoute, shiftPath, learningDestination, returningShift } from './routing.js';
import { shiftOpened } from '../../productAnalytics.js';
import './app.css';
import DebriefNavigation from './DebriefNavigation.jsx';
import { learningStatus, resumableExperiences } from '../../components/continueLearning.js';

// Standalone release authorized October 18, 2026; the track keeps its own pilot gate.
const StandaloneRewind = import.meta.env.VITE_REWIND_ENABLED !== 'false' ? lazy(() => import('../rewind/StandaloneRewind.jsx')) : null;
const rewindAssignments = { 'drowsy-patient': 'a1', 'which-patient-first': 'a2', 'monitor-alarm': 'monitor-alarm', 'discharge-puzzle': 'discharge-puzzle', conversation: 'conversation' };

const renderers = { 'drowsy-patient': Shift, 'monitor-alarm': Monitor, 'discharge-puzzle': Discharge, 'which-patient-first': Shift5 };
if (CONVERSATION_ENABLED) renderers.conversation = Conversation;
const Shift6 = (await import('./shift6/Shift6.jsx')).default;
if (Shift6) renderers['stable-number'] = Shift6;
const Shift7 = (await import('./shift7/Shift7.jsx')).default;
const Shift7Art = (await import('./shift7/Artwork.jsx')).default;
if (Shift7) renderers['missing-time'] = Shift7;
const Shift8 = (await import('./shift8/Shift8.jsx')).default;
if (Shift8) renderers['code-blue'] = Shift8;
const Shift10 = (await import('./shift10/Shift10.jsx')).default;
renderers['transfer-not-ready'] = Shift10;
const Shift9 = (await import('./shift9/Shift9.jsx')).default;
renderers['quiet-complaint'] = Shift9;
const images = {
  'drowsy-patient': new URL('./assignment-poster.svg', import.meta.url).href,
  'discharge-puzzle': new URL('./discharge/poster.svg', import.meta.url).href,
  'which-patient-first': new URL('./shift5/poster.svg', import.meta.url).href,
  ...(CONVERSATION_ENABLED ? { conversation: new URL('./conversation/room.svg', import.meta.url).href } : {}),
  ...(Shift6 ? { 'stable-number': new URL('./shift6/poster.svg', import.meta.url).href } : {}),
  'code-blue': new URL('./assignment-poster.svg', import.meta.url).href,
  'transfer-not-ready': new URL('./shift10/poster.svg', import.meta.url).href,
  'quiet-complaint': getShift('quiet-complaint').image,
};

function AppLink({ to, navigate, children, ...props }) {
  return <a {...props} href={to} onClick={event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); navigate(to);
  }}>{children}</a>;
}

function ReviewDialog({ item, close }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current, previous = document.activeElement;
    dialog.showModal();
    return () => { dialog.close(); if (previous?.isConnected) previous.focus(); };
  }, []);
  return <dialog className="shift-review-dialog" ref={ref} aria-labelledby="shift-review-title" onCancel={close}>
    <header><div><span className="shift-overline">Sources & review record</span><h2 id="shift-review-title">{item.title}</h2></div><button onClick={close} aria-label="Close source record">&#215;</button></header>
    <p className="shift-review-status">{item.review.status} Not a competency assessment.</p>
    <dl><div><dt>Scenario / content version</dt><dd>{item.scenarioId} / {item.contentVersion}</dd></div><div><dt>Reviewer / review date</dt><dd>{item.review.reviewer || 'Not supplied'} / {item.review.reviewDate || 'Not supplied'}</dd></div><div><dt>Approval reported for version</dt><dd>{item.review.approvedVersion || 'None'}</dd></div></dl>
    <h3>Learning objectives</h3><ul>{item.objectives.map(text => <li key={text}>{text}</li>)}</ul>
    <h3>Teaching sources & applicability</h3><p>{item.review.sourceVerification || 'Passage-level source verification is not documented. A reference does not certify the scenario.'}</p>
    <ol>{item.sources.map(source => <li key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a><p>{source.scope}</p><p><strong>Limitation: </strong>{source.limitation}</p></li>)}</ol>
    {item.id === 'monitor-alarm' && <p>All five ECGs are original educational illustrations, not patient recordings. Approval of the complete scenario package is founder-reported; no separate ECG validation is claimed.</p>}
  </dialog>;
}

export function Library({ navigate, progressView = 'all' }) {
  const [setting, setSetting] = useState('All settings');
  const [limit, setLimit] = useState(6);
  const grid = useRef(null);
  const firstAdded = useRef(null);
  useEffect(() => {
    if (firstAdded.current !== null) {
      grid.current?.querySelectorAll('h2 a')[firstAdded.current]?.focus();
      firstAdded.current = null;
    }
  }, [limit]);
  const settings = ['All settings', ...new Set(SHIFTS.map(item => item.specialty))];
  const resumes = resumableExperiences(SHIFTS, progressLabel);
  const resume = resumes[0]?.item;
  const debriefs = SHIFTS.filter(item => learningStatus(progressLabel(item)) === 'finished');
  const collection = progressView === 'unfinished' ? resumes.map(row => row.item) : progressView === 'debriefs' ? debriefs : SHIFTS;
  const filtered = collection.filter(item => setting === 'All settings' || item.specialty === setting);
  return <div className="shift-library-page">
    <header className="shift-library-brand"><AppLink to="/" navigate={navigate}><ClinicalEdgeMark /><strong>Clinical Edge</strong></AppLink><span>Learn</span></header>
    <main className="shift-library-main">
      <header className="shift-library-heading"><p className="shift-overline">Fictional nursing experiences</p><h1>The Shift Library</h1><p>Step into the moment. Make your call. Understand the why.</p><small>Fictional education / Progress stays on this device</small></header>
      <aside className="shift-library-download" aria-labelledby="shift-download-title">
        <div><h2 id="shift-download-title">Prefer learning in the app?</h2><p>Get Clinical Edge for iPhone, or explore a shift here.</p></div>
        <AppStoreBadge placement="learn" height={44} />
      </aside>
      {import.meta.env.VITE_MED_SURG_TRACK_PREVIEW === 'true' && <section className="shift-track-entry" aria-labelledby="med-surg-entry-title"><div><p className="shift-overline">Connected learning / Private pilot</p><h2 id="med-surg-entry-title">Med-Surg Clinical</h2><p>Three linked assignments. Make your call, explore the feedback, then try optional Rewinds with different patient findings.</p><small>Your original responses stay preserved. Track progress is separate from individual shifts.</small></div><AppLink to="/learn/med-surg" navigate={navigate} className="shift-primary">Open learning track <span aria-hidden="true">→</span></AppLink></section>}
      {resume && progressView === 'all' && <aside className="shift-library-resume"><div><span className="shift-overline">Pick up where you left off</span><strong>{resume.title}</strong><small>{progressLabel(resume)}</small></div><AppLink to={shiftPath(resume.id)} navigate={navigate} className="shift-secondary">Resume shift <span aria-hidden="true">→</span></AppLink></aside>}
      <div className="shift-library-progress-filter"><label htmlFor="shift-progress-view">Show</label><select id="shift-progress-view" value={progressView} onChange={event => { setLimit(6); navigate(event.target.value === 'unfinished' ? '/learn/shifts?saved=1' : event.target.value === 'debriefs' ? '/learn/shifts?debriefs=1' : '/learn/shifts'); }}><option value="all">All shifts ({SHIFTS.length})</option><option value="unfinished">Unfinished ({resumes.length})</option><option value="debriefs">Debriefs ({debriefs.length})</option></select></div>
      {progressView === 'unfinished' && <p className="shift-library-activity-note">Activity dates are not available for every save. Dated saves appear first, newest first; undated saves follow library order.</p>}
      <div className="shift-library-filterbar"><div role="group" aria-label="Filter shifts by setting">{settings.map(value => <button key={value} aria-pressed={setting === value} onClick={() => { setSetting(value); setLimit(6); }}>{value}</button>)}</div><p aria-live="polite">{filtered.length} {filtered.length === 1 ? 'shift' : 'shifts'}</p></div>
      {!filtered.length && <p className="shift-library-empty" role="status">{setting !== 'All settings' ? 'No shifts match these filters.' : progressView === 'unfinished' ? 'No unfinished shifts saved on this device. Choose All shifts to explore.' : 'No debriefs saved on this device. Choose All shifts to explore.'}</p>}
      <div className="shift-library-grid" ref={grid}>{filtered.slice(0, limit).map(item => {
        const progress = progressLabel(item);
        const status = learningStatus(progress);
        const statusText = { new: 'Not started', finished: 'Finished', active: 'In progress', unavailable: 'Saved progress unavailable' }[status];
        // Only registered scenarios reach the library; preview gates live in the registry.
        const showStatus = true;
        return <article className="shift-library-card" key={item.id} data-shift-id={item.id}>
          <AppLink to={shiftPath(item.id)} navigate={navigate} className="shift-library-image" tabIndex={-1} aria-hidden="true">{item.id === 'missing-time' && Shift7Art ? <Shift7Art compact /> : item.id === 'monitor-alarm' ? <LibraryMonitorArtwork /> : <img src={images[item.id]} alt="" />}</AppLink>
          <div className="shift-library-copy"><div className="shift-library-card-meta"><span className="shift-library-number">SHIFT {item.number}</span>{showStatus && <span className={`shift-library-status shift-library-status--${status}`}><span aria-hidden="true">{status === 'finished' ? '\u2713' : status === 'active' ? '\u25D0' : status === 'unavailable' ? '!' : '\u25CB'}</span>{statusText}</span>}</div><p className="shift-overline">{item.specialty} / {item.difficulty}</p><h2><AppLink to={shiftPath(item.id)} navigate={navigate}>{item.title}</AppLink></h2><p>{item.description}</p><small>{item.duration} / Students & new grads</small><AppLink to={shiftPath(item.id)} navigate={navigate} className="shift-primary">{status === 'new' ? 'Begin shift' : status === 'finished' ? 'Review debrief' : status === 'active' ? 'Continue shift' : 'Open shift'} <span aria-hidden="true">&#8594;</span></AppLink><small>{status === 'new' ? 'Ready when you are' : progress}</small></div>
        </article>;
      })}</div>
      {limit < filtered.length && <button className="shift-secondary shift-library-more" onClick={() => { firstAdded.current = limit; setLimit(value => value + 6); }}>Show more shifts <span aria-hidden="true">↓</span></button>}
      <p className="shift-local-note">Progress and fixed-choice reflections stay on this device. No patient information, AI calls or account. Restart a scenario to clear its progress.</p>
      <section className="shift-library-tools"><h2>Build on what you notice</h2><div>{LEARN_ACTIONS.map(action => <AppLink key={action.path} to={action.path} navigate={navigate}><strong>{action.label}</strong><span>{action.detail}</span><b aria-hidden="true">&#8599;</b></AppLink>)}<AppLink to="/reference-hub" navigate={navigate}><strong>References</strong><span>Existing clinical reference hub</span><b aria-hidden="true">&#8599;</b></AppLink><AppLink to="/icu-drips" navigate={navigate}><strong>ICU Drips</strong><span>Infusion reference</span><b aria-hidden="true">&#8599;</b></AppLink></div></section>
      <footer className="shift-library-footer"><AppLink to="/privacy" navigate={navigate}>Privacy</AppLink><AppLink to="/terms" navigate={navigate}>Terms</AppLink><span>Fictional education. Not patient-specific care.</span></footer>
    </main>
  </div>;
}

function Handoff({ item, navigate }) {
  const [status, setStatus] = useState('');
  const topic = new URLSearchParams(window.location.search).get('topic');
  const question = item.askQuestions?.[topic] || item.askQuestion;
  return <main className="shift-handoff"><AppLink to={shiftPath(item.id)} navigate={navigate}>&#8592; Return to {item.title}</AppLink><p className="shift-overline">Connected learning / Ask Clinical Edge</p><h1>Keep the question going.</h1><blockquote>{question}</blockquote>{item.id === 'conversation' && <p>This question has not been tested with the live model. Ask may decline it. Ask is not a crisis service.</p>}<button className="shift-secondary" onClick={async () => { try { await navigator.clipboard.writeText(question); setStatus('Question copied.'); } catch { setStatus('Copy unavailable. Select the question above to copy it manually.'); } }}>Copy question</button><p role="status">{status}</p><p>Open Ask and paste the question when you are ready. Nothing is submitted automatically. Existing AI consent, privacy protections and the daily question allowance apply.</p><AppLink to={`/ask?shift=${item.id}`} navigate={navigate} className="shift-primary">Open Ask <span aria-hidden="true">&#8594;</span></AppLink></main>;
}

function NextStep({ item, navigate }) {
  const [primary, ...other] = item.recommendations;
  return <section className="shift-next-step" aria-label="Your next step">
    <span className="shift-overline">Keep learning</span>
    <h2>Your next step</h2>
    <h3>{primary.title}</h3><p>{primary.detail}</p>
    <AppLink className="shift-primary" to={learningDestination(primary.path, item.id)} navigate={navigate}>
      {primary.path.startsWith('/ask') ? 'Prepare a question' : primary.path.startsWith('/abg') ? 'Open ABG example' : primary.path.startsWith('/rhythm-lab') ? 'Open rhythm comparison' : 'Open reference'} <span aria-hidden="true">&#8594;</span>
    </AppLink>
    {item.recommendations.some(link => link.path.startsWith('/ask')) && <p className="shift-next-step__note">Ask is optional. Nothing is submitted automatically. Existing consent and daily limits apply.</p>}
    <div className="shift-next-step__alternatives">{other.map(link => <AppLink key={link.id} to={learningDestination(link.path, item.id)} navigate={navigate}>{link.title} <span aria-hidden="true">&#8599;</span></AppLink>)}<AppLink to="/learn/shifts" navigate={navigate}>Choose another shift <span aria-hidden="true">&#8594;</span></AppLink></div>
  </section>;
}

function Scenario({ item, navigate, active }) {
  const [review, setReview] = useState(false);
  const root = useRef(null);
  const Scene = renderers[item.id];
  useEffect(() => {
    const heading = root.current.querySelector('h1');
    const observer = new MutationObserver(() => { root.current.closest('.ce-shift-feature').scrollTop = 0; });
    observer.observe(heading, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  function capture(event) {
    const anchor = event.target.closest('a[href]');
    if (!anchor || anchor.hasAttribute('download') || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const raw = anchor.getAttribute('href');
    if (raw.startsWith('#')) {
      const target = document.getElementById(raw.slice(1));
      if (target) { event.preventDefault(); target.setAttribute('tabindex', '-1'); target.focus(); }
      return;
    }
    const mapped = raw === '/learn/shifts' ? '/shifts' : scenarioLink(raw, item);
    if (!mapped) return;
    const to = mapped === '/shifts' ? '/learn/shifts' : learningDestination(mapped, item.id);
    if (!to) return;
    event.preventDefault(); event.stopPropagation(); navigate(to);
  }
  return <div ref={root} className="shift-scenario-scroll" onClickCapture={capture}>
    <div className="shift-scene-bar"><AppLink to="/learn/shifts" navigate={navigate}>&#8592; Shift Library</AppLink><button onClick={() => setReview(true)}>Sources & review</button></div>
    <Scene embedded={item.id === 'which-patient-first'} released={item.id === 'transfer-not-ready'} nextStep={['drowsy-patient', 'monitor-alarm', 'discharge-puzzle', 'which-patient-first'].includes(item.id) ? <NextStep item={item} navigate={navigate} /> : null} debrief={active && rewindAssignments[item.id] ? <><DebriefNavigation />{StandaloneRewind && <Suspense fallback={<p role="status">Opening optional practice...</p>}><StandaloneRewind id={rewindAssignments[item.id]} navigate={navigate} /></Suspense>}</> : null} />
    {review && <ReviewDialog item={item} close={() => setReview(false)} />}
  </div>;
}

export default function ShiftExperience({ mode = 'page', navigate, active = true }) {
  const path = window.location.pathname;
  const route = shiftRoute(path);
  const from = getShift(returningShift(window.location.search));
  const [visited, setVisited] = useState([]);
  const region = useRef(null);
  if (mode === 'page' && route?.kind === 'scenario' && !visited.includes(route.id)) setVisited([...visited, route.id]);
  useEffect(() => { if (region.current) region.current.scrollTop = 0; }, [path]);
  useEffect(() => {
    if (active && mode === 'page' && route?.kind === 'scenario') {
      const item = getShift(route.id);
      if (item && item.analytics !== false) shiftOpened(item.id, item.contentVersion, item.readProgress().stage);
    }
  }, [active, mode, path, route?.id, route?.kind]);
  if (mode === 'return') return from ? <aside className="shift-return"><AppLink to={shiftPath(from.id)} navigate={navigate}>&#8592; Return to {from.title}</AppLink><span>Your place is kept</span></aside> : null;
  let content;
  if (route?.kind === 'library') content = <Library navigate={navigate} progressView={new URLSearchParams(window.location.search).has('saved') ? 'unfinished' : new URLSearchParams(window.location.search).has('debriefs') ? 'debriefs' : 'all'} />;
  else if (route?.kind === 'handoff') content = <Handoff key={`${route.id}-${window.location.search}`} item={getShift(route.id)} navigate={navigate} />;
  return <div ref={region} className={`ce-shift-feature${active && route?.kind === 'library' ? ' ce-shift-feature--library' : ''}`} hidden={!active} inert={!active}>
    {visited.map(id => {
      const visible = active && route?.kind === 'scenario' && route.id === id;
      return <div key={id} hidden={!visible} inert={!visible} data-active-page={visible}><Scenario item={getShift(id)} navigate={navigate} active={visible && active} /></div>;
    })}
    {active && content}
  </div>;
}
