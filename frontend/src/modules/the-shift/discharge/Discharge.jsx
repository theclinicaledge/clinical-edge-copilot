import { useEffect, useRef, useState } from 'react';
import { scenes, patients, startChoices, documents, actions, teachChoices, fixChoices, script, reflections, reflectionText, sources } from './data.js';
import { read, save, fresh, reviewResults } from './progress.js';
import Reconciliation from './Reconciliation.jsx';
import { concernCount } from './reconciliation.js';
import './discharge.css';

const find = (items, id) => items.find(item => item.id === id);
const toggle = (items, id) => items.includes(id) ? items.filter(item => item !== id) : [...items, id];
function SourceLinks({ ids }) {
  return <details className="discharge-sources"><summary>Teaching sources & limits</summary><ul>{sources.filter(item => ids.includes(item.id)).map(item => <li key={item.id}><a href={item.url} target="_blank" rel="noreferrer">{item.title}</a><p>{item.limitation}</p></li>)}</ul><p>Independent nurse approval of the scenario package is reported by the founder. Passage-level source verification is not documented.</p></details>;
}
function Feedback({ item }) {
  if (!item) return null;
  return <div className={`discharge-feedback ${['Correct', 'Good', 'Required'].includes(item.result) ? 'is-recognized' : ''}`} role="status">
    <strong>{item.result}</strong>
    {item.consequence && <span className="shift-overline">What could happen / fictional consequence</span>}
    <p>{item.feedback}</p>
  </div>;
}
function Choices({ choices, selected, onSelect, label }) {
  return <div className="discharge-choices" role="group" aria-label={label}>{choices.map((item, index) => <button key={item.id} className={selected === item.id ? 'is-selected' : ''} aria-pressed={selected === item.id} disabled={!!selected} onClick={() => onSelect(item.id)}><span className="discharge-choice-number" aria-hidden="true">{String.fromCharCode(65 + index)}</span><span>{item.text}</span>{selected === item.id && <span className="discharge-chosen">Your choice</span>}</button>)}</div>;
}
function Bottle({ id, inspected, inspect }) {
  const home = id === 'lasix';
  return <button className={`discharge-bottle ${inspected ? 'is-inspected' : ''}`} onClick={inspect} aria-pressed={inspected} aria-label={`Inspect ${home ? 'Lasix' : 'furosemide'} bottle`}>
    <span className="discharge-bottle-origin">{home ? 'From home' : 'New prescription'}</span>
    <span className="discharge-bottle-art" aria-hidden="true"><span className="discharge-bottle-cap" /><span className="discharge-bottle-body"><span className="discharge-bottle-label"><span>FICTIONAL LABEL</span><strong>{home ? 'Lasix' : 'furosemide'}</strong><span>Water pill</span><span className="discharge-label-rule" /><small>{home ? 'Home bottle' : 'New pharmacy bottle'}</small></span></span></span>
    <span className="discharge-inspect-label">{inspected ? 'Label examined' : 'Examine label'} <span aria-hidden="true">{inspected ? '✓' : '+'}</span></span>
  </button>;
}
function RestartDialog({ onClose, onRestart }) {
  const ref = useRef(null);
  useEffect(() => { const el = ref.current, previous = document.activeElement; el.showModal(); return () => { el.close(); previous?.isConnected && previous.focus(); }; }, []);
  return <dialog ref={ref} className="shift-dialog discharge-dialog" aria-labelledby="restart-discharge" onCancel={onClose}><h2 id="restart-discharge">Restart The Discharge Puzzle?</h2><p>This resets only Scenario 3. The other two shifts keep their progress.</p><div className="shift-dialog-actions"><button className="shift-secondary" onClick={onClose}>Keep my place</button><button className="shift-primary" onClick={onRestart}>Restart</button></div></dialog>;
}
export default function Discharge() {
  const [state, setState] = useState(read);
  const [storageFailed, setStorageFailed] = useState(false);
  const [restartOpen, setRestartOpen] = useState(false);
  const heading = useRef(null), stageBefore = useRef(state.stage);
  const update = changes => { const nextState = { ...state, ...changes }; setStorageFailed(!save(nextState)); setState(nextState); };
  const answer = (key, value) => { if (state.answers[key] === undefined) update({ answers: { ...state.answers, [key]: value } }); };
  const next = () => update({ stage: state.stage + 1 });
  useEffect(() => {
    if (stageBefore.current === state.stage) return;
    stageBefore.current = state.stage;
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [state.stage]);
  const { answers } = state;
  const recognized = reviewResults(answers);
  const selectedActions = answers.actions || state.actionDraft;
  const titles = ['The Discharge Puzzle', 'Where do you start?', 'Compare the documents', 'Your first 2 actions', 'Check the person.', 'Fix the misunderstanding', 'Afternoon challenge complete'];
  const proceed = (label, disabled = false) => <button className="shift-primary discharge-continue" disabled={disabled} onClick={next}>{label}<span aria-hidden="true">→</span></button>;
  return <div className="discharge-root">
    <header className="discharge-masthead"><div><span className="shift-overline">The Shift / 03 / Med-Surg</span><strong>The Discharge Puzzle</strong></div><div className="discharge-time"><time>{scenes[state.stage][0]}</time><span>Fictional shift</span></div><button className="discharge-reset" onClick={() => setRestartOpen(true)} aria-label="Restart Scenario 3" title="Restart Scenario 3">↻</button></header>
    <nav className="discharge-progress" aria-label="Shift progress"><ol>{scenes.map(([, name], index) => <li key={name} aria-current={index === state.stage ? 'step' : undefined} className={index < state.stage ? 'is-done' : ''}><span />{name}</li>)}</ol><p>Scene {state.stage + 1} of 7 · {scenes[state.stage][1]}</p></nav>
    <main className={`discharge-main ${state.stage === 2 ? 'discharge-wide' : ''}`}>
      <header className="discharge-scene-title"><p className="shift-overline">{state.stage === 0 ? 'Two patients / Five decisions / 5 to 6 minutes' : state.stage === 6 ? 'Your first decisions, reflected back' : `Decision ${state.stage} of 5 / ${scenes[state.stage][1]}`}</p><h1 ref={heading} tabIndex={-1}>{titles[state.stage]}</h1></header>
      {state.stage === 0 && <>
        <p className="discharge-lead">Reconcile the documents, then confirm the patient&apos;s understanding with teach-back; either step alone can miss a dangerous error.</p>
        <section className="discharge-assignment" aria-label="Fictional patient assignment">{patients.map(patient => <article key={patient.room}><header><span className="discharge-room">ROOM <strong>{patient.room}</strong></span><div><span className="shift-overline">Report status</span><strong>{patient.status}</strong></div></header><p>{patient.setting}</p><blockquote>{patient.report}</blockquote></article>)}</section>
        <aside className="discharge-notification"><span className="discharge-message-icon" aria-hidden="true">!</span><div><span className="shift-overline">1300 / Charge nurse</span><p>“{script.charge}”</p></div></aside>
        <p className="discharge-review-note">All patients and documents are fictional. Independent nurse approval of the scenario package is reported by the founder. No competency score.</p>
        {proceed('Begin the afternoon')}
      </>}
      {state.stage === 1 && <>
        <aside className="discharge-pressure"><span>ROOM 31</span><p>“{script.charge}”</p><small>Charge nurse / 1300</small></aside>
        <Choices choices={startChoices} selected={answers.start} onSelect={id => answer('start', id)} label="Where do you start?" />
        <Feedback item={find(startChoices, answers.start)} />
        {answers.start && <><SourceLinks ids={['reconciliation', 'match']} />{proceed('Open the discharge papers')}</>}
      </>}
      {state.stage === 2 && <Reconciliation
        flags={answers.flags || state.flags} submitted={answers.flags !== undefined}
        onFlag={flags => update({ flags })} onSubmit={flags => answer('flags', flags)}
        onNote={() => { if (!state.noteOpened) update({ noteOpened: true }); }}
        sources={<SourceLinks ids={['reconciliation', 'discrepancies']} />}
        noteSources={<SourceLinks ids={['anticoagulants']} />}
        continueAction={proceed('Coordinate the next steps')}
      />}
      {state.stage === 3 && <>
        <p className="discharge-lead">Choose your first two actions.</p>
        <div className="discharge-choices" role="group" aria-label="First two actions">{actions.map(item => <button key={item.id} aria-pressed={selectedActions.includes(item.id)} disabled={!!answers.actions || (selectedActions.length === 2 && !selectedActions.includes(item.id))} onClick={() => update({ actionDraft: toggle(state.actionDraft, item.id) })} className={selectedActions.includes(item.id) ? 'is-selected' : ''}><span className="discharge-choice-number" aria-hidden="true">{selectedActions.includes(item.id) ? selectedActions.indexOf(item.id) + 1 : '+'}</span><span>{item.text}</span></button>)}</div>
        {!answers.actions ? <div className="discharge-submit-row"><span>{state.actionDraft.length} of 2 selected</span><button className="shift-primary" disabled={state.actionDraft.length !== 2} onClick={() => answer('actions', [...state.actionDraft])}>Confirm actions <span aria-hidden="true">→</span></button></div> : <>
          {answers.actions.map(id => <Feedback key={id} item={find(actions, id)} />)}
          {!answers.actions.includes('provider') && <Feedback item={actions[0]} />}
          <SourceLinks ids={['reconciliation', 'match', 'anticoagulants']} />
          <section className="discharge-resolution"><span className="shift-overline">1335 / The story continues</span><h2>The provider calls back.</h2><blockquote>“{script.provider}”</blockquote><p>{script.planLimit}</p><p><strong>Charge nurse:</strong> “{script.chargeReply}”</p><span className="discharge-paper-status">Corrected copy printing · GI appointment booked</span></section>
          {proceed('Meet the patient and his daughter')}
        </>}
      </>}
      {state.stage === 4 && <>
        <p className="discharge-lead">His daughter arrives with a bag of his home pill bottles.</p>
        <h2 className="discharge-prompt">Which question best checks what he&apos;ll actually do at home?</h2>
        <Choices choices={teachChoices} selected={answers.teach} onSelect={id => answer('teach', id)} label="Teach-back question" />
        <Feedback item={find(teachChoices, answers.teach)} />
        {answers.teach && <><SourceLinks ids={['teachback']} /><section className="discharge-dialogue"><span className="shift-overline">1342 / He lines up two bottles</span><blockquote>“{script.patient}”</blockquote><p><strong>His daughter:</strong> “{script.daughter}”</p></section>{proceed('Look at the bottles')}</>}
      </>}
      {state.stage === 5 && <>
        <div className="discharge-bottle-context"><p>“{script.patient}”</p><span>“{script.daughter}”</span></div>
        <div className="discharge-bottles" role="group" aria-label="Two fictional medication bottles">{['lasix', 'furosemide'].map(id => <Bottle key={id} id={id} inspected={state.inspected.includes(id)} inspect={() => update({ inspected: [...new Set([...state.inspected, id])] })} />)}</div>
        {state.inspected.length > 0 && <div className="discharge-label-discovery" role="status"><span className="shift-overline">From the discharge list</span><p>{documents[1].lines[0][1]}</p>{state.inspected.length === 2 && <><div className="discharge-name-connection"><strong>Lasix</strong><span aria-hidden="true">=</span><strong>furosemide</strong></div><p>{script.names}</p></>}</div>}
        <p className="discharge-review-note">Original fictional bottle illustrations. No doses or patient information.</p>
        {state.inspected.length === 2 && <><h2 className="discharge-prompt">What do you do?</h2><Choices choices={fixChoices} selected={answers.fix} onSelect={id => answer('fix', id)} label="Fix the misunderstanding" /><Feedback item={find(fixChoices, answers.fix)} /></>}
        {answers.fix && <><SourceLinks ids={['teachback', 'discrepancies', 'furosemide']} /><section className="discharge-dialogue"><span className="shift-overline">{answers.fix === 'confirm' ? 'Re-check / Show me again' : 'Guided re-check / After the misunderstanding is corrected'}</span><p>{script.recheck}</p></section>{proceed('Finish the afternoon')}</>}
      </>}
      {state.stage === 6 && <>
        <section className="discharge-personal-review"><h2>Your shift review</h2><ol>{reflections.map(([title], index) => <li key={title}><span className={`discharge-reflection-mark ${recognized[index] ? 'is-recognized' : ''}`} aria-label={recognized[index] ? 'Recognized' : 'Revisit'}>{recognized[index] ? '✓' : '↻'}</span><div><span className="shift-overline">{title}</span><p>{reflectionText(index, answers, recognized[index])}</p>
          {index !== 1 && <details><summary>Your first choice{index === 2 ? 's' : ''}</summary>{index === 2 ? answers.actions.map(id => <p key={id}>{find(actions, id).text}</p>) : <p>{find(index === 0 ? startChoices : index === 3 ? teachChoices : fixChoices, index === 0 ? answers.start : index === 3 ? answers.teach : answers.fix).text}</p>}</details>}
          {index === 1 && <small>{concernCount(answers.flags)} concerns flagged. {state.noteOpened ? 'You opened the Day 2 note.' : 'The Day 2 note was available for investigation.'}</small>}
        </div></li>)}</ol><p className="discharge-review-note">Learning reflection, not a competency assessment. Scenario-package approval is reported by the founder; no separate medication-safety certification is claimed.</p></section>
        <section className="discharge-takeaways" aria-label="Two takeaways">{script.takeaways.map((text, i) => <div key={text}><span>0{i + 1}</span><p>{text}</p></div>)}</section>
        <section className="discharge-debrief"><h2>How the afternoon unfolded</h2><ol className="shift-timeline">{script.outcome.map(([time, text]) => <li key={time}><time>{time}</time><p>{text}</p></li>)}</ol><h2>Why it happens</h2><ul>{script.why.map(text => <li key={text}>{text}</li>)}</ul><SourceLinks ids={['reconciliation', 'discrepancies', 'teachback']} /></section>
        <section className="discharge-next"><h2>Follow the why.</h2><a href="/ask"><span className="shift-overline">Ask why</span><strong>{script.ask}</strong><span aria-hidden="true">↗</span></a><a href="/ask?topic=names"><span className="shift-overline">Ask about names</span><strong>{script.askNames}</strong><span aria-hidden="true">↗</span></a><p className="discharge-review-note">Prepare the question in the handoff. Nothing is submitted. Existing Ask consent and daily limits apply when you choose to submit.</p></section>
        <section className="shift-tomorrow"><h2>Want another shift tomorrow?</h2><div role="group" aria-label="Want another shift tomorrow?">{['Yes', 'Maybe', 'No'].map(item => <button key={item} aria-pressed={state.tomorrow === item} onClick={() => update({ tomorrow: item })}>{item}</button>)}</div><p className="discharge-review-note">Saved only on this device. Not submitted.</p></section>
        <div className="discharge-end"><button className="shift-secondary" onClick={() => setRestartOpen(true)}>Play again <span aria-hidden="true">↻</span></button><a className="shift-secondary" href="/prototypes/the-shift/scenarios.html">Choose another shift <span aria-hidden="true">→</span></a><details><summary>Share card preview</summary><p>{script.share}</p><small>Preview only. Nothing is shared automatically.</small></details></div>
      </>}
      <footer className="discharge-footer"><span>{storageFailed ? 'Device storage unavailable. Progress lasts only in this tab.' : 'Progress saved only on this device.'}</span><p>Fictional education. No clinical approval or competency score. Treatment decisions belong to the provider and facility protocol.</p></footer>
    </main>
    {restartOpen && <RestartDialog onClose={() => setRestartOpen(false)} onRestart={() => { const clean = fresh(); update(clean); setRestartOpen(false); }} />}
  </div>;
}
