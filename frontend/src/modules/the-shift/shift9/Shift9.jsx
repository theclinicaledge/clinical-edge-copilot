import { useEffect, useRef, useState } from 'react';
import { ClinicalEdgeMark } from '../../../components/ModuleHeader.jsx';
import '../../../styles/tokens.css';
import '../shift.css';
import '../shift6/shift6.css';
import './shift9.css';
import StripFigure from '../components/StripFigure.jsx';
import EcgViewer, { CompareStrips } from '../components/EcgViewer.jsx';
import AssignTeam from '../components/AssignTeam.jsx';
import TherapeuticResponse from '../components/TherapeuticResponse.jsx';
import { SOURCES, STRIPS, VERSION, TOKENS, TARGETS, team, assignment, d1, d2, d3, d4, d5, debrief, card } from './data.js';
import { STORAGE_KEY, FINAL_STAGE, stages, freshProgress, readProgress } from './progress.js';
import { credit, d2Choice, d3Choice, d4Choice, d5Choice, evaluateAssignment, decisionResults, validPlacement, reviewLine, guidedAfter, anyGuided } from './rules.js';
import Shift9Rewind from './Shift9Rewind.jsx';

const Arrow = () => <span aria-hidden="true">&#8594;</span>;
const Check = () => <span aria-hidden="true">&#10003;</span>;
const markFor = result => credit(result) === 'full' ? '✓' : credit(result) === 'partial' ? '◐' : '!';
const toneFor = result => credit(result) === 'full' ? 'is-correct' : credit(result) === 'partial' ? 'is-partial' : 'is-reflection';

// Until its decision is answered, a strip reads its objective description (`altBefore`), not the interpretation.
// The 12-lead opens in the phone viewer: the full tracing plus limb-lead and chest-lead views of the same recording.
function Strip({ id, answered = true, children }) {
  const strip = STRIPS[id];
  const altFor = item => answered ? item.alt : item.altBefore ?? item.alt;
  if (strip.twelveLead) {
    const views = [{ id: 'all', label: '12-lead', src: strip.src, width: strip.width, height: strip.height, caption: strip.caption, alt: altFor(strip) },
      ...strip.views.map(view => ({ ...view, alt: altFor(view) }))];
    return <EcgViewer views={views} caption={strip.caption} hint={d3.viewerHint} />;
  }
  return <StripFigure src={strip.src} alt={altFor(strip)} caption={strip.caption} width={strip.width} height={strip.height}>{children}</StripFigure>;
}

// Shift 06 pattern: after a choice that earns no credit, say how the story continues so the next scene fits.
const Bridge = ({ text }) => <p className="s6-bridge"><strong>Guided safer path.</strong> {text}</p>;

// Sources carry the spec's note on what each one supports in this decision.
function References({ items }) {
  return <details className="shift-sources"><summary>Sources <span>{items.length}</span></summary>
    <p>Review status: {card.reviewStatus}.</p>
    <ul>{items.map(([number, note], index) => <li key={`${number}-${index}`}><a href={SOURCES[number].url} target="_blank" rel="noreferrer">{SOURCES[number].citation}</a><p>Source {number}: {note}.</p></li>)}</ul>
  </details>;
}

// `bare` drops the "Partially correct" note, for D1 rule rows where the feedback heading already carries it.
function Result({ result, bare = false }) {
  return <span className={`s6-result ${toneFor(result)}`}>{result}{!bare && credit(result) === 'partial' && <small>Partially correct</small>}</span>;
}

function Feedback({ result, feedback, corrections = [], children, onContinue, nextLabel, sources = [] }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus({ preventScroll: true }); ref.current?.scrollIntoView({ block: 'nearest' }); }, []);
  return <section ref={ref} tabIndex={-1} className={`shift-feedback ${toneFor(result)}`} aria-label="Decision feedback">
    <div className="shift-feedback-heading"><span className="shift-feedback-mark" aria-hidden="true">{markFor(result)}</span><h3>{result}</h3>{credit(result) === 'partial' && <span className="s6-partial-note">Partially correct</span>}</div>
    {feedback && <p>{feedback}</p>}
    {corrections.map(choice => <div className="shift-correction" key={choice.id}><strong>{choice.text}</strong><p>{choice.feedback}</p></div>)}
    {children}
    {sources.length > 0 && <References items={sources} />}
    <button className="shift-primary" onClick={onContinue}>{nextLabel}<Arrow /></button>
  </section>;
}

const answeredClass = item => credit(item.result) === 'full' ? '' : 's9-selected-miss';
function Choices({ items, answer, selected, onChoose, label }) {
  return <div className="shift-choices" role="group" aria-label={label}>{items.map(item =>
    <button key={item.id} aria-pressed={(answer ?? selected) === item.id} className={`shift-choice ${(answer ?? selected) === item.id ? 'is-selected' : ''} ${answer === item.id ? answeredClass(item) : ''}`} disabled={answer !== undefined} onClick={() => onChoose(item.id)}>
      <span>{item.text}</span><span className="shift-choice-end" aria-hidden="true">{(answer ?? selected) === item.id ? '✓' : '→'}</span>
    </button>
  )}</div>;
}

function Panel({ heading, children }) {
  return <div className="s6-while-help s9-panel"><span className="shift-overline">{heading} (unscored)</span>{children}</div>;
}

// Supporting detail behind a labeled toggle, so the key point stays visible and the page stays short.
function More({ label, children }) {
  return <details className="s9-more"><summary>{label}</summary>{children}</details>;
}

function RoomNumber({ id }) { return <span className="shift-room-number"><small>ROOM</small><strong>{id}</strong></span>; }

function ReportCards({ progress, update }) {
  const toggle = (key, room) => update({ [key]: progress[key].includes(room) ? progress[key].filter(id => id !== room) : [...progress[key], room] });
  return <div className="shift-reports">{assignment.patients.map(patient => {
    const opened = progress.viewed.includes(patient.room);
    const notes = progress.notes.includes(patient.room);
    return <article className={`shift-report ${opened ? 'is-read' : ''}`} key={patient.room}>
      <button className="shift-report-toggle" aria-expanded={opened} aria-controls={`s9-report-${patient.room}`} onClick={() => toggle('viewed', patient.room)}>
        <RoomNumber id={patient.room} /><span><strong>{patient.name}</strong></span><span aria-hidden="true">{opened ? '−' : '+'}</span>
      </button>
      {opened && <div id={`s9-report-${patient.room}`} className="shift-report-copy"><p>{patient.summary}</p><span className="shift-overline">Report from the off-going nurse</span><p>{patient.report}</p><span className="shift-overline">Starting vitals and strip (1430)</span><p>{patient.vitals}</p>
        <Strip id={patient.strip} />
        <button className="shift-text-button s9-notes-toggle" aria-expanded={notes} aria-controls={`s9-notes-${patient.room}`} onClick={() => toggle('notes', patient.room)}>Rhythm notes <span aria-hidden="true">{notes ? '−' : '+'}</span></button>
        {notes && <p id={`s9-notes-${patient.room}`} className="s9-notes">{assignment.rhythmNotes}</p>}
      </div>}
    </article>;
  })}</div>;
}

export default function Shift9() {
  const [progress, setProgress] = useState(readProgress);
  const [storageFailed, setStorageFailed] = useState(false);
  const [room, setRoom] = useState(null);
  const [restartOpen, setRestartOpen] = useState(false);
  const [copied, setCopied] = useState('');
  const dialog = useRef(null);
  const heading = useRef(null);
  const firstRender = useRef(true);
  const stage = stages[progress.stage];
  const update = patch => setProgress(previous => ({ ...previous, ...patch }));
  const choose = (key, value) => setProgress(previous => previous.answers[key] === undefined ? { ...previous, answers: { ...previous.answers, [key]: value } } : previous);
  const select = (key, value) => setProgress(previous => previous.answers[key] === undefined ? { ...previous, drafts: { ...previous.drafts, [key]: value } } : previous);
  const confirm = key => answers[key] === undefined && <div className="shift-cue-confirm"><p role="status">{progress.drafts[key] ? 'Selection saved. Confirm when ready.' : 'Choose one response, then confirm.'}</p><button className="shift-primary" disabled={!progress.drafts[key]} onClick={() => choose(key, progress.drafts[key])}>Confirm response<Arrow /></button></div>;
  const next = () => setProgress(previous => ({ ...previous, stage: Math.min(FINAL_STAGE, previous.stage + 1) }));
  const selectedPatient = assignment.patients.find(patient => patient.room === room);
  const { answers } = progress;
  const assigned = answers.d1 ? evaluateAssignment(answers.d1) : null;
  const results = decisionResults(answers);
  const corrections = (items, chosen) => chosen?.result === 'Correct' ? [] : items.filter(item => item.result === 'Correct');
  const placed = TOKENS.filter(token => progress.placement[token.id]).length;

  useEffect(() => {
    let frame;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); }
    catch { frame = requestAnimationFrame(() => setStorageFailed(true)); }
    return () => { if (frame) cancelAnimationFrame(frame); };
  }, [progress]);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [progress.stage]);
  useEffect(() => {
    if ((room || restartOpen) && !dialog.current?.open) dialog.current?.showModal();
  }, [room, restartOpen]);

  function closeDialog() { dialog.current?.close(); setRoom(null); setRestartOpen(false); }
  function restart() { setProgress(freshProgress()); setCopied(''); closeDialog(); }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); setCopied('question'); }
    catch { setCopied('unavailable'); }
  }

  return <div className="shift-app s6-app s9-app">
    <a className="shift-skip" href="#shift-main">Skip to the shift</a>
    <header className="shift-header"><div className="shift-header-inner">
      <a href="/" className="shift-brand" aria-label="Clinical Edge Home"><ClinicalEdgeMark size={27} /><span>Clinical Edge</span></a>
      <span className="shift-private">Fictional scenario / Draft</span>
      <button className="shift-reset" onClick={() => setRestartOpen(true)} aria-label="Restart the shift" title="Restart the shift">&#8634;</button>
    </div></header>
    <div className="shift-masthead"><div><span className="shift-overline">A fictional nursing shift</span><span className="shift-wordmark">The Shift<span>.</span></span></div>
      <div className="shift-clock"><time>{stage.time.slice(0, 2)}:{stage.time.slice(2)}</time><span>TELEMETRY</span></div>
    </div>
    <nav className="shift-progress" aria-label="Scenario progress"><ol>{stages.map((item, index) => <li key={item.label} aria-current={index === progress.stage ? 'step' : undefined} className={index < progress.stage ? 'is-done' : index === progress.stage ? 'is-current' : ''}><span className="shift-progress-bar" /><span className="shift-progress-label">{item.label}</span></li>)}</ol><p>{progress.stage + 1} of {stages.length} <span>{stage.label}</span></p></nav>

    <div className={`shift-layout ${progress.stage < 2 ? 'shift-layout-report' : ''}`}>
      {progress.stage >= 2 && <aside className="shift-assignment"><span className="shift-overline">Your assignment</span><div className="shift-patients">{assignment.patients.map(patient => <button key={patient.room} onClick={() => setRoom(patient.room)} className={`shift-patient-tab ${{ 2: '22', 3: '22', 4: '21', 5: '23' }[progress.stage] === patient.room ? 'is-current' : ''}`} aria-label={`Open Room ${patient.room} report`}><RoomNumber id={patient.room} /><span><strong>{patient.name}</strong><small>Report</small></span></button>)}</div><div className="shift-assignment-note"><span>SHIFT 09 / TELEMETRY</span><strong>{stages[0].title}</strong><p>Fictional patients. No speed scoring.</p></div></aside>}
      <main id="shift-main" className="shift-scene">
        <div className="shift-scene-heading"><span className="shift-overline">{stage.decision ? `Decision ${progress.stage} of ${card.decisionCount}` : progress.stage === FINAL_STAGE ? 'End of shift' : `Shift 09 / ${card.estimatedTime}`}</span><h1 ref={heading} tabIndex={-1}>{stage.title}</h1></div>

        {progress.stage === 0 && <>
          <p className="shift-lead">{assignment.intro}</p>
          <p className="s6-scene-note"><strong>Team on screen:</strong> {team}</p>
          <ReportCards progress={progress} update={update} />
          <div className="shift-scene-actions"><span>3 fictional patients</span><button className="shift-primary" onClick={next}>Start the afternoon <Arrow /></button></div>
        </>}

        {progress.stage === 1 && <>
          <div className="shift-situation s9-board"><span className="shift-overline">Unit board and central monitor / {d1.time}</span><ul>{d1.board.map(([label, text]) => <li key={label}><strong>{label}:</strong> {text}</li>)}</ul></div>
          <div className="s9-d1-strips">{d1.strips.map(id => <div key={id}><div className="s9-strip-heading"><time>{STRIPS[id].time}</time><span>{d1.stripLabels[id]}</span></div>
            {d1.stripNotes[id] && <p className="s9-strip-note">{d1.stripNotes[id]}</p>}
            <Strip id={id} answered={id !== d1.strip || progress.closer || answers.d1 !== undefined}>{id === d1.strip && <div className="s9-look-closer"><button className="shift-secondary" aria-expanded={progress.closer} aria-controls="s9-closer" onClick={() => update({ closer: !progress.closer })}>{progress.closer ? 'Close examination' : 'Look closer'} <span aria-hidden="true">&#8981;</span></button>
              {progress.closer && <p id="s9-closer"><span className="shift-overline">Look closer (unscored)</span>{d1.lookCloser}</p>}</div>}</Strip>
          </div>)}</div>
          <h2 className="s6-prompt" id="s9-d1-prompt">{d1.prompt}</h2>
          <AssignTeam name="s9-d1" tokens={TOKENS} targets={TARGETS} value={answers.d1 ?? progress.placement} disabled={answers.d1 !== undefined}
            onChange={(token, target) => setProgress(previous => previous.answers.d1 ? previous : { ...previous, placement: { ...previous.placement, [token]: target } })} />
          {!answers.d1 && <div className="shift-cue-confirm"><p role="status">{placed === TOKENS.length ? 'Everyone is placed. Submit when ready.' : `${placed} of ${TOKENS.length} placed.`}</p><button className="shift-primary" disabled={!validPlacement(progress.placement)} onClick={() => choose('d1', { ...progress.placement })}>Submit<Arrow /></button></div>}
          {assigned && <Feedback result={assigned.result} onContinue={next} nextLabel="Go to Room 22" sources={d1.sources}>
            <ul className="s9-rules">{assigned.fired.map(rule => <li key={rule.id}><Result result={rule.result} bare /><strong>{rule.text}.</strong> {rule.feedback}</li>)}</ul>
            {!assigned.full && <div className="shift-correction"><strong>Full credit</strong><p>{d1.fullCredit}</p></div>}
            {assigned.guided && <Bridge text={`This placement doesn't earn credit. The scenario continues on ${d1.next.paths[assigned.path]}. Your original placement stays recorded.`} />}
            <blockquote>{d1.teaching}</blockquote>
            <Panel heading={d1.next.heading}>
              <p className="s9-path">{d1.next.paths[assigned.path]}</p>
              <ol className="shift-timeline">{d1.next.rows.map(([time, a, b]) => <li key={time}><time>{time}</time><p>{assigned.path === 'a' ? a : b}</p></li>)}</ol>
              <p>{d1.next.after}</p>
            </Panel>
          </Feedback>}
        </>}

        {progress.stage === 2 && <>
          <p className="shift-lead">{d2.scene}</p>
          <CompareStrips label="Room 22, lead II, 1430 and 1508" strips={d2.strips.map((id, index) => ({ ...STRIPS[id], time: STRIPS[id].time, tag: index === 0 ? 'Then' : 'Now' }))} />
          <ul className="s9-steps" aria-label="Compare 1430 and 1508">{d2.steps.map(([id, name, then, now], index) => {
            const open = progress.steps.includes(id);
            return <li key={id}><button aria-expanded={open} aria-controls={`s9-step-${id}`} onClick={() => update({ steps: open ? progress.steps.filter(step => step !== id) : [...progress.steps, id] })}><span className="s9-step-index" aria-hidden="true">0{index + 1}</span><strong>{name}</strong><span aria-hidden="true">{open ? '−' : '+'}</span></button>
              {open && <dl id={`s9-step-${id}`} className="s9-step-compare"><div><dt>1430</dt><dd>{then}</dd></div><div><dt>1508</dt><dd>{now}</dd></div></dl>}</li>;
          })}</ul>
          <h2 className="s6-prompt">{d2.prompt}</h2>
          <Choices items={d2.choices} answer={answers.d2} selected={progress.drafts.d2} label="Calls" onChoose={id => select('d2', id)} />
          {confirm('d2')}
          {answers.d2 && <Feedback result={d2Choice(answers.d2).result} feedback={d2Choice(answers.d2).feedback} corrections={corrections(d2.choices, d2Choice(answers.d2))} onContinue={next} nextLabel="The 12-lead prints" sources={d2.sources}><blockquote>{d2.teaching}</blockquote>{guidedAfter('d2', answers) && <Bridge text={d2.bridge} />}</Feedback>}
        </>}

        {progress.stage === 3 && <>
          <p className="shift-lead">{d3.scene}</p>
          <Strip id={d3.strip} answered={answers.d3 !== undefined} />
          <h2 className="s6-prompt">{d3.prompt}</h2>
          <Choices items={d3.choices} answer={answers.d3} selected={progress.drafts.d3} label="Readings" onChoose={id => select('d3', id)} />
          {confirm('d3')}
          {answers.d3 && <Feedback result={d3Choice(answers.d3).result} feedback={d3Choice(answers.d3).feedback} corrections={corrections(d3.choices, d3Choice(answers.d3))} onContinue={next} nextLabel="Go to Room 21" sources={d3.sources}>
            <blockquote>{d3.teaching}</blockquote>
            {guidedAfter('d3', answers) && <Bridge text={d3.bridge} />}
            <Panel heading="While the team works"><p>{d3.whileTeamWorks}</p></Panel>
            <Panel heading="Teaching note"><p>{d3.teachingNote}</p></Panel>
          </Feedback>}
        </>}

        {progress.stage === 4 && <>
          <div className="shift-situation"><span className="shift-overline">Room 21 / {d4.time}</span>{d4.scene.map(text => <p key={text}>{text}</p>)}<p className="s9-quote">{d4.quote}</p></div>
          <h2 className="s6-prompt">{d4.prompt}</h2>
          <TherapeuticResponse items={d4.choices} answer={answers.d4} selected={progress.drafts.d4} label="Responses" onChoose={id => select('d4', id)} answeredClass={answeredClass} />
          {confirm('d4')}
          {answers.d4 && <Feedback result={d4Choice(answers.d4).result} feedback={d4Choice(answers.d4).feedback} corrections={corrections(d4.choices, d4Choice(answers.d4))} onContinue={next} nextLabel="Go to Room 23" sources={d4.sources}>
            <blockquote>{d4.teaching}</blockquote>
            {guidedAfter('d4', answers) && <Bridge text={d4.bridge} />}
            <Panel heading={d4.rightAway.heading}><p>{d4.rightAway.intro}</p><More label={d4.rightAway.more}><ul>{d4.rightAway.items.map(text => <li key={text}>{text}</li>)}</ul></More></Panel>
            <Panel heading={d4.capacity.heading}><p>{d4.capacity.intro}</p><More label={d4.capacity.more}><ul>{d4.capacity.items.map(([lead, text]) => <li key={lead}><strong>{lead}</strong> {text}</li>)}</ul></More></Panel>
          </Feedback>}
        </>}

        {progress.stage === 5 && <>
          <div className="shift-situation"><span className="shift-overline">Room 23 / {d5.time}</span><p>{assigned?.marcoAt === '21' ? `${d5.marcoMoved} ${d5.vitalsLead}` : assigned?.marcoAt === '22' ? `${d5.marcoMoved22} ${d5.vitalsLead}` : d5.vitalsLeadAlone} {d5.vitals} {d5.scene}</p></div>
          <Strip id={d5.strip} answered={answers.d5 !== undefined} />
          <h2 className="s6-prompt">{d5.prompt}</h2>
          <Choices items={d5.choices} answer={answers.d5} selected={progress.drafts.d5} label="Calls" onChoose={id => select('d5', id)} />
          {confirm('d5')}
          {answers.d5 && <Feedback result={d5Choice(answers.d5).result} feedback={d5Choice(answers.d5).feedback} corrections={corrections(d5.choices, d5Choice(answers.d5))} onContinue={next} nextLabel="Finish the shift" sources={d5.sources}><blockquote>{d5.teaching}</blockquote>{guidedAfter('d5', answers) && <Bridge text={d5.bridge} />}</Feedback>}
        </>}

        {progress.stage === FINAL_STAGE && <>
          <div className="shift-complete"><span><Check /></span><p>{stages[FINAL_STAGE].title}</p></div>
          {anyGuided(answers) && <p className="s6-bridge"><strong>Scripted outcome after guided corrections.</strong> {debrief.guidedNote}</p>}
          <section className="shift-debrief-section"><h2>How the afternoon unfolded</h2><ol className="shift-timeline">{debrief.outcome.map(events => <li key={events.map(([time]) => time).join('-')}><time>{events[0][0]}</time><p>{events.map(([time, text], index) => <span key={time + index}>{index > 0 && <> <strong>{time}</strong> </>}{text}</span>)}</p></li>)}</ol></section>
          <section className="shift-debrief-section"><span className="shift-overline">Personalized shift review</span><h2>Your shift review</h2><ul className="shift-reflections s6-review">{stages.filter(item => item.decision).map(item => {
            const { result, credit: earned } = results[item.decision];
            const line = reviewLine(item.decision, answers);
            const full = earned === 'full';
            return <li key={item.decision}><span className={`shift-result-mark ${full ? 'is-recognized' : earned === 'partial' ? 's6-is-partial' : ''}`} aria-label={full ? 'Correct' : earned === 'partial' ? 'Partially correct' : 'Revisit'}>{markFor(result)}</span><div><small>{item.label}</small><strong>{line.text}</strong><p><Result result={result} />{line.concept && <span className="s6-concept">Concept to strengthen: {line.concept}</span>}</p></div></li>;
          })}</ul><p className="shift-small">Learning reflection, not a clinical competency score.</p></section>
          <section className="shift-takeaways s6-takeaways" aria-label="Takeaways">{debrief.takeaways.map((text, index) => <div key={text}><span>0{index + 1}</span><p>{text}</p></div>)}</section>
          <section className="shift-debrief-section"><h2>Why it happens</h2><ul className="shift-why">{debrief.why.map(([text, numbers]) => <li key={text}>{text} {numbers.map(number => <a key={number} className="s6-source-ref" href={SOURCES[number].url} target="_blank" rel="noreferrer">[Source {number}]</a>)}</li>)}</ul></section>
          <section className="shift-debrief-section"><h2>Go further</h2><div className="shift-next-tools"><div><span>ASK CLINICAL EDGE</span><strong>Ask why</strong><p>{debrief.ask}</p><div className="shift-ask-links"><button className="shift-text-button" onClick={() => copy(debrief.ask)}>{copied === 'question' ? 'Question copied' : 'Copy question'}</button><a href="/ask" target="_blank" rel="noreferrer">Open Ask <span aria-hidden="true">&#8599;</span></a></div><small>Counts toward the daily Ask limit when submitted. Existing consent applies.</small></div><div><span>PLAY AGAIN</span><strong>Restart this scenario</strong><button className="shift-secondary" onClick={() => setRestartOpen(true)}>Play again <span aria-hidden="true">&#8634;</span></button></div></div>
            <Shift9Rewind /></section>
          <div className="shift-end-actions"><details className="shift-share"><summary>Share card preview</summary><p>{debrief.share}</p><small>Preview only. Nothing is shared automatically.</small></details></div>
          <section className="shift-tomorrow"><h2>{debrief.tomorrow}</h2><div role="group" aria-label={debrief.tomorrow}>{['Yes', 'Maybe', 'No'].map(answer => <button key={answer} aria-pressed={progress.tomorrow === answer} onClick={() => update({ tomorrow: answer })}>{answer}{progress.tomorrow === answer && <Check />}</button>)}</div><p className="shift-small">{progress.tomorrow ? 'Saved on this device only. Not submitted.' : 'Your response stays on this device.'}</p></section>
          <p className="shift-copy-status" role="status">{copied === 'unavailable' ? 'Clipboard unavailable. The question remains visible above.' : copied === 'question' ? 'Question copied. Nothing has been sent to Ask.' : ''}</p>
        </>}

        <footer className="shift-footer"><span>{storageFailed ? 'Device storage unavailable. Progress lasts only in this tab.' : 'Progress saved on this device'}</span><p>Fictional education only. Treatment decisions belong to the provider and facility protocol.</p><small>Review status: {card.reviewStatus} ({card.specialtyReview}). Content review date: {card.contentReviewDate}. Version {VERSION}. ECG images are illustrations for teaching, not patient recordings; clinical review pending.</small></footer>
      </main>
    </div>
    <dialog ref={dialog} className="shift-dialog" onCancel={() => { setRoom(null); setRestartOpen(false); }} aria-labelledby="s9-dialog-title">
      <button className="shift-dialog-close" aria-label="Close dialog" onClick={closeDialog}>&times;</button>
      {restartOpen ? <><span className="shift-overline">New attempt</span><h2 id="s9-dialog-title">Restart this shift?</h2><p>This clears only this scenario's saved progress and choices.</p><div className="shift-dialog-actions"><button className="shift-secondary" onClick={closeDialog}>Keep my place</button><button className="shift-primary" onClick={restart}>Restart <span aria-hidden="true">&#8634;</span></button></div></> : selectedPatient && <><RoomNumber id={selectedPatient.room} /><h2 id="s9-dialog-title">Room {selectedPatient.room} report</h2><p>{selectedPatient.summary}</p><p>{selectedPatient.report}</p><p>{selectedPatient.vitals}</p><button className="shift-secondary" onClick={closeDialog}>Return to the shift <Arrow /></button></>}
    </dialog>
  </div>;
}
