import { useEffect, useRef, useState } from 'react';
import { ClinicalEdgeMark } from '../../components/ModuleHeader.jsx';
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
import './app.css';

const renderers = { 'drowsy-patient': Shift, 'monitor-alarm': Monitor, 'discharge-puzzle': Discharge, 'which-patient-first': Shift5 };
if (CONVERSATION_ENABLED) renderers.conversation = Conversation;
const images = {
  'drowsy-patient': new URL('./assignment-poster.svg', import.meta.url).href,
  'discharge-puzzle': new URL('./discharge/poster.svg', import.meta.url).href,
  'which-patient-first': new URL('./shift5/poster.svg', import.meta.url).href,
  ...(CONVERSATION_ENABLED ? { conversation: new URL('./conversation/room.svg', import.meta.url).href } : {}),
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
    <h3>Teaching sources & applicability</h3><p>Passage-level source verification is not documented. A reference does not certify the scenario.</p>
    <ol>{item.sources.map(source => <li key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a><p>{source.scope}</p><p><strong>Limitation: </strong>{source.limitation}</p></li>)}</ol>
    {item.id === 'monitor-alarm' && <p>All five ECGs are original educational illustrations, not patient recordings. Approval of the complete scenario package is founder-reported; no separate ECG validation is claimed.</p>}
  </dialog>;
}

function Library({ navigate }) {
  return <div className="shift-library-page">
    <header className="shift-library-brand"><AppLink to="/" navigate={navigate}><ClinicalEdgeMark /><strong>Clinical Edge</strong></AppLink><span>Learn</span></header>
    <main className="shift-library-main">
      <header className="shift-library-heading"><p className="shift-overline">Fictional nursing experiences</p><h1>The Shift Library</h1><p>Experience the shift. Understand the why. Master the skills.</p><small>Fictional education / Progress stays on this device</small></header>
      <div className="shift-library-grid">{SHIFTS.map(item => {
        const progress = progressLabel(item);
        return <article className="shift-library-card" key={item.id}>
          <AppLink to={shiftPath(item.id)} navigate={navigate} className="shift-library-image" tabIndex={-1} aria-hidden="true">{item.id === 'monitor-alarm' ? <LibraryMonitorArtwork /> : <img src={images[item.id]} alt="" />}<span>SHIFT {item.number}</span></AppLink>
          <div className="shift-library-copy"><p className="shift-overline">{item.specialty} / {item.difficulty}</p><h2><AppLink to={shiftPath(item.id)} navigate={navigate}>{item.title}</AppLink></h2><p>{item.description}</p><small>{item.duration} / Students & new grads</small><AppLink to={shiftPath(item.id)} navigate={navigate} className="shift-primary">{progress === 'Not started' ? 'Begin shift' : progress === 'Debrief reached' ? 'Return to debrief' : 'Continue shift'} <span aria-hidden="true">&#8594;</span></AppLink><small>{progress}</small></div>
        </article>;
      })}</div>
      <p className="shift-local-note">Progress and fixed-choice reflections stay on this device. No patient information, AI calls or account. Restart a scenario to clear its progress.</p>
      <section className="shift-library-tools"><h2>Build on what you notice</h2><div>{LEARN_ACTIONS.filter(action => action.path !== '/rhythm-lab').map(action => <AppLink key={action.path} to={action.path} navigate={navigate}><strong>{action.label}</strong><span>{action.detail}</span><b aria-hidden="true">&#8599;</b></AppLink>)}<AppLink to="/reference-hub" navigate={navigate}><strong>References</strong><span>Existing clinical reference hub</span><b aria-hidden="true">&#8599;</b></AppLink><AppLink to="/icu-drips" navigate={navigate}><strong>ICU Drips</strong><span>Infusion reference</span><b aria-hidden="true">&#8599;</b></AppLink></div></section>
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

function Scenario({ item, navigate }) {
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
    const mapped = scenarioLink(raw, item);
    if (!mapped) return;
    const to = mapped === '/shifts' ? '/learn/shifts' : learningDestination(mapped, item.id);
    if (!to) return;
    event.preventDefault(); event.stopPropagation(); navigate(to);
  }
  return <div ref={root} className="shift-scenario-scroll" onClickCapture={capture}>
    <div className="shift-scene-bar"><AppLink to="/learn/shifts" navigate={navigate}>&#8592; Shift Library</AppLink><button onClick={() => setReview(true)}>Sources & review</button></div>
    <Scene embedded={item.id === 'which-patient-first'} />
    {!item.private && item.id !== 'conversation' && <section className="shift-connections"><span className="shift-overline">Connected learning</span><h2>Follow the why.</h2><div>{item.recommendations.map(link => <AppLink key={link.id} to={learningDestination(link.path, item.id)} navigate={navigate}><strong>{link.title}</strong><span>{link.detail}</span><b aria-hidden="true">&#8599;</b></AppLink>)}</div></section>}
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
  if (mode === 'return') return from ? <aside className="shift-return"><AppLink to={shiftPath(from.id)} navigate={navigate}>&#8592; Return to {from.title}</AppLink><span>Your place is kept</span></aside> : null;
  let content;
  if (route?.kind === 'library') content = <Library navigate={navigate} />;
  else if (route?.kind === 'handoff') content = <Handoff key={`${route.id}-${window.location.search}`} item={getShift(route.id)} navigate={navigate} />;
  return <div ref={region} className={`ce-shift-feature${active && route?.kind === 'library' ? ' ce-shift-feature--library' : ''}`} hidden={!active} inert={!active}>
    {visited.map(id => {
      const visible = active && route?.kind === 'scenario' && route.id === id;
      return <div key={id} hidden={!visible} inert={!visible} data-active-page={visible}><Scenario item={getShift(id)} navigate={navigate} /></div>;
    })}
    {active && content}
  </div>;
}
