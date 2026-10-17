import { useEffect, useRef, useState } from 'react';
import { CONTENT_VERSION, title, scenes, patients, opening, asking, confidentiality, cues, actions, actionOrder, zones, script, reflections, sources, sourceIds } from './data.js';
import { read, save, fresh, actionReview, reviewResults, reviewText, hasUnsafeActions, usesSaferEnding, readLegacy, legacyActions } from './progress.js';
import room from './room.svg';
import './conversation.css';

const find = (items, id) => items.find(item => item.id === id);
const toggle = (items, id) => items.includes(id) ? items.filter(item => item !== id) : [...items, id];
const legacyZoneTitle = (id, version) => (version === '0.2' ? { first: 'First', together: 'As help arrives', then: 'Then', 'not-now': 'Not now' } : { first: 'Immediate response', together: 'Safety actions & assessment', then: 'Ongoing care & documentation', 'not-now': 'Not now' })[id];
function Bridge({ text }) {
  return <aside className="conversation-guided"><span className="conversation-eyebrow">Guided continuation</span><p>{text}</p></aside>;
}
function SavedPlay({ record }) {
  if (!record) return null;
  const placements = record.answers.actions || record.placements;
  return <details className="conversation-saved-play"><summary>Saved v{record.version} play</summary><p className="conversation-small">Your earlier choices remain unchanged and are not regraded against v0.4. The revised eight-card exercise starts a separate play.</p><p>Last recorded screen: {scenes[record.stage][1]}.</p>{[['Opening', opening, record.answers.opening], ['Direct question', asking, record.answers.asking], ['Confidentiality', confidentiality, record.answers.confidentiality]].map(([label, items, id]) => id && <p key={label}><strong>{label}:</strong> {find(items, id).text}</p>)}<p><strong>{record.answers.cues ? 'Submitted cues' : 'Marked cues, not submitted'}:</strong></p><ul>{(record.answers.cues || record.selected).map(id => <li key={id}>{find(cues, id).text}</li>)}</ul><p><strong>{record.answers.actions ? 'Submitted actions' : 'Placed actions, not submitted'}:</strong></p><ul>{legacyActions().filter(item => placements[item.id]).map(item => <li key={item.id}>{item.text}<br /><strong>Your original group: {legacyZoneTitle(placements[item.id], record.version)}</strong></li>)}</ul>{record.tomorrow && <p>Another shift tomorrow: {record.tomorrow}</p>}</details>;
}
function Sources({ ids, summary = 'Sources & limits' }) {
  return <details className="conversation-sources"><summary>{summary}</summary><ul>{sources.filter(item => ids.includes(item.id)).map(item => <li key={item.id}><a href={item.url} target="_blank" rel="noreferrer">{item.title}</a><p>{item.limitation}</p></li>)}</ul><p>Nurse approval reported by the founder. Reviewer identity, specialty credentials and review date were not supplied.</p></details>;
}
function Support({ id }) {
  return <section id={id} className="conversation-support" aria-label="Support resources"><span className="conversation-eyebrow">Crisis support resources</span><h2>You can step away.</h2><p>{script.support}</p><div><a href="tel:988?oai_link_source=model_response_hotline">Call 988</a><a href="sms:988?oai_link_source=model_response_hotline">Text 988</a></div><small>Support, whether you play or not.<br />United States / Ask Clinical Edge is not a crisis service.</small></section>;
}
function Dialog({ title: dialogTitle, children, close }) {
  const ref = useRef(null);
  useEffect(() => { const el = ref.current, previous = document.activeElement; el.showModal(); return () => { el.close(); if (previous?.isConnected) previous.focus(); }; }, []);
  return <dialog ref={ref} className="conversation-dialog" aria-labelledby="conversation-dialog-title" onCancel={close}><header><h2 id="conversation-dialog-title">{dialogTitle}</h2><button aria-label="Close dialog" onClick={close}>&#215;</button></header>{children}</dialog>;
}
function Bubble({ children, own = false, label }) {
  return <div className={`conversation-bubble${own ? ' conversation-own' : ''}`}><span className="conversation-eyebrow">{label || (own ? 'Your first response' : 'Room 18')}</span><p>{children}</p></div>;
}
function Choices({ items, selected, choose, prompt }) {
  const picked = find(items, selected);
  return <>
    {picked ? <><Bubble own>{picked.text}</Bubble><div className="conversation-feedback" role="status"><span className="conversation-eyebrow">Reflection / {picked.result}</span><p>{picked.feedback}</p></div></> : <fieldset className="conversation-replies"><legend>{prompt}</legend>{items.map(item => <button key={item.id} onClick={() => choose(item.id)}><span>{item.text}</span><span aria-hidden="true">&#8627;</span></button>)}</fieldset>}
  </>;
}
function ActionBoard({ placements, submitted, place, submit, next }) {
  const [selected, setSelected] = useState(null);
  const [placementStatus, setPlacementStatus] = useState('');
  const board = useRef(null), focusCard = useRef(null);
  useEffect(() => {
    if (!focusCard.current) return;
    const target = board.current?.querySelector(`[data-action-id="${focusCard.current}"]`);
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: 'center', behavior: 'instant' });
    focusCard.current = null;
  }, [placements]);
  const count = Object.keys(placements).length;
  const card = item => <button key={item.id} data-action-id={item.id} className="conversation-action" draggable={!submitted} disabled={submitted} onDragStart={event => event.dataTransfer.setData('text/plain', item.id)} onClick={() => setSelected(item.id)} aria-label={`${item.text}. ${placements[item.id] ? 'Move action' : 'Place action'}`}><span>{item.text}</span>{!submitted && <span aria-hidden="true">&#8599;</span>}</button>;
  const move = (id, zone) => {
    if (!submitted && actions.some(item => item.id === id) && zones.some(item => item.id === zone)) {
      focusCard.current = id; place(id, zone);
      setPlacementStatus(`Action placed in ${find(zones, zone).title}.`);
    }
    setSelected(null);
  };
  return <div ref={board}>
    <aside className="conversation-notification"><span aria-hidden="true">&#9633;</span><p>Room 20&apos;s IV pump starts beeping down the hall.</p></aside>
    <p className="conversation-action-guidance">{script.actionGuidance}</p>
    <p className="conversation-placement-status" role="status">{placementStatus}</p>
    {!submitted && <section className="conversation-unplaced"><header><h2>Actions to place</h2><span>{count} of {actions.length} placed</span></header><div>{actionOrder.filter(id => !placements[id]).map(id => card(find(actions, id)))}</div></section>}
    <div className="conversation-zones">{zones.map(zone => <section key={zone.id} data-zone={zone.id} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); move(event.dataTransfer.getData('text/plain'), zone.id); }}><header><h2>{zone.title}</h2>{zone.detail && <p>{zone.detail}</p>}</header><div>{actionOrder.filter(id => placements[id] === zone.id).map(id => card(find(actions, id)))}</div>{!actions.some(item => placements[item.id] === zone.id) && <p className="conversation-empty">No actions placed</p>}</section>)}</div>
    {!submitted ? <button className="shift-primary conversation-proceed" disabled={count !== actions.length} onClick={submit}>Review my actions <span aria-hidden="true">&#8594;</span></button> : <section className="conversation-action-review"><h2>Your placements, considered</h2><p>{script.actionReview}</p>{actionReview(placements).map(item => <article key={item.id} data-review-action={item.id}><span className="conversation-eyebrow">{item.status}</span><h3>{item.text}</h3><p>Your placement: <strong>{find(zones, item.chosen).title}</strong></p><p>{item.feedback}</p>{item.status !== 'Accepted' && <p className="conversation-small">Accepted groups: {item.acceptedGroups.map(id => find(zones, id).title).join('; ')}.</p>}</article>)}<Sources ids={sourceIds.actions} /><button className="shift-primary conversation-proceed" onClick={next}>Continue the conversation <span aria-hidden="true">&#8594;</span></button></section>}
    {selected && <Dialog title="Place this action" close={() => setSelected(null)}><p className="conversation-dialog-action">{find(actions, selected).text}</p><div className="conversation-zone-options">{zones.map(zone => <button key={zone.id} onClick={() => move(selected, zone.id)}><strong>{zone.title}</strong>{zone.detail && <small>{zone.detail}</small>}</button>)}</div></Dialog>}
  </div>;
}
export default function Conversation() {
  const [state, setState] = useState(read);
  const [savedPlay] = useState(readLegacy);
  const [storageFailed, setStorageFailed] = useState(false);
  const [overlay, setOverlay] = useState(null);
  const [skipped, setSkipped] = useState(false);
  const [paused, setPaused] = useState(false);
  const heading = useRef(null), lastScreen = useRef('');
  const update = changes => setState(current => { const next = { ...current, ...changes }; setStorageFailed(!save(next)); return next; });
  const answer = (key, value) => { if (state.answers[key] === undefined) update({ answers: { ...state.answers, [key]: value } }); };
  const next = () => update({ stage: state.stage + 1 });
  const { answers } = state;
  const screen = `${state.notice}-${skipped}-${state.stage}`;
  useEffect(() => { if (lastScreen.current === screen) return; lastScreen.current = screen; heading.current?.focus({ preventScroll: true }); heading.current?.scrollIntoView({ block: 'start', behavior: 'instant' }); }, [screen]);
  useEffect(() => {
    if (!state.notice || skipped || state.stage !== 2 || paused || state.revealed >= cues.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setTimeout(() => setState(current => { const nextState = { ...current, revealed: Math.min(cues.length, current.revealed + 1) }; setStorageFailed(!save(nextState)); return nextState; }), 2500);
    return () => window.clearTimeout(timer);
  }, [state.notice, skipped, state.stage, state.revealed, paused]);
  const proceed = (label, go = next) => <button className="shift-primary conversation-proceed" onClick={go}>{label}<span aria-hidden="true">&#8594;</span></button>;
  const selectedCues = answers.cues || state.selected;
  const titles = [title, 'The first thing you say', "Listen for what's underneath", 'Ask the question', 'What happens now', 'The request', 'Night challenge complete'];
  return <div className="conversation-root">
    <header className="conversation-masthead"><div><span className="conversation-eyebrow">The Shift / 04</span><strong>A conversation on the night shift</strong></div><time>{state.notice && !skipped ? scenes[state.stage][0] : '2100'}</time><button onClick={() => setOverlay('support')}>Support</button></header>
    <div className="conversation-private">Fictional nursing education / v{CONTENT_VERSION}</div>
    <main className={`conversation-main${state.stage === 4 && state.notice && !skipped ? ' conversation-main-wide' : ''}`}>
      {!state.notice || skipped ? <>
        <img className="conversation-room" src={room} alt="Original illustration of a calm hospital room, an abstract patient silhouette and a framed photograph." />
        <p className="conversation-eyebrow">Fictional med-surg shift / 5 to 6 minutes</p><h1 tabIndex={-1} ref={heading}>{title}</h1>
        {skipped ? <><Support /><a href="/prototypes/the-shift/scenarios.html" className="shift-primary conversation-proceed">Return to Shift Library <span aria-hidden="true">&#8594;</span></a></> : <><p className="conversation-notice">{script.notice}</p><div className="conversation-start">{proceed('Continue', () => update({ notice: true }))}<button className="conversation-quiet" onClick={() => setSkipped(true)}>Skip this Shift</button></div><p className="conversation-small">All people and details are fictional. No patient input, AI calls or clinical risk score.</p></>}
      </> : <>
        <nav className="conversation-progress" aria-label="Scenario progress"><ol>{scenes.map(([, label], index) => <li key={label} aria-current={index === state.stage ? 'step' : undefined}><span className={index <= state.stage ? 'is-reached' : ''} /><span className="conversation-sr">{label}</span></li>)}</ol><span>{state.stage + 1} / 7</span></nav>
        <header className="conversation-scene-heading"><p className="conversation-eyebrow">{state.stage === 0 ? 'Your night assignment' : state.stage === 6 ? 'Your first choices, reflected back' : `Decision ${state.stage} / Room 18`}</p><h1 ref={heading} tabIndex={-1}>{titles[state.stage]}</h1></header>
        {state.stage === 0 && <><div className="conversation-assignment">{patients.map(patient => <article key={patient.room}><header><strong>Room {patient.room}</strong><span>{patient.status}</span></header><p>{patient.setting}</p><blockquote>{patient.report}</blockquote></article>)}</div>{proceed('Begin your first check')}</>}
        {state.stage === 1 && <><div className="conversation-bedside"><img src={room} alt="" /><p>{script.bedside}</p></div><Bubble>{script.firstLine}</Bubble><Choices items={opening} selected={answers.opening} choose={id => answer('opening', id)} prompt="What do you say?" />{answers.opening && <><Sources ids={sourceIds.opening} />{proceed('Listen to what he says')}</>}</>}
        {state.stage === 2 && <>
          {answers.opening !== 'presence' && <Bridge text={script.bridges.opening} />}
          <p className="conversation-lead">Which words concern you?</p>
          <div className="conversation-cues" aria-live="polite" aria-relevant="additions">{cues.slice(0, state.revealed).map(item => <div key={item.id}>{item.action && <p className="conversation-stage-direction"><span aria-hidden="true">&#9684;</span> {item.action}</p>}<button aria-pressed={selectedCues.includes(item.id)} disabled={!!answers.cues} onClick={() => update({ selected: toggle(state.selected, item.id) })} className={`conversation-bubble${selectedCues.includes(item.id) ? ' is-marked' : ''}`}><span className="conversation-eyebrow">Room 18 <span>{selectedCues.includes(item.id) ? 'Marked' : '+'}</span></span><span className="conversation-spoken">{item.text}</span></button></div>)}</div>
          {state.revealed < cues.length && <div className="conversation-listen-controls"><span aria-hidden="true">. . .</span><button className="conversation-quiet" onClick={() => setPaused(!paused)}>{paused ? 'Resume' : 'Pause'}</button><button className="conversation-quiet" onClick={() => update({ revealed: cues.length })}>Read all five lines</button></div>}
          {state.revealed === cues.length && !answers.cues && proceed('Reflect on these words', () => answer('cues', [...state.selected]))}
          {answers.cues && <><section className="conversation-cue-review"><h2>Listen to the pattern.</h2><p className="conversation-lead">{script.cueTeaching}</p>{cues.map(item => <article key={item.id}><span className="conversation-eyebrow">{item.tier} / {answers.cues.includes(item.id) ? 'You marked this' : 'Not marked'}</span><p>{item.text}</p><p>{item.feedback}</p></article>)}</section><Sources ids={sourceIds.cues} />{proceed('Keep the conversation open')}</>}
        </>}
        {state.stage === 3 && <><Bubble>{cues[4].text}</Bubble><Choices items={asking} selected={answers.asking} choose={id => answer('asking', id)} prompt="What do you say next?" />{answers.asking && <><Sources ids={sourceIds.asking} />{answers.asking !== 'direct' && <Bridge text={script.bridges.asking} />}<p className="conversation-stage-direction">2126 / A long pause. He looks at the photo.</p><Bubble>{script.reveal}</Bubble>{proceed('Consider your next actions')}</>}</>}
        {state.stage === 4 && <ActionBoard placements={answers.actions || state.placements} submitted={!!answers.actions} place={(id, zone) => update({ placements: { ...state.placements, [id]: zone } })} submit={() => answer('actions', { ...state.placements })} next={next} />}
        {state.stage === 5 && <>{hasUnsafeActions(answers.actions) && <Bridge text={script.bridges.actions} />}<Bubble>{script.request}</Bubble><Choices items={confidentiality} selected={answers.confidentiality} choose={id => answer('confidentiality', id)} prompt="What do you say?" />{answers.confidentiality && <><Sources ids={sourceIds.confidentiality} />{proceed('Reflect on your night')}</>}</>}
        {state.stage === 6 && <>
          {answers.confidentiality !== 'honest' && <Bridge text={script.bridges.confidentiality} />}
          <section className="conversation-outcome"><h2>{usesSaferEnding(answers) ? script.ending.guided : script.ending.direct}</h2>{usesSaferEnding(answers) && <p className="conversation-small">{script.ending.limitation}</p>}<ol>{script.outcome.map(([time, text]) => <li key={time}><time>{time}</time><p>{text}</p></li>)}</ol></section>
          <section className="conversation-reflections" aria-labelledby="conversation-review-title"><h2 id="conversation-review-title">Your personalized shift review</h2><p className="conversation-small">A private learning reflection, not a clinical risk or competency score.</p>{reflections.map(([label], index) => <article key={label}><span className="conversation-eyebrow">{label} / {index === 3 ? hasUnsafeActions(answers.actions) ? 'Unsafe' : reviewResults(answers)[3] ? 'Accepted' : 'Revisit' : reviewResults(answers)[index] ? 'Recognized' : 'Revisit'}</span><p>{reviewText(index, answers)}</p><details><summary>Your original choice{[1, 3].includes(index) ? 's' : ''}</summary>{index === 1 ? <ul>{answers.cues.length ? answers.cues.map(id => <li key={id}>{find(cues, id).text}</li>) : <li>No lines marked.</li>}</ul> : index === 3 ? <ul>{actionReview(answers.actions).map(item => <li key={item.id}>{item.text}<br /><strong>{item.status} / Your group: {find(zones, item.chosen).title}</strong><p>{item.feedback}</p></li>)}</ul> : <>{(() => { const selected = index === 0 ? find(opening, answers.opening) : index === 2 ? find(asking, answers.asking) : find(confidentiality, answers.confidentiality); return <><p>{selected.text}</p><p>{selected.feedback}</p></>; })()}</>}</details></article>)}</section>
          <section className="conversation-takeaways" aria-labelledby="conversation-takeaways-title"><h2 id="conversation-takeaways-title">Key takeaways</h2>{script.takeaways.map((text, i) => <p key={text}><span>0{i + 1}</span>{text}</p>)}</section>
          <section className="conversation-why" aria-labelledby="conversation-why-title"><h2 id="conversation-why-title">Why it matters</h2><ul>{script.why.map(text => <li key={text}>{text}</li>)}</ul><aside className="conversation-guided"><h3>Good to know</h3><p>{script.assessmentNote}</p><a href={find(sources, 'joint').url} target="_blank" rel="noreferrer">NPG.08.01.01 / Source and applicability</a></aside></section>
          <section className="conversation-evidence" aria-labelledby="conversation-evidence-title"><h2 id="conversation-evidence-title">Supporting sources</h2><Sources ids={sources.map(item => item.id)} summary="View references and limitations" /></section>
          <section className="conversation-further" aria-labelledby="conversation-learning-title"><h2 id="conversation-learning-title">Continue learning</h2><a href="/ask"><span>Prepare a question</span><strong>{script.ask}</strong><b aria-hidden="true">&#8599;</b></a><a href="/ask?topic=responses"><span>Explore therapeutic responses</span><strong>{script.practice}</strong><b aria-hidden="true">&#8599;</b></a><p className="conversation-small">These Ask questions have not been tested with the live model. Ask may decline them. The handoff only prepares a question; consent, safety checks and daily limits still apply. Ask is not a crisis service.</p><a href={sources[1].url} target="_blank" rel="noreferrer">Read the NIMH educational resource <span aria-hidden="true">&#8599;</span></a></section>
          <section className="conversation-tomorrow"><h2>Want another shift tomorrow?</h2><div role="group" aria-label="Want another shift tomorrow?">{['Yes', 'Maybe', 'No'].map(value => <button aria-pressed={state.tomorrow === value} key={value} onClick={() => update({ tomorrow: value })}>{value}</button>)}</div><p className="conversation-small">Saved only on this device. Not submitted.</p></section>
          <Support /><div className="conversation-end"><button className="conversation-quiet" onClick={() => setOverlay('restart')}>Play again</button><a href="/prototypes/the-shift/scenarios.html">Shift Library <span aria-hidden="true">&#8594;</span></a><details><summary>Share card preview</summary><p>{script.share}</p><small>Preview only. Nothing is shared automatically.</small></details></div>
        </>}
      </>}
      <SavedPlay record={savedPlay} />
      <footer className="conversation-footer"><p>{storageFailed ? 'Device storage unavailable. Progress lasts only in this tab.' : 'Progress stays on this device. Nothing is sent.'}</p><span>Fictional education / Nurse approval reported by founder</span>{state.notice && <button className="conversation-quiet" onClick={() => setOverlay('restart')} aria-label="Restart Scenario 4">Restart</button>}</footer>
    </main>
    {overlay && <Dialog title={overlay === 'support' ? 'Support resources' : 'Restart Scenario 4?'} close={() => setOverlay(null)}>{overlay === 'support' ? <Support /> : <><p>Only this v0.4 play resets. Earlier saved versions and Scenarios 1, 2 and 3 keep their progress.</p><div className="conversation-start"><button className="shift-primary" onClick={() => { update(fresh()); setSkipped(false); setPaused(false); setOverlay(null); }}>Restart</button><button className="conversation-quiet" onClick={() => setOverlay(null)}>Keep my place</button></div></>}</Dialog>}
  </div>;
}
