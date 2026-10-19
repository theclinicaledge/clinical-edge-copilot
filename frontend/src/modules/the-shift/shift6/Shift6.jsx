import { useEffect, useRef, useState } from 'react';
import { ClinicalEdgeMark } from '../../../components/ModuleHeader.jsx';
import '../../../styles/tokens.css';
import '../shift.css';
import './shift6.css';
import TrendReading from '../components/TrendReading.jsx';
import { SOURCES, ROOM14_VITALS, FLOWSHEET_ROWS, FLOWSHEET_SR, VERSION, assignment, d1, d2, d3, d4, d5, d6, debrief, card } from './data.js';
import { STORAGE_KEY, FINAL_STAGE, stages, freshProgress, readProgress } from './progress.js';
import { credit, d1Choice, d2Choice, d4Choice, d6Choice, evaluateCues, evaluateSbar, decisionResults } from './rules.js';
import Shift6Rewind from './Shift6Rewind.jsx';

const Arrow = () => <span aria-hidden="true">&#8594;</span>;
const Check = () => <span aria-hidden="true">&#10003;</span>;
const markFor = result => credit(result) === 'full' ? '✓' : credit(result) === 'partial' ? '◐' : '!';
const toneFor = result => credit(result) === 'full' ? 'is-correct' : credit(result) === 'partial' ? 'is-partial' : 'is-reflection';
const SELECTABLE_TIMES = d2.choices.map(choice => choice.id);

function References({ numbers }) {
  return <details className="shift-sources"><summary>Sources <span>{numbers.length}</span></summary>
    <p>Draft source mapping. Review status: {card.reviewStatus}.</p>
    <ul>{numbers.map(number => <li key={number}><a href={SOURCES[number].url} target="_blank" rel="noreferrer">{SOURCES[number].citation}</a><p>Source {number}. Supports {SOURCES[number].supports}.</p></li>)}</ul>
  </details>;
}

function Result({ result }) {
  return <span className={`s6-result ${toneFor(result)}`}>{result}{credit(result) === 'partial' && <small>Partially correct</small>}</span>;
}

function Feedback({ result, feedback, corrections = [], children, onContinue, nextLabel, sources = [] }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus({ preventScroll: true }); ref.current?.scrollIntoView({ block: 'nearest' }); }, []);
  return <section ref={ref} tabIndex={-1} className={`shift-feedback ${toneFor(result)}`} aria-label="Decision feedback">
    <div className="shift-feedback-heading"><span className="shift-feedback-mark" aria-hidden="true">{markFor(result)}</span><h3>{result}</h3>{credit(result) === 'partial' && <span className="s6-partial-note">Partially correct</span>}</div>
    {feedback && <p>{feedback}</p>}
    {corrections.map(choice => <div className="shift-correction" key={choice.id}><strong>{choice.text}</strong><p>{choice.feedback}</p></div>)}
    {children}
    {sources.length > 0 && <References numbers={sources} />}
    <button className="shift-primary" onClick={onContinue}>{nextLabel}<Arrow /></button>
  </section>;
}

function Choices({ items, answer, onChoose, label }) {
  return <div className="shift-choices" role="group" aria-label={label}>{items.map(item =>
    <button key={item.id} className={`shift-choice ${answer === item.id ? 'is-selected' : ''}`} disabled={answer !== undefined} onClick={() => onChoose(item.id)}>
      <span>{item.text}</span><span className="shift-choice-end" aria-hidden="true">{answer === item.id ? '✓' : '→'}</span>
    </button>
  )}</div>;
}

function RoomNumber({ id }) { return <span className="shift-room-number"><small>ROOM</small><strong>{id}</strong></span>; }

function ReportCards({ progress, update }) {
  return <div className="shift-reports">{assignment.patients.map(patient => {
    const opened = progress.viewed.includes(patient.room);
    return <article className={`shift-report ${opened ? 'is-read' : ''}`} key={patient.room}>
      <button className="shift-report-toggle" aria-expanded={opened} aria-controls={`s6-report-${patient.room}`} onClick={() => update({ viewed: opened ? progress.viewed.filter(id => id !== patient.room) : [...progress.viewed, patient.room] })}>
        <RoomNumber id={patient.room} /><span><strong>{patient.name}</strong></span><span aria-hidden="true">{opened ? '−' : '+'}</span>
      </button>
      {opened && <div id={`s6-report-${patient.room}`} className="shift-report-copy"><p>{patient.summary}</p><span className="shift-overline">Report from the off-going nurse</span><p>{patient.report}</p><span className="shift-overline">Starting vitals (1600)</span><p>{patient.vitals}</p></div>}
    </article>;
  })}</div>;
}

const tierList = (items, chosen, tier) => items.filter(item => item.tier === tier && chosen.includes(item.id));

export default function Shift6() {
  const [progress, setProgress] = useState(readProgress);
  const [storageFailed, setStorageFailed] = useState(false);
  const [room, setRoom] = useState(null);
  const [restartOpen, setRestartOpen] = useState(false);
  const [timeDraft, setTimeDraft] = useState(null);
  const [copied, setCopied] = useState('');
  const dialog = useRef(null);
  const heading = useRef(null);
  const firstRender = useRef(true);
  const stage = stages[progress.stage];
  const update = patch => setProgress(previous => ({ ...previous, ...patch }));
  const choose = (key, value) => setProgress(previous => previous.answers[key] === undefined ? { ...previous, answers: { ...previous.answers, [key]: value } } : previous);
  const next = () => setProgress(previous => ({ ...previous, stage: Math.min(FINAL_STAGE, previous.stage + 1) }));
  const selectedPatient = assignment.patients.find(patient => patient.room === room);
  const { answers } = progress;
  const cues = Array.isArray(answers.d3) ? evaluateCues(answers.d3) : null;
  const sbar = answers.d5 ? evaluateSbar(answers.d5) : null;
  const results = decisionResults(answers);
  const corrections = (items, chosen) => chosen?.result === 'Correct' ? [] : items.filter(item => item.result === 'Correct');

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
  function restart() { setProgress(freshProgress()); setTimeDraft(null); setCopied(''); closeDialog(); }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); setCopied('question'); }
    catch { setCopied('unavailable'); }
  }
  const toggle = (list, id) => list.includes(id) ? list.filter(item => item !== id) : [...list, id];

  return <div className="shift-app s6-app">
    <a className="shift-skip" href="#shift-main">Skip to the shift</a>
    <header className="shift-header"><div className="shift-header-inner">
      <a href="/" className="shift-brand" aria-label="Clinical Edge Home"><ClinicalEdgeMark size={27} /><span>Clinical Edge</span></a>
      <span className="shift-private">Fictional scenario <span className="s6-draft-badge">Draft v{VERSION}</span></span>
      <button className="shift-reset" onClick={() => setRestartOpen(true)} aria-label="Restart the shift" title="Restart the shift">&#8634;</button>
    </div></header>
    <div className="shift-masthead"><div><span className="shift-overline">A fictional nursing shift</span><span className="shift-wordmark">The Shift<span>.</span></span></div>
      <div className="shift-clock"><time>{stage.time.slice(0, 2)}:{stage.time.slice(2)}</time><span>MED-SURG</span></div>
    </div>
    <nav className="shift-progress" aria-label="Scenario progress"><ol>{stages.map((item, index) => <li key={item.label} aria-current={index === progress.stage ? 'step' : undefined} className={index < progress.stage ? 'is-done' : index === progress.stage ? 'is-current' : ''}><span className="shift-progress-bar" /><span className="shift-progress-label">{item.label}</span></li>)}</ol><p>{progress.stage + 1} of {stages.length} <span>{stage.label}</span></p></nav>

    <div className={`shift-layout ${progress.stage < 2 ? 'shift-layout-report' : ''}`}>
      {progress.stage >= 2 && <aside className="shift-assignment"><span className="shift-overline">Your assignment</span><div className="shift-patients">{assignment.patients.map(patient => <button key={patient.room} onClick={() => setRoom(patient.room)} className={`shift-patient-tab ${patient.room === '14' ? 'is-current' : ''}`} aria-label={`Open Room ${patient.room} report`}><RoomNumber id={patient.room} /><span><strong>{patient.name}</strong><small>Report</small></span></button>)}</div><div className="shift-assignment-note"><span>SHIFT 06 / DRAFT</span><strong>{stages[0].title}</strong><p>Fictional patients. No speed scoring.</p></div></aside>}
      <main id="shift-main" className="shift-scene">
        <div className="shift-scene-heading"><span className="shift-overline">{stage.decision ? `Decision ${progress.stage} of ${card.decisionCount}` : progress.stage === FINAL_STAGE ? 'End of shift' : `Shift 06 / ${card.estimatedTime}`}</span><h1 ref={heading} tabIndex={-1}>{stage.title}</h1></div>

        {progress.stage === 0 && <>
          <p className="shift-lead">{assignment.intro}</p>
          <ReportCards progress={progress} update={update} />
          <div className="shift-scene-actions"><span>3 fictional patients</span><button className="shift-primary" onClick={next}>Plan your first assessment <Arrow /></button></div>
        </>}

        {progress.stage === 1 && <>
          <p className="shift-lead">{d1.prompt}</p>
          <p className="s6-scene-note">{d1.scene}</p>
          <div className="shift-priority-grid">{assignment.patients.map(patient => {
            const choice = d1Choice(patient.room);
            return <article key={patient.room} className={`shift-priority-card ${answers.d1 === patient.room ? 'is-selected' : ''}`}><div><RoomNumber id={patient.room} /><span><h2>{patient.name}</h2></span></div><p>{patient.report}</p><p className="s6-card-vitals">{patient.vitals}</p><button className="shift-secondary" disabled={answers.d1 !== undefined} onClick={() => choose('d1', choice.id)}>{choice.text} <Arrow /></button></article>;
          })}</div>
          <button className="shift-station" disabled={answers.d1 !== undefined} onClick={() => choose('d1', 'flowsheets')}>{d1Choice('flowsheets').text}<Arrow /></button>
          {answers.d1 && <Feedback result={d1Choice(answers.d1).result} feedback={d1Choice(answers.d1).feedback} corrections={corrections(d1.choices, d1Choice(answers.d1))} onContinue={next} nextLabel="Go to Room 14" sources={d1.sources}><blockquote>{d1.teaching}</blockquote></Feedback>}
        </>}

        {progress.stage === 2 && <>
          <p className="shift-lead">{d2.scene}</p>
          <h2 className="s6-prompt" id="s6-d2-prompt">{d2.prompt}</h2>
          <TrendReading caption="Room 14 flowsheet" description={FLOWSHEET_SR.main} columns={ROOM14_VITALS} rows={FLOWSHEET_ROWS}
            selectable={SELECTABLE_TIMES} selected={answers.d2 ?? timeDraft} onSelect={setTimeDraft} disabled={answers.d2 !== undefined} highlight={answers.d2 ? '1200' : null} />
          {!answers.d2 && <div className="shift-cue-confirm"><p role="status">{timeDraft ? `Selected: ${ROOM14_VITALS.find(v => v.time === timeDraft).label}` : 'Select a time column. Yesterday 2000 is his admission baseline.'}</p><button className="shift-primary" disabled={!timeDraft} onClick={() => choose('d2', timeDraft)}>Confirm this time<Arrow /></button></div>}
          {answers.d2 && <Feedback result={d2Choice(answers.d2).result} feedback={d2Choice(answers.d2).feedback} corrections={corrections(d2.choices, d2Choice(answers.d2)).map(choice => ({ ...choice, text: ROOM14_VITALS.find(v => v.time === choice.id).label }))} onContinue={next} nextLabel="Go to his bedside" sources={d2.sources}><blockquote>{d2.teaching}</blockquote></Feedback>}
        </>}

        {progress.stage === 3 && <>
          <p className="shift-lead">{d3.scene}</p>
          <div className="shift-assessment-bar"><strong>Bedside findings</strong><span>{progress.revealed.length} / {d3.cues.length} revealed</span></div>
          <div className="shift-cues">{d3.cues.map(cue => {
            const revealed = progress.revealed.includes(cue.id);
            const selected = progress.selected.includes(cue.id);
            return <article key={cue.id} className={`shift-cue ${selected ? 'is-selected' : ''}`}>
              {!revealed ? <button className="shift-reveal" disabled={Boolean(cues)} onClick={() => update({ revealed: [...progress.revealed, cue.id] })}><span>{cue.label}</span><span aria-hidden="true">+</span></button> : <><span className="shift-overline">{cue.label}</span><p>{cue.text}</p><label className="shift-cue-select"><input type="checkbox" checked={selected} disabled={Boolean(cues)} onChange={() => update({ selected: toggle(progress.selected, cue.id) })} /><span>Select finding</span></label></>}
            </article>;
          })}</div>
          {!cues && <div className="shift-cue-confirm"><p>{d3.prompt}</p><button className="shift-primary" disabled={progress.selected.length === 0} onClick={() => choose('d3', [...progress.selected])}>Confirm {progress.selected.length || ''} {progress.selected.length === 1 ? 'finding' : 'findings'}<Arrow /></button></div>}
          {cues && <Feedback result={cues.result} onContinue={next} nextLabel="Make your call" sources={d3.sources}>
            <ul className="shift-essential-list">{d3.cues.filter(cue => cue.tier === 'Essential').map(cue => <li key={cue.id}><span>{answers.d3.includes(cue.id) ? 'Recognized' : 'Missed'}</span><strong>{cue.label}.</strong> {cue.feedback}</li>)}</ul>
            {[['Supporting', 'Supporting'], ['Not relevant', 'Not relevant']].map(([tier, heading]) => {
              const picked = tierList(d3.cues, answers.d3, tier);
              return picked.length > 0 && <div key={tier} className="s6-tier"><span className="shift-overline">{heading}</span><ul>{picked.map(cue => <li key={cue.id}><strong>{cue.label}.</strong> {cue.feedback}</li>)}</ul></div>;
            })}
            <blockquote>{d3.teaching}</blockquote>
          </Feedback>}
        </>}

        {progress.stage === 4 && <>
          <div className="shift-situation"><span className="shift-overline">Room 14 / At the bedside</span>{d3.cues.filter(cue => cue.tier === 'Essential').map(cue => <p key={cue.id}>{cue.label}: {cue.text}</p>)}</div>
          <TrendReading caption="Room 14 flowsheet" description={FLOWSHEET_SR.main} columns={ROOM14_VITALS} rows={FLOWSHEET_ROWS} />
          <h2 className="s6-prompt">{d4.prompt}</h2>
          <Choices items={d4.choices} answer={answers.d4} label="Calls" onChoose={id => choose('d4', id)} />
          {answers.d4 && <Feedback result={d4Choice(answers.d4).result} feedback={d4Choice(answers.d4).feedback} corrections={corrections(d4.choices, d4Choice(answers.d4))} onContinue={next} nextLabel="Make the call" sources={d4.sources}>
            <blockquote>{d4.teaching}</blockquote>
            <div className="s6-while-help"><span className="shift-overline">While help is on the way</span><p>{d4.whileHelp}</p></div>
          </Feedback>}
        </>}

        {progress.stage === 5 && <>
          <div className="shift-call-line"><span className="shift-call-dot" /><strong>{d5.scene}</strong><span>{d5.time}</span></div>
          <p className="shift-lead">{d5.prompt}</p>
          <div className="s6-sbar">{d5.sections.map(section => <fieldset key={section} className="s6-sbar-section"><legend><span>{section}</span></legend>
            {d5.chips.filter(chip => chip.section === section).map(chip => {
              const chips = answers.d5?.chips ?? progress.sbarDraft.chips;
              const on = chips.includes(chip.id);
              return <button key={chip.id} type="button" className={`s6-chip ${on ? 'is-selected' : ''}`} aria-pressed={on} disabled={Boolean(answers.d5)} onClick={() => update({ sbarDraft: { ...progress.sbarDraft, chips: toggle(progress.sbarDraft.chips, chip.id) } })}>{chip.text}</button>;
            })}
          </fieldset>)}</div>
          <fieldset className="s6-recommendation"><legend>Your recommendation</legend>{d5.recommendations.map(option => {
            const value = answers.d5?.recommendation ?? progress.sbarDraft.recommendation;
            return <label key={option.id} className={value === option.id ? 'is-selected' : ''}><input type="radio" name="s6-recommendation" value={option.id} checked={value === option.id} disabled={Boolean(answers.d5)} onChange={() => update({ sbarDraft: { ...progress.sbarDraft, recommendation: option.id } })} /><span>{option.text}</span></label>;
          })}</fieldset>
          {!answers.d5 && <div className="shift-cue-confirm"><p role="status">{progress.sbarDraft.chips.length} {progress.sbarDraft.chips.length === 1 ? 'line' : 'lines'} selected{progress.sbarDraft.recommendation ? '' : '. Pick your recommendation.'}</p><button className="shift-primary" disabled={!progress.sbarDraft.recommendation} onClick={() => choose('d5', { chips: [...progress.sbarDraft.chips], recommendation: progress.sbarDraft.recommendation })}>Give the call<Arrow /></button></div>}
          {sbar && <Feedback result={sbar.result} onContinue={next} nextLabel="Return to the hallway" sources={d5.sources}>
            <ul className="shift-essential-list">{d5.chips.filter(chip => chip.tier === 'Essential').map(chip => <li key={chip.id}><span>{answers.d5.chips.includes(chip.id) ? 'Included' : 'Missed'}</span>{chip.text} {chip.feedback}</li>)}</ul>
            {['Supporting', 'Not relevant'].map(tier => {
              const picked = tierList(d5.chips, answers.d5.chips, tier);
              return picked.length > 0 && <div key={tier} className="s6-tier"><span className="shift-overline">{tier}</span><ul>{picked.map(chip => <li key={chip.id}>{chip.text} {chip.feedback}</li>)}</ul></div>;
            })}
            <div className="s6-tier"><span className="shift-overline">Recommendation</span><p><Result result={sbar.recommendation.result} /> {sbar.recommendation.text} {sbar.recommendation.feedback}</p>
              {sbar.recommendation.result !== 'Correct' && d5.recommendations.filter(option => option.result === 'Correct').map(option => <div className="shift-correction" key={option.id}><strong>{option.text}</strong><p>{option.feedback}</p></div>)}</div>
          </Feedback>}
        </>}

        {progress.stage === 6 && <>
          <div className="shift-situation s6-room16"><span className="shift-overline">Room 16 / Call light</span>{d6.scene.map(text => <p key={text}>{text}</p>)}</div>
          <h2 className="s6-prompt">{d6.prompt}</h2>
          <Choices items={d6.choices} answer={answers.d6} label="Calls" onChoose={id => choose('d6', id)} />
          {answers.d6 && <Feedback result={d6Choice(answers.d6).result} feedback={d6Choice(answers.d6).feedback} corrections={corrections(d6.choices, d6Choice(answers.d6))} onContinue={next} nextLabel="Finish the shift" sources={d6.sources}><blockquote>{d6.teaching}</blockquote></Feedback>}
        </>}

        {progress.stage === FINAL_STAGE && <>
          <div className="shift-complete"><span><Check /></span><p>{stages[FINAL_STAGE].title}</p></div>
          <section className="shift-debrief-section"><h2>How the night unfolded</h2><ol className="shift-timeline">{debrief.outcome.map(([time, text]) => <li key={time}><time>{time}</time><p>{text}</p></li>)}</ol></section>
          <section className="shift-debrief-section"><span className="shift-overline">Personalized shift review</span><h2>Your shift review</h2><ul className="shift-reflections s6-review">{stages.filter(item => item.decision).map(item => {
            const { result, credit: earned } = results[item.decision];
            const line = debrief.review[item.decision];
            const full = earned === 'full';
            return <li key={item.decision}><span className={`shift-result-mark ${full ? 'is-recognized' : earned === 'partial' ? 's6-is-partial' : ''}`} aria-label={full ? 'Correct' : earned === 'partial' ? 'Partially correct' : 'Revisit'}>{markFor(result)}</span><div><small>{item.label}</small><strong>{full ? line.correct : line.missed}</strong><p><Result result={result} />{!full && <span className="s6-concept">Concept to strengthen: {line.concept}</span>}</p></div></li>;
          })}</ul><p className="shift-small">Learning reflection, not a clinical competency score.</p></section>
          <section className="shift-takeaways s6-takeaways" aria-label="Takeaways">{debrief.takeaways.map((text, index) => <div key={text}><span>0{index + 1}</span><p>{text}</p></div>)}</section>
          <section className="shift-debrief-section"><h2>Why it happens</h2><ul className="shift-why">{debrief.why.map(([text, number]) => <li key={text}>{text} <a className="s6-source-ref" href={SOURCES[number].url} target="_blank" rel="noreferrer">[Source {number}]</a></li>)}</ul></section>
          <section className="shift-debrief-section"><h2>Go further</h2><div className="shift-next-tools"><div><span>ASK CLINICAL EDGE</span><strong>Ask why</strong><p>{debrief.ask}</p><div className="shift-ask-links"><button className="shift-text-button" onClick={() => copy(debrief.ask)}>{copied === 'question' ? 'Question copied' : 'Copy question'}</button><a href="/ask" target="_blank" rel="noreferrer">Open Ask <span aria-hidden="true">&#8599;</span></a></div><small>Counts toward the daily Ask limit when submitted. Existing consent applies.</small></div><div><span>PLAY AGAIN</span><strong>Restart this scenario</strong><button className="shift-secondary" onClick={() => setRestartOpen(true)}>Play again <span aria-hidden="true">&#8634;</span></button></div></div>
            <Shift6Rewind /></section>
          <div className="shift-end-actions"><details className="shift-share"><summary>Share card preview</summary><p>{debrief.share}</p><small>Preview only. Nothing is shared automatically.</small></details></div>
          <section className="shift-tomorrow"><h2>{debrief.tomorrow}</h2><div role="group" aria-label={debrief.tomorrow}>{['Yes', 'Maybe', 'No'].map(answer => <button key={answer} aria-pressed={progress.tomorrow === answer} onClick={() => update({ tomorrow: answer })}>{answer}{progress.tomorrow === answer && <Check />}</button>)}</div><p className="shift-small">{progress.tomorrow ? 'Saved on this device only. Not submitted.' : 'Your response stays on this device.'}</p></section>
          <p className="shift-copy-status" role="status">{copied === 'unavailable' ? 'Clipboard unavailable. The question remains visible above.' : copied === 'question' ? 'Question copied. Nothing has been sent to Ask.' : ''}</p>
        </>}

        <footer className="shift-footer"><span>{storageFailed ? 'Device storage unavailable. Progress lasts only in this tab.' : 'Progress saved on this device'}</span><p>Fictional education only. Treatment decisions belong to the provider and facility protocol.</p><small>Review status: {card.reviewStatus}. Content review date: {card.contentReviewDate}. Version {VERSION}.</small></footer>
      </main>
    </div>
    <dialog ref={dialog} className="shift-dialog" onCancel={() => { setRoom(null); setRestartOpen(false); }} aria-labelledby="s6-dialog-title">
      <button className="shift-dialog-close" aria-label="Close dialog" onClick={closeDialog}>&times;</button>
      {restartOpen ? <><span className="shift-overline">New attempt</span><h2 id="s6-dialog-title">Restart this shift?</h2><p>This clears only this scenario's saved progress and choices.</p><div className="shift-dialog-actions"><button className="shift-secondary" onClick={closeDialog}>Keep my place</button><button className="shift-primary" onClick={restart}>Restart <span aria-hidden="true">&#8634;</span></button></div></> : selectedPatient && <><RoomNumber id={selectedPatient.room} /><h2 id="s6-dialog-title">Room {selectedPatient.room} report</h2><p>{selectedPatient.summary}</p><p>{selectedPatient.report}</p><p>{selectedPatient.vitals}</p><button className="shift-secondary" onClick={closeDialog}>Return to the shift <Arrow /></button></>}
    </dialog>
  </div>;
}
