import { useEffect, useRef, useState } from 'react';
import { ClinicalEdgeMark } from '../../components/ModuleHeader.jsx';
import '../../styles/tokens.css';
import './shift.css';
import { scenario, stages } from './scenario.js';
import { STORAGE_KEY, freshProgress, readProgress, cueResult } from './progress.js';
import { shiftProgress } from '../../productAnalytics.js';

const Arrow = () => <span aria-hidden="true">&#8594;</span>;
const Check = () => <span aria-hidden="true">&#10003;</span>;

function References({ ids }) {
  const references = scenario.references.filter(item => ids.includes(item.id));
  return <details className="shift-sources"><summary>Script references <span>{references.length}</span></summary>
    <p>Source mappings supplied with the script. {scenario.reviewStatus}.</p>
    <ul>{references.map(item => <li key={item.id}>{item.url ? <a href={item.url} target="_blank" rel="noreferrer">{item.title}</a> : <strong>{item.title}</strong>}<p>{item.scope}</p></li>)}</ul>
  </details>;
}
function Feedback({ choice, correct, children, onContinue, nextLabel, sources = [] }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus({ preventScroll: true }); ref.current?.scrollIntoView({ block: 'nearest' }); }, []);
  const matched = choice.result === 'Correct';
  return <section ref={ref} tabIndex={-1} className={`shift-feedback ${matched ? 'is-correct' : 'is-reflection'}`} aria-label="Decision feedback">
    <div className="shift-feedback-heading"><span className="shift-feedback-mark" aria-hidden="true">{matched ? '\u2713' : '!'}</span><h3>{choice.result}</h3></div>
    <p>{choice.feedback}</p>
    {correct && !matched && <div className="shift-correction"><strong>{correct.text}</strong><p>{correct.feedback}</p></div>}
    {children}
    {sources.length > 0 && <References ids={sources} />}
    <button className="shift-primary" onClick={onContinue}>{nextLabel}<Arrow /></button>
  </section>;
}

function Choices({ items, answer, onChoose, label }) {
  return <div className="shift-choices" aria-label={label}>{items.map(item =>
    <button key={item.id} className={`shift-choice ${answer === item.id ? 'is-selected' : ''}`} disabled={answer !== undefined} onClick={() => onChoose(item.id)}>
      <span>{item.text}</span><span className="shift-choice-end" aria-hidden="true">{answer === item.id ? '\u2713' : '\u2192'}</span>
    </button>
  )}</div>;
}

function RoomNumber({ id }) { return <span className="shift-room-number"><small>ROOM</small><strong>{id}</strong></span>; }

function ReportCards({ progress, update }) {
  return <div className="shift-reports">{scenario.patients.map(patient => {
    const opened = progress.viewed.includes(patient.id);
    return <article className={`shift-report ${opened ? 'is-read' : ''}`} key={patient.id}>
      <button className="shift-report-toggle" aria-expanded={opened} aria-controls={`report-${patient.id}`} onClick={() => update({ viewed: opened ? progress.viewed.filter(id => id !== patient.id) : [...progress.viewed, patient.id] })}>
        <RoomNumber id={patient.id} /><span><small>{patient.age}</small><strong>{patient.label}</strong></span><span aria-hidden="true">{opened ? '\u2212' : '+'}</span>
      </button>
      {opened && <div id={`report-${patient.id}`} className="shift-report-copy"><span className="shift-overline">Night nurse's report</span><p>{patient.report}</p></div>}
    </article>;
  })}</div>;
}

export default function Shift() {
  const [progress, setProgress] = useState(readProgress);
  const [storageFailed, setStorageFailed] = useState(false);
  const [room, setRoom] = useState(null);
  const [restartOpen, setRestartOpen] = useState(false);
  const [sbarTab, setSbarTab] = useState('a');
  const [copied, setCopied] = useState('');
  const dialog = useRef(null);
  const heading = useRef(null);
  const firstRender = useRef(true);
  const stage = stages[progress.stage];
  const update = patch => setProgress(previous => ({ ...previous, ...patch }));
  const choose = (key, value) => setProgress(previous => previous.answers[key] === undefined ? { ...previous, answers: { ...previous.answers, [key]: value } } : previous);
  const next = () => setProgress(previous => ({ ...previous, stage: Math.min(6, previous.stage + 1) }));
  const selectedPatient = scenario.patients.find(patient => patient.id === room);
  const priority = [...scenario.patients, scenario.charts].find(item => item.id === progress.answers.priority);
  const action = scenario.actions.find(item => item.id === progress.answers.action);
  const interpretation = scenario.interpretations.find(item => item.id === progress.answers.abg);
  const sbar = scenario.sbars.find(item => item.id === progress.answers.sbar);
  const visibleSbar = scenario.sbars.find(item => item.id === sbarTab);
  const cuesComplete = Array.isArray(progress.answers.cues);
  const cues = cueResult(progress.answers.cues ?? []);

  useEffect(() => {
    let frame;
    try { const previous = readProgress(); localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); shiftProgress('drowsy-patient', '2.1', previous, progress, 6); }
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
  function restart() { setProgress(freshProgress()); setSbarTab('a'); setCopied(''); closeDialog(); }
  async function copy(text, kind) {
    try { await navigator.clipboard.writeText(text); setCopied(kind); }
    catch { setCopied('unavailable'); }
  }

  return <div className="shift-app">
    <a className="shift-skip" href="#shift-main">Skip to the shift</a>
    <header className="shift-header"><div className="shift-header-inner">
      <a href="/" className="shift-brand" aria-label="Clinical Edge Home"><ClinicalEdgeMark size={27} /><span>Clinical Edge</span></a>
      <span className="shift-private">Fictional scenario</span>
      <button className="shift-reset" onClick={() => setRestartOpen(true)} aria-label="Restart the shift" title="Restart the shift">&#8634;</button>
    </div></header>
    <div className="shift-masthead"><div><span className="shift-overline">A fictional nursing shift</span><span className="shift-wordmark">The Shift<span>.</span></span></div>
      <div className="shift-clock"><time>{stage.time.slice(0, 2)}:{stage.time.slice(2)}</time><span>MED-SURG</span></div>
    </div>
    <nav className="shift-progress" aria-label="Scenario progress"><ol>{stages.map((item, index) => <li key={item.label} aria-current={index === progress.stage ? 'step' : undefined} className={index < progress.stage ? 'is-done' : index === progress.stage ? 'is-current' : ''}><span className="shift-progress-bar" /><span className="shift-progress-label">{item.label}</span></li>)}</ol><p>{progress.stage + 1} of 7 <span>{stage.label}</span></p></nav>

    <div className={`shift-layout ${progress.stage < 2 ? 'shift-layout-report' : ''}`}>
      {progress.stage >= 2 && <aside className="shift-assignment"><span className="shift-overline">Your assignment</span><div className="shift-patients">{scenario.patients.map(patient => <button key={patient.id} onClick={() => setRoom(patient.id)} className={`shift-patient-tab ${patient.id === '12' ? 'is-current' : ''}`} aria-label={`Open Room ${patient.id} report`}><RoomNumber id={patient.id} /><span><strong>{patient.label}</strong><small>{progress.stage === 6 ? (patient.id === '12' ? 'Higher level of care' : patient.id === '14' ? 'Pain reassessed' : 'Teaching complete') : (patient.id === '12' ? (progress.stage >= 4 ? 'Team at bedside' : 'At the bedside') : 'Report')}</small></span></button>)}</div><div className="shift-assignment-note"><span>SCENARIO 01</span><strong>The Drowsy Patient</strong><p>Fictional patients. No speed scoring.</p></div></aside>}
      <main id="shift-main" className="shift-scene">
        <div className="shift-scene-heading"><span className="shift-overline">{stage.decision ? `Decision ${progress.stage} of 5` : progress.stage === 6 ? 'End of shift' : 'Scenario 01 / About 5 minutes'}</span><h1 ref={heading} tabIndex={-1}>{stage.title}</h1></div>

        {progress.stage === 0 && <>
          <p className="shift-lead">{scenario.report}</p>
          <ReportCards progress={progress} update={update} />
          <div className="shift-scene-actions"><span>3 fictional patients<br /><small>One morning. Five decisions.</small></span><button className="shift-primary" onClick={next}>Plan your first assessment <Arrow /></button></div>
        </>}

        {progress.stage === 1 && <>
          <div className="shift-priority-grid">{scenario.patients.map(patient => <article key={patient.id} className={`shift-priority-card ${priority?.id === patient.id ? 'is-selected' : ''}`}><div><RoomNumber id={patient.id} /><span><small>{patient.age}</small><h2>{patient.label}</h2></span></div><p>{patient.report}</p><button className="shift-secondary" disabled={Boolean(priority)} onClick={() => choose('priority', patient.id)}>Assess Room {patient.id} <Arrow /></button></article>)}</div>
          <button className="shift-station" disabled={Boolean(priority)} onClick={() => choose('priority', 'charts')}>{scenario.charts.text}<Arrow /></button>
          {priority && <Feedback choice={priority} correct={priority.id !== '12' ? { text: 'Room 12', feedback: scenario.patients[0].feedback } : null} onContinue={next} nextLabel="Go to Room 12" sources={['judgment']} />}
        </>}

        {progress.stage === 2 && <>
          <p className="shift-lead">{scenario.bedside}</p>
          <div className="shift-assessment-bar"><strong>Bedside observations</strong><span>{progress.revealed.length} / 11 revealed</span></div>
          <div className="shift-cues">{scenario.cues.map(cue => {
            const revealed = progress.revealed.includes(cue.id);
            const selected = progress.selected.includes(cue.id);
            return <article key={cue.id} className={`shift-cue ${selected ? 'is-selected' : ''}`}>
              {!revealed ? <button className="shift-reveal" disabled={cuesComplete} onClick={() => update({ revealed: [...progress.revealed, cue.id] })}><span>{cue.label}</span><span aria-hidden="true">+</span></button> : <><span className="shift-overline">{cue.label}</span><p>{cue.text}</p><label className="shift-cue-select"><input type="checkbox" checked={selected} disabled={cuesComplete} onChange={() => update({ selected: selected ? progress.selected.filter(id => id !== cue.id) : [...progress.selected, cue.id] })} /><span>Important cue</span></label></>}
            </article>;
          })}</div>
          {!cuesComplete && <div className="shift-cue-confirm"><p>{scenario.cuePrompt}</p><button className="shift-primary" disabled={progress.selected.length === 0} onClick={() => choose('cues', [...progress.selected])}>Confirm {progress.selected.length || ''} {progress.selected.length === 1 ? 'cue' : 'cues'}<Arrow /></button></div>}
          {cuesComplete && <Feedback choice={{ result: cues.essential === 2 ? 'Correct' : 'Revisit the essential cues', feedback: scenario.essentialFeedback }} onContinue={next} nextLabel="Decide what to do now">
            <ul className="shift-essential-list">{scenario.cues.filter(cue => cue.tier === 'essential').map(cue => <li key={cue.id}><span>{progress.answers.cues.includes(cue.id) ? 'Recognized' : 'Missed'}</span>{cue.text}</li>)}</ul>
            <p><strong>{cues.supporting} supporting cues recognized.</strong> {scenario.supportingFeedback}</p>
            {progress.answers.cues.includes('glucose') && <p>{scenario.glucoseFeedback} No penalty.</p>}
            <blockquote>{scenario.teaching}</blockquote>
          </Feedback>}
        </>}

        {progress.stage === 3 && <>
          <div className="shift-situation"><span className="shift-overline">Room 12 / At the bedside</span><p>{scenario.cues[0].text}</p><p>{scenario.cues[2].text}</p></div>
          <Choices items={scenario.actions} answer={progress.answers.action} label="Actions" onChoose={id => choose('action', id)} />
          {action && <Feedback choice={action} correct={scenario.actions[0]} onContinue={next} nextLabel={action.id === 'escalate' ? 'Continue with the response team' : 'Continue after the correct escalation'} sources={['rrt', 'bts']} />}
        </>}

        {progress.stage === 4 && <>
          <div className="shift-event"><span aria-hidden="true">&#10003;</span><div><strong>Response team at bedside</strong><p>{scenario.abgArrival}</p></div></div>
          <section className="shift-lab" aria-label="ABG result"><div className="shift-lab-title"><span>ABG resulted</span><small>Collected 0645</small></div><div className="shift-lab-values">{scenario.abg.map(item => <div key={item.label}><span>{item.label}</span><strong>{item.value}</strong><small>{item.unit || 'pH units'}</small><small className="shift-range">Range {item.range}</small></div>)}</div></section>
          <h2>What does this ABG show?</h2>
          <Choices items={scenario.interpretations} answer={progress.answers.abg} label="ABG interpretations" onChoose={id => choose('abg', id)} />
          {interpretation && <Feedback choice={interpretation} correct={scenario.interpretations[0]} onContinue={next} nextLabel="Speak with the provider" sources={['abg', 'acidbase']}><details className="shift-deeper"><summary>Go deeper</summary><p>{scenario.deeper}</p></details><a className="shift-tool-link" href="/abg-lab" target="_blank" rel="noreferrer">Practice this in ABG Lab <span aria-hidden="true">&#8599;</span></a></Feedback>}
        </>}

        {progress.stage === 5 && <>
          <p className="shift-lead">{scenario.sbarPrompt}</p>
          <div className="shift-call-line"><span className="shift-call-dot" /><strong>Provider calling back</strong><span>0718</span></div>
          <div className="shift-sbar-tabs" role="tablist" aria-label="SBAR options">{scenario.sbars.map(item => <button key={item.id} role="tab" id={`sbar-tab-${item.id}`} aria-selected={sbarTab === item.id} aria-controls="sbar-panel" tabIndex={sbarTab === item.id ? 0 : -1} onKeyDown={event => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            const index = scenario.sbars.findIndex(option => option.id === item.id);
            const newIndex = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
            setSbarTab(scenario.sbars[newIndex].id); document.getElementById(`sbar-tab-${scenario.sbars[newIndex].id}`)?.focus();
          }} onClick={() => setSbarTab(item.id)}>SBAR {item.id.toUpperCase()}</button>)}</div>
          <section id="sbar-panel" className="shift-sbar" role="tabpanel" aria-labelledby={`sbar-tab-${sbarTab}`}>
            {visibleSbar.parts ? visibleSbar.parts.map(([letter, text]) => <div className="shift-sbar-part" key={letter}><span>{letter}</span><p>{text}</p></div>) : <p>{visibleSbar.text}</p>}
            <button className="shift-primary" disabled={Boolean(sbar)} onClick={() => choose('sbar', sbarTab)}>Use SBAR {sbarTab.toUpperCase()}<Arrow /></button>
          </section>
          {sbar && <Feedback choice={sbar} correct={sbar.id !== 'a' ? { text: 'SBAR A', feedback: scenario.sbars[0].feedback } : null} onContinue={next} nextLabel="Finish the shift" />}
        </>}

        {progress.stage === 6 && <>
          <div className="shift-complete"><span><Check /></span><p>Shift complete<strong>One morning. A different perspective.</strong></p></div>
          <section className="shift-takeaways" aria-label="Takeaways">{scenario.takeaways.map((text, index) => <div key={text}><span>0{index + 1}</span><p>{text}</p></div>)}</section>
          <section className="shift-debrief-section"><h2>How the morning unfolded</h2><ol className="shift-timeline">{scenario.outcome.map(([time, text]) => <li key={time}><time>{time}</time><p>{text}</p></li>)}</ol></section>
          <section className="shift-debrief-section"><span className="shift-overline">Your first decisions</span><h2>Your shift report</h2><ul className="shift-reflections">{[
            ['Prioritize', progress.answers.priority === '12' ? 'You saw the right patient first.' : `You chose ${progress.answers.priority === 'charts' ? 'chart review' : `Room ${progress.answers.priority}`} first.`, scenario.patients[0].feedback, progress.answers.priority === '12'],
            ['Recognize', cues.essential === 2 ? 'You spotted both essential cues.' : `You spotted ${cues.essential} of 2 essential cues.`, scenario.essentialFeedback, cues.essential === 2],
            ['Act', progress.answers.action === 'escalate' ? 'You called for help without waiting.' : 'Revisit the escalation decision.', action?.feedback, progress.answers.action === 'escalate'],
            ['Interpret', progress.answers.abg === 'partial' ? 'You read the ABG correctly.' : 'Revisit the ABG interpretation.', scenario.interpretations[0].feedback, progress.answers.abg === 'partial'],
            ['Communicate', progress.answers.sbar === 'a' ? 'Your SBAR was clear.' : `You chose SBAR ${progress.answers.sbar?.toUpperCase()}.`, sbar?.feedback, progress.answers.sbar === 'a'],
          ].map(([label, title, feedback, achieved]) => <li key={label}><span className={`shift-result-mark ${achieved ? 'is-recognized' : ''}`} aria-label={achieved ? 'Recognized' : 'Revisit'}>{achieved ? '\u2713' : '\u21BA'}</span><details><summary><small>{label}</small><strong>{title}</strong></summary><p>{feedback}</p></details></li>)}</ul><p className="shift-small">Learning reflection, not a clinical competency score.</p></section>
          <section className="shift-debrief-section"><h2>Why it can happen</h2><ul className="shift-why">{scenario.why.map(text => <li key={text}>{text}</li>)}</ul><p><strong>Cues to remember:</strong> {scenario.remember}</p><References ids={['bts', 'copd', 'abg', 'acidbase', 'rrt', 'judgment']} /></section>
          <section className="shift-debrief-section"><h2>Keep the learning going</h2><div className="shift-next-tools"><a href="/abg-lab" target="_blank" rel="noreferrer"><span>ABG LAB</span><strong>Practice respiratory acidosis <span aria-hidden="true">&#8599;</span></strong><small>Choose the respiratory acidosis example.</small></a><div><span>ASK CLINICAL EDGE</span><strong>Ask why</strong><p>{scenario.ask}</p><div className="shift-ask-links"><button className="shift-text-button" onClick={() => copy(scenario.ask, 'question')}>{copied === 'question' ? 'Question copied' : 'Copy question'}</button><a href="/ask" target="_blank" rel="noreferrer">Open Ask <span aria-hidden="true">&#8599;</span></a></div><small>Counts toward the daily Ask limit when submitted. Existing consent applies.</small></div></div></section>
          <section className="shift-tomorrow"><h2>Want another shift tomorrow?</h2><div role="group" aria-label="Want another shift tomorrow?">{['Yes', 'Maybe', 'No'].map(answer => <button key={answer} aria-pressed={progress.tomorrow === answer} onClick={() => update({ tomorrow: answer })}>{answer}{progress.tomorrow === answer && <Check />}</button>)}</div><p className="shift-small">{progress.tomorrow ? 'Saved on this device only. Not submitted.' : 'Your response stays on this device.'}</p></section>
          <div className="shift-end-actions"><button className="shift-secondary" onClick={() => setRestartOpen(true)}>Play again <span aria-hidden="true">&#8634;</span></button><details className="shift-share"><summary>Share card preview</summary><p>{scenario.share}</p><small>Preview only. Nothing is shared automatically.</small></details></div>
          <p className="shift-copy-status" role="status">{copied === 'unavailable' ? 'Clipboard unavailable. The question remains visible above.' : copied === 'question' ? 'Question copied. Nothing has been sent to Ask.' : ''}</p>
        </>}

        <footer className="shift-footer"><span>{storageFailed ? 'Device storage unavailable. Progress lasts only in this tab.' : 'Progress saved on this device'}</span><p>Fictional education only. Treatment decisions belong to the provider and facility protocol.</p><small>{scenario.reviewStatus}.</small></footer>
      </main>
    </div>
    <dialog ref={dialog} className="shift-dialog" onCancel={() => { setRoom(null); setRestartOpen(false); }} aria-labelledby="shift-dialog-title">
      <button className="shift-dialog-close" aria-label="Close dialog" onClick={closeDialog}>&times;</button>
      {restartOpen ? <><span className="shift-overline">New attempt</span><h2 id="shift-dialog-title">Restart this shift?</h2><p>This clears only this scenario's saved progress and choices.</p><div className="shift-dialog-actions"><button className="shift-secondary" onClick={closeDialog}>Keep my place</button><button className="shift-primary" onClick={restart}>Restart <span aria-hidden="true">&#8634;</span></button></div></> : selectedPatient && <><RoomNumber id={selectedPatient.id} /><h2 id="shift-dialog-title">Room {selectedPatient.id} report</h2><p>{selectedPatient.report}</p><button className="shift-secondary" onClick={closeDialog}>Return to the shift <Arrow /></button></>}
    </dialog>
  </div>;
}
